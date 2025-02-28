
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSearch = (debouncedSearch: string) => {
  return useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) {
        return { vehicles: [], customers: [], agreements: [] };
      }

      try {
        const [vehiclesPromise, customersPromise, agreementsPromise] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, make, model, year, license_plate, color, vin, status")
            .ilike("make", `%${debouncedSearch}%`)
            .or(`model.ilike.%${debouncedSearch}%,license_plate.ilike.%${debouncedSearch}%,vin.ilike.%${debouncedSearch}%,color.ilike.%${debouncedSearch}%`)
            .limit(5),

          supabase
            .from("profiles")
            .select("id, full_name, phone_number, email, status, profile_completion_score")
            .ilike("full_name", `%${debouncedSearch}%`)
            .or(`phone_number.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
            .limit(5),

          supabase
            .from("leases")
            .select(`
              id, 
              agreement_number, 
              start_date,
              end_date,
              status,
              total_amount,
              customer_id,
              vehicles(make, model, license_plate),
              profiles(full_name)
            `)
            .ilike("agreement_number", `%${debouncedSearch}%`)
            .limit(5),
        ]);

        return {
          vehicles: vehiclesPromise.data || [],
          customers: customersPromise.data || [],
          agreements: agreementsPromise.data || [],
        };
      } catch (error) {
        toast.error("Failed to fetch search results");
        throw error;
      }
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 30000,
    gcTime: 60000,
    retry: 1,
  });
};
