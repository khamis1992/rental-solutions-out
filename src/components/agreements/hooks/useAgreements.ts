
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Agreement } from "@/types/agreement.types";

export const useAgreements = () => {
  return useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leases")
          .select(`
            id,
            agreement_number,
            agreement_type,
            customer_id,
            vehicle_id,
            start_date,
            end_date,
            status,
            total_amount,
            initial_mileage,
            return_mileage,
            notes,
            created_at,
            updated_at,
            rent_amount,
            remaining_amount,
            daily_late_fee,
            payment_status,
            last_payment_date,
            next_payment_date,
            payment_frequency,
            template_id,
            customer:customer_id (
              id,
              full_name,
              phone_number,
              email,
              status
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

        if (error) {
          console.error("Error fetching agreements:", error);
          toast.error("Failed to fetch agreements");
          throw error;
        }

        // Transform the data to ensure it matches the Agreement type
        const agreements: Agreement[] = data.map(agreement => ({
          ...agreement,
          payment_status: agreement.payment_status as Agreement['payment_status'], // Ensure correct type casting
          remaining_amounts: agreement.remaining_amounts || []
        }));

        return agreements;
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

export type { Agreement };  // Export Agreement type to fix the error in AgreementListContent
