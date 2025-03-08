
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard.types";
import { isDefined } from "@/lib/queryUtils";
import { UseDashboardStatsResult } from "@/types/hooks.types";
import { QueryResponse } from "@/types/supabase.types";
import { callDatabaseFunction } from "@/lib/supabaseUtils";

export const useDashboardStats = (): UseDashboardStatsResult => {
  const queryResult = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const dashboardStats = await callDatabaseFunction<DashboardStats>("get_dashboard_stats");
        
        if (!dashboardStats) {
          throw new Error("Failed to fetch dashboard stats");
        }
        
        // Type-safe transformation of the data
        const stats: DashboardStats = {
          total_vehicles: validateNumberField(dashboardStats.total_vehicles, 'total_vehicles'),
          available_vehicles: validateNumberField(dashboardStats.available_vehicles, 'available_vehicles'),
          rented_vehicles: validateNumberField(dashboardStats.rented_vehicles, 'rented_vehicles'),
          maintenance_vehicles: validateNumberField(dashboardStats.maintenance_vehicles, 'maintenance_vehicles'),
          total_customers: validateNumberField(dashboardStats.total_customers, 'total_customers'),
          active_rentals: validateNumberField(dashboardStats.active_rentals, 'active_rentals'),
          monthly_revenue: validateNumberField(dashboardStats.monthly_revenue, 'monthly_revenue'),
        };
        
        return stats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    data: queryResult.data || null,
    isLoading: queryResult.isLoading,
    error: queryResult.error instanceof Error ? queryResult.error : null,
    refetch: async () => { await queryResult.refetch(); },
    status: queryResult.status,
    isStale: queryResult.isStale,
    lastUpdated: queryResult.dataUpdatedAt ? new Date(queryResult.dataUpdatedAt) : undefined
  };
};

// Helper function to validate numeric fields from the API response
function validateNumberField(value: unknown, fieldName: string): number {
  if (isDefined(value) && typeof value === 'number') {
    return value;
  }
  console.warn(`Invalid ${fieldName} value:`, value);
  return 0;
}
