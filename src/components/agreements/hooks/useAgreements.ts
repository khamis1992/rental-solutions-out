
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
          id: agreement.id,
          agreement_number: agreement.agreement_number,
          agreement_type: agreement.agreement_type,
          customer_id: agreement.customer_id,
          vehicle_id: agreement.vehicle_id,
          start_date: agreement.start_date,
          end_date: agreement.end_date,
          status: agreement.status,
          total_amount: agreement.total_amount,
          initial_mileage: agreement.initial_mileage,
          return_mileage: agreement.return_mileage,
          notes: agreement.notes,
          created_at: agreement.created_at,
          updated_at: agreement.updated_at,
          rent_amount: agreement.rent_amount || 0,
          remaining_amount: agreement.remaining_amount || 0,
          daily_late_fee: agreement.daily_late_fee || 0,
          payment_status: agreement.payment_status,
          last_payment_date: agreement.last_payment_date,
          next_payment_date: agreement.next_payment_date,
          payment_frequency: agreement.payment_frequency,
          template_id: agreement.template_id,
          customer: agreement.customer,
          vehicle: agreement.vehicle,
          remaining_amounts: agreement.remaining_amounts
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
