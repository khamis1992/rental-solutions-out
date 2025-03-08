
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DashboardStats } from "@/types/dashboard.types";

export const useDashboardStats = () => {
  const [realtimeStats, setRealtimeStats] = useState<Partial<DashboardStats>>({});

  const { data: statsData, error, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from dashboard stats");
      }

      // Convert the data to the correct format
      const statsData: DashboardStats = {
        total_vehicles: Number(data.total_vehicles || 0),
        available_vehicles: Number(data.available_vehicles || 0),
        rented_vehicles: Number(data.rented_vehicles || 0),
        maintenance_vehicles: Number(data.maintenance_vehicles || 0),
        total_customers: Number(data.total_customers || 0),
        active_rentals: Number(data.active_rentals || 0),
        monthly_revenue: Number(data.monthly_revenue || 0)
      };

      return statsData;
    },
    meta: {
      onError: (err: Error) => {
        toast.error("Failed to load dashboard stats: " + err.message);
      }
    }
  });

  // Set up real-time subscriptions for stats updates
  useEffect(() => {
    // Set up the real-time subscriptions
    const vehiclesSubscription = supabase
      .channel('dashboard-vehicles-stats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vehicles' 
      }, (payload) => {
        // Fetch updated vehicle counts 
        fetchUpdatedVehicleCounts();
      })
      .subscribe();

    const leasesSubscription = supabase
      .channel('dashboard-leases-stats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leases' 
      }, (payload) => {
        // Fetch updated rental counts
        fetchUpdatedRentalCounts();
      })
      .subscribe();

    const paymentsSubscription = supabase
      .channel('dashboard-payments-stats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'unified_payments' 
      }, (payload) => {
        // Update revenue on new payments
        if (payload.new && typeof payload.new.amount === 'number') {
          setRealtimeStats(prev => ({
            ...prev,
            monthly_revenue: (prev.monthly_revenue || 0) + Number(payload.new.amount)
          }));
        }
      })
      .subscribe();

    return () => {
      vehiclesSubscription.unsubscribe();
      leasesSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch updated vehicle counts
  const fetchUpdatedVehicleCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('status', { count: 'exact' });

      if (error) throw error;

      // Count vehicles by status
      const available = data.filter(v => v.status === 'available').length;
      const rented = data.filter(v => v.status === 'rented').length;
      const maintenance = data.filter(v => v.status === 'maintenance').length;
      
      setRealtimeStats(prev => ({
        ...prev,
        total_vehicles: data.length,
        available_vehicles: available,
        rented_vehicles: rented,
        maintenance_vehicles: maintenance
      }));
    } catch (error) {
      console.error('Error fetching updated vehicle counts:', error);
    }
  };

  // Helper function to fetch updated rental counts
  const fetchUpdatedRentalCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('status', { count: 'exact' })
        .eq('status', 'active');

      if (error) throw error;

      setRealtimeStats(prev => ({
        ...prev,
        active_rentals: data.length
      }));
    } catch (error) {
      console.error('Error fetching updated rental counts:', error);
    }
  };

  // Combine the initial data with real-time updates
  const combinedStats: DashboardStats | undefined = statsData
    ? {
        ...statsData,
        ...realtimeStats
      }
    : undefined;

  return {
    stats: combinedStats,
    error,
    isLoading,
    refetch
  };
};
