
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleStatus } from '@/types/vehicle';
import { toast } from 'sonner';
import { ChartDataPoint, StatusGroup } from '@/types/dashboard.types';
import { getStatusGroup, STATUS_CONFIG } from '@/components/dashboard/enhanced/VehicleStatusConfig';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export const useVehicleMetrics = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) throw error;
      
      setVehicles(data as Vehicle[]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching vehicles for metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vehicle metrics'));
      toast.error('Failed to load vehicle metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();

    // Subscribe to real-time updates for vehicles
    const vehicleSubscription = supabase
      .channel('vehicle-metrics')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles' 
        }, 
        () => fetchVehicles()
      )
      .subscribe();

    return () => {
      vehicleSubscription.unsubscribe();
    };
  }, []);

  // Compute status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  // Group statuses
  const statusGroups = useMemo(() => {
    const grouped: Record<string, { status: VehicleStatus; count: number }[]> = {
      operational: [],
      attention: [],
      critical: [],
    };

    Object.entries(statusCounts).forEach(([status, count]) => {
      const group = getStatusGroup(status);
      grouped[group].push({
        status: status as VehicleStatus,
        count,
      });
    });

    return grouped;
  }, [statusCounts]);

  // Format for chart display
  const chartData: ChartDataPoint[] = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "#6B7280",
    }));
  }, [statusCounts]);

  // Compute grouped statuses for UI components
  const groupedStatuses = useMemo<StatusGroup[]>(() => {
    return [
      {
        name: 'operational',
        items: statusGroups.operational,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      },
      {
        name: 'attention',
        items: statusGroups.attention,
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />
      },
      {
        name: 'critical',
        items: statusGroups.critical,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      }
    ];
  }, [statusGroups]);

  // Calculate total vehicles and critical count
  const totalVehicles = vehicles.length;
  const criticalCount = statusGroups.critical.reduce((sum, item) => sum + item.count, 0);

  return {
    vehicles,
    statusCounts,
    statusGroups,
    groupedStatuses,
    chartData,
    isLoading,
    error,
    lastUpdate,
    totalVehicles,
    criticalCount,
    refreshVehicles: fetchVehicles
  };
};
