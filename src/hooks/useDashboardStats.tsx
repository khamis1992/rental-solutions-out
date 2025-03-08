
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard.types";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const { data, error } = await supabase.rpc("get_dashboard_stats");
        
        if (error) {
          throw error;
        }
        
        // Handle the response as a proper JSON object
        if (typeof data === 'object' && data !== null) {
          // Handle the response and ensure it matches our expected type
          const stats: DashboardStats = {
            total_vehicles: typeof data.total_vehicles === 'number' ? data.total_vehicles : 0,
            available_vehicles: typeof data.available_vehicles === 'number' ? data.available_vehicles : 0,
            rented_vehicles: typeof data.rented_vehicles === 'number' ? data.rented_vehicles : 0,
            maintenance_vehicles: typeof data.maintenance_vehicles === 'number' ? data.maintenance_vehicles : 0,
            total_customers: typeof data.total_customers === 'number' ? data.total_customers : 0,
            active_rentals: typeof data.active_rentals === 'number' ? data.active_rentals : 0,
            monthly_revenue: typeof data.monthly_revenue === 'number' ? data.monthly_revenue : 0,
          };
          
          return stats;
        } else {
          throw new Error("Invalid data format received from dashboard stats RPC");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
