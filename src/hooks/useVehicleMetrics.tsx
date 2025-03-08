
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { toast } from "sonner";
import { VehicleStatus } from "@/types/vehicle";
import { ChartDataPoint } from "@/types/dashboard.types";
import { STATUS_CONFIG } from "@/components/dashboard/enhanced/VehicleStatusConfig";

export interface VehicleMetricsOptions {
  includeRetired?: boolean;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export interface VehicleMetricsResult {
  chartData: ChartDataPoint[];
  statusDistribution: Record<VehicleStatus, number>;
  utilizationRate: number;
  maintenanceRate: number;
  availabilityRate: number;
  vehiclesByStatus: Record<VehicleStatus, number>;
  totalVehicles: number;
  activeVehicles: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useVehicleMetrics = (options: VehicleMetricsOptions = {}): VehicleMetricsResult => {
  const { includeRetired = false, timeframe = 'month' } = options;

  const { data: vehicles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["vehicles-metrics", includeRetired, timeframe],
    queryFn: async () => {
      try {
        let query = supabase
          .from("vehicles")
          .select("*");

        if (!includeRetired) {
          query = query.neq('status', 'retired');
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error fetching vehicle metrics:", error);
        toast.error("Failed to fetch vehicle metrics");
        return [];
      }
    },
  });

  // Calculate metrics based on the vehicles data
  const statusDistribution = useMemo(() => {
    const counts: Record<VehicleStatus, number> = {} as Record<VehicleStatus, number>;
    vehicles.forEach((vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    return Object.entries(statusDistribution).map(([status, count]) => ({
      name: STATUS_CONFIG[status as VehicleStatus]?.label || status,
      value: count,
      color: STATUS_CONFIG[status as VehicleStatus]?.color || "#6B7280",
    }));
  }, [statusDistribution]);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status !== 'retired').length;
  
  const availabilityRate = useMemo(() => {
    const availableCount = statusDistribution['available'] || 0;
    return totalVehicles > 0 ? (availableCount / totalVehicles) * 100 : 0;
  }, [statusDistribution, totalVehicles]);

  const utilizationRate = useMemo(() => {
    const rentedCount = statusDistribution['rented'] || 0;
    const totalActiveVehicles = activeVehicles;
    return totalActiveVehicles > 0 ? (rentedCount / totalActiveVehicles) * 100 : 0;
  }, [statusDistribution, activeVehicles]);

  const maintenanceRate = useMemo(() => {
    const maintenanceCount = (statusDistribution['maintenance'] || 0) + (statusDistribution['pending_repair'] || 0);
    return totalVehicles > 0 ? (maintenanceCount / totalVehicles) * 100 : 0;
  }, [statusDistribution, totalVehicles]);

  return {
    chartData,
    statusDistribution,
    utilizationRate,
    maintenanceRate,
    availabilityRate,
    vehiclesByStatus: statusDistribution,
    totalVehicles,
    activeVehicles,
    isLoading,
    error,
    refetch: async () => { await refetch(); }
  };
};
