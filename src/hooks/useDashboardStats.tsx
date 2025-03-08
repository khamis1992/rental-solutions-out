
import { useQueryState } from "@/hooks/useQueryState";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard.types";
import { isDefined } from "@/lib/queryUtils";
import { UseDashboardStatsResult } from "@/types/hooks.types";
import { safeTransform } from "@/lib/transformUtils";
import { useFormSubmitHandler } from "@/hooks/useEventHandlers";
import { useCallback } from "react";

export const useDashboardStats = (): UseDashboardStatsResult => {
  const queryResult = useQueryState<DashboardStats, Error, DashboardStats>(
    ["dashboardStats"],
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        
        if (error) {
          throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
        }
        
        if (!data) {
          throw new Error("No data returned from dashboard stats");
        }
        
        // Type-safe transformation of the data using our utility function
        const stats: DashboardStats = safeTransform(
          data,
          (data) => ({
            total_vehicles: validateNumberField(data.total_vehicles, 'total_vehicles'),
            available_vehicles: validateNumberField(data.available_vehicles, 'available_vehicles'),
            rented_vehicles: validateNumberField(data.rented_vehicles, 'rented_vehicles'),
            maintenance_vehicles: validateNumberField(data.maintenance_vehicles, 'maintenance_vehicles'),
            total_customers: validateNumberField(data.total_customers, 'total_customers'),
            active_rentals: validateNumberField(data.active_rentals, 'active_rentals'),
            monthly_revenue: validateNumberField(data.monthly_revenue, 'monthly_revenue'),
          }),
          {
            total_vehicles: 0,
            available_vehicles: 0,
            rented_vehicles: 0,
            maintenance_vehicles: 0,
            total_customers: 0,
            active_rentals: 0,
            monthly_revenue: 0,
          }
        );
        
        return stats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      showErrorToast: true,
      errorMessage: "Failed to load dashboard statistics"
    }
  );

  // Use our standardized form submit handler for the refetch operation
  const refreshHandler = useFormSubmitHandler(
    async () => {
      await queryResult.refetch();
    },
    () => console.log("Dashboard stats refreshed successfully"),
    (error) => console.error("Error refreshing dashboard stats:", error)
  );

  // Create a more convenient refetch function that handles loading state
  const refetchWithLoading = useCallback(async () => {
    refreshHandler.handleSubmit(null);
  }, [refreshHandler]);

  return {
    data: queryResult.data || null,
    isLoading: queryResult.isLoading || refreshHandler.isSubmitting,
    error: queryResult.error || refreshHandler.error,
    refetch: refetchWithLoading,
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
