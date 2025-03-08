
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, DashboardConfig } from "@/types/dashboard.types";
import { useState } from "react";

export const useDashboardStats = (initialConfig: Partial<DashboardConfig> = {}) => {
  const [config, setConfig] = useState<DashboardConfig>({
    refreshInterval: 30000, // 30 seconds
    showAvailableVehicles: true,
    showRentedVehicles: true,
    showMaintenanceVehicles: true,
    showTotalCustomers: true,
    showActiveRentals: true,
    showMonthlyRevenue: true,
    ...initialConfig
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_dashboard_stats');

        if (error) {
          throw error;
        }

        // Parse the JSON response
        return data as DashboardStats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to fetch dashboard statistics");
        return null;
      }
    },
    refetchInterval: config.refreshInterval,
  });

  const updateConfig = (newConfig: Partial<DashboardConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  return {
    stats: data,
    isLoading,
    error,
    refetch,
    config,
    updateConfig
  };
};
