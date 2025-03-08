
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface VehicleMetrics {
  fleetUtilization: number;
  avgDailyRevenue: number;
  maintenanceRate: number;
  revenueGrowth: number;
  estimatedMaintenanceCost: number;
  mileageStats: {
    avg: number;
    max: number;
    min: number;
  };
  statusDistribution: Record<string, number>;
}

export interface UseVehicleMetricsOptions {
  refreshInterval?: number;
  includeRealTimeUpdates?: boolean;
}

export const useVehicleMetrics = (options: UseVehicleMetricsOptions = {}) => {
  const { refreshInterval = 60000, includeRealTimeUpdates = true } = options;
  const [realtimeUpdates, setRealtimeUpdates] = useState<Partial<VehicleMetrics>>({});

  // Fetch initial metrics
  const { data: initialMetrics, error, isLoading, refetch } = useQuery({
    queryKey: ["vehicle-metrics"],
    queryFn: async () => {
      // Fetch vehicle data for calculations
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*");
      
      if (vehiclesError) throw vehiclesError;
      
      // Fetch lease data for revenue calculations
      const { data: leases, error: leasesError } = await supabase
        .from("leases")
        .select("*");
        
      if (leasesError) throw leasesError;
      
      // Fetch maintenance data for cost estimates
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*");
        
      if (maintenanceError) throw maintenanceError;
      
      // Calculate fleet utilization
      const totalVehicles = vehicles.length;
      const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
      const fleetUtilization = totalVehicles > 0 
        ? Math.round((rentedVehicles / totalVehicles) * 100) 
        : 0;
      
      // Calculate average daily revenue
      const activeLeases = leases.filter(l => l.status === 'active');
      const totalDailyRevenue = activeLeases.reduce((sum, lease) => sum + (lease.rent_amount || 0), 0);
      const avgDailyRevenue = activeLeases.length > 0 
        ? totalDailyRevenue / activeLeases.length 
        : 0;
      
      // Calculate maintenance rate
      const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
      const maintenanceRate = totalVehicles > 0 
        ? Math.round((maintenanceVehicles / totalVehicles) * 100) 
        : 0;
      
      // Calculate estimated maintenance cost
      const estimatedMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.estimated_cost || 0), 0);
      
      // Calculate revenue growth (mock data for now)
      const revenueGrowth = 5.2; // 5.2% growth
      
      // Calculate mileage statistics
      const mileages = vehicles.map(v => v.mileage || 0).filter(m => m > 0);
      const avgMileage = mileages.length > 0 
        ? Math.round(mileages.reduce((sum, m) => sum + m, 0) / mileages.length) 
        : 0;
      const maxMileage = mileages.length > 0 ? Math.max(...mileages) : 0;
      const minMileage = mileages.length > 0 ? Math.min(...mileages) : 0;
      
      // Calculate status distribution
      const statusDistribution: Record<string, number> = {};
      vehicles.forEach(vehicle => {
        statusDistribution[vehicle.status] = (statusDistribution[vehicle.status] || 0) + 1;
      });
      
      return {
        fleetUtilization,
        avgDailyRevenue,
        maintenanceRate,
        revenueGrowth,
        estimatedMaintenanceCost,
        mileageStats: {
          avg: avgMileage,
          max: maxMileage,
          min: minMileage
        },
        statusDistribution
      };
    },
    refetchInterval: refreshInterval
  });

  // Set up real-time subscriptions for metrics updates
  useEffect(() => {
    if (!includeRealTimeUpdates) return;

    // Listen for vehicle status changes
    const vehicleSubscription = supabase
      .channel('metrics-vehicle-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'vehicles',
          filter: 'status=eq.rented OR status=eq.available OR status=eq.maintenance'
        }, 
        async (payload) => {
          // Recalculate metrics that depend on vehicle status
          const { data: vehicles, error } = await supabase
            .from("vehicles")
            .select("status");
          
          if (error) {
            console.error('Error fetching vehicles for metrics update:', error);
            return;
          }
          
          const totalVehicles = vehicles.length;
          const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
          const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
          
          setRealtimeUpdates(prev => ({
            ...prev,
            fleetUtilization: totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0,
            maintenanceRate: totalVehicles > 0 ? Math.round((maintenanceVehicles / totalVehicles) * 100) : 0,
            statusDistribution: {
              rented: rentedVehicles,
              maintenance: maintenanceVehicles,
              available: vehicles.filter(v => v.status === 'available').length
            }
          }));
        }
      )
      .subscribe();

    // Listen for maintenance cost updates
    const maintenanceSubscription = supabase
      .channel('metrics-maintenance-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'maintenance' 
        }, 
        async (payload) => {
          // Recalculate maintenance costs
          const { data, error } = await supabase
            .from("maintenance")
            .select("estimated_cost");
          
          if (error) {
            console.error('Error fetching maintenance for metrics update:', error);
            return;
          }
          
          const totalCost = data.reduce((sum, m) => sum + (m.estimated_cost || 0), 0);
          
          setRealtimeUpdates(prev => ({
            ...prev,
            estimatedMaintenanceCost: totalCost
          }));
        }
      )
      .subscribe();

    return () => {
      vehicleSubscription.unsubscribe();
      maintenanceSubscription.unsubscribe();
    };
  }, [includeRealTimeUpdates]);

  // Combine the initial metrics with real-time updates
  const combinedMetrics: VehicleMetrics | undefined = initialMetrics
    ? {
        ...initialMetrics,
        ...realtimeUpdates,
        // For nested objects, we need to merge them explicitly
        statusDistribution: {
          ...(initialMetrics.statusDistribution || {}),
          ...(realtimeUpdates.statusDistribution || {})
        },
        mileageStats: {
          ...(initialMetrics.mileageStats || { avg: 0, max: 0, min: 0 }),
          ...(realtimeUpdates.mileageStats || {})
        }
      }
    : undefined;

  return {
    metrics: combinedMetrics,
    error,
    isLoading,
    refetch
  };
};
