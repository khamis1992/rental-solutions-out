
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleQueryResult } from "@/lib/queryUtils";

export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  total_amount: number;
  rent_amount: number;
  remaining_amount: number;
  daily_late_fee: number;
  payment_status: string | null;
  payment_frequency: string;
  last_payment_date: string | null;
  next_payment_date: string | null;
  processed_content: string | null;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email?: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  remaining_amounts?: {
    remaining_amount: number;
  }[];
}

export const useAgreements = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["agreements", searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("leases")
          .select(`
            *,
            customer:customer_id (
              id, 
              full_name, 
              phone_number, 
              email
            ),
            vehicle:vehicle_id (
              id, 
              make, 
              model, 
              year, 
              license_plate
            ),
            remaining_amounts (
              remaining_amount
            )
          `)
          .order("created_at", { ascending: false });

        if (searchQuery) {
          query = query.or(
            `agreement_number.ilike.%${searchQuery}%,customer.full_name.ilike.%${searchQuery}%,vehicle.license_plate.ilike.%${searchQuery}%`
          );
        }

        const result = await query;
        const agreements = handleQueryResult<Agreement[]>(result, []);

        // Handle nulls & transform data if needed
        return agreements || [];
      } catch (error) {
        console.error("Error fetching agreements:", error);
        toast.error("Failed to fetch agreements");
        throw error;
      }
    },
    refetchOnWindowFocus: false
  });
};
