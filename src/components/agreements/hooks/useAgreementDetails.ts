
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Agreement, AgreementWithRelations } from "@/types/agreement.types";

// Type definitions for API responses
interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  email?: string | null;
  nationality?: string | null;
  driver_license?: string | null;
}

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface RemainingAmount {
  rent_amount?: number;
  final_price?: number;
  remaining_amount?: number;
}

interface UnifiedPayment {
  id: string;
  amount: number;
  amount_paid: number;
  payment_date: string | null;
  payment_method: string | null;
  status: string | null;
  late_fine_amount: number;
  days_overdue?: number;
  balance?: number;
  description?: string;
  actual_payment_date?: string | null;
}

// Type guards
function isAgreementWithRelations(data: any): data is AgreementWithRelations {
  return data !== null && typeof data === 'object' && 'id' in data;
}

export const useAgreementDetails = (agreementId: string, enabled: boolean) => {
  const { data: agreement, isLoading, error, refetch } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      // Early return if no valid ID
      if (!agreementId || agreementId === "undefined") {
        throw new Error('Invalid agreement ID');
      }

      try {
        // First attempt: using join with dot notation
        const { data: agreementData, error } = await supabase
          .from('leases')
          .select(`
            *,
            customer:customer_id(
              id,
              full_name,
              phone_number,
              address
            ),
            vehicle:vehicle_id(
              id,
              make,
              model,
              year,
              license_plate
            ),
            remainingAmount:remaining_amounts!remaining_amounts_lease_id_fkey (
              rent_amount,
              final_price,
              remaining_amount
            ),
            unified_payments (
              id,
              amount,
              amount_paid,
              payment_date,
              payment_method,
              status,
              late_fine_amount
            ),
            processed_content,
            template_id
          `)
          .eq('id', agreementId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching agreement:', error);
          
          // Second attempt: get the agreement first then fetch related data
          const { data: fallbackAgreementData, error: agreementError } = await supabase
            .from('leases')
            .select('*')
            .eq('id', agreementId)
            .maybeSingle();
            
          if (agreementError) {
            throw agreementError;
          }
          
          if (!fallbackAgreementData) {
            throw new Error('Agreement not found');
          }
          
          // Fetch customer
          const { data: customerData } = await supabase
            .from('profiles')
            .select('id, full_name, phone_number, address')
            .eq('id', fallbackAgreementData.customer_id)
            .maybeSingle();
            
          // Fetch vehicle
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('id, make, model, year, license_plate')
            .eq('id', fallbackAgreementData.vehicle_id)
            .maybeSingle();
            
          // Fetch remaining amount
          const { data: remainingData } = await supabase
            .from('remaining_amounts')
            .select('rent_amount, final_price, remaining_amount')
            .eq('lease_id', agreementId)
            .maybeSingle();
            
          // Fetch payments
          const { data: paymentsData } = await supabase
            .from('unified_payments')
            .select('id, amount, amount_paid, payment_date, payment_method, status, late_fine_amount')
            .eq('lease_id', agreementId);
          
          // Combine all the data
          const combinedData = {
            ...fallbackAgreementData,
            customer: customerData || null,
            vehicle: vehicleData || null,
            remainingAmount: remainingData ? [remainingData] : [],
            unified_payments: paymentsData || []
          };
          
          // Ensure the result conforms to expected type
          if (isAgreementWithRelations(combinedData)) {
            return combinedData;
          } else {
            throw new Error('Failed to build complete agreement data');
          }
        }

        if (!agreementData) {
          throw new Error('Agreement not found');
        }

        // Type check the result
        if (isAgreementWithRelations(agreementData)) {
          return agreementData;
        } else {
          throw new Error('Invalid agreement data format');
        }
      } catch (err) {
        console.error('Error in agreement details query:', err);
        toast.error('Failed to fetch agreement details');
        throw err;
      }
    },
    enabled: enabled && !!agreementId && agreementId !== "undefined",
    retry: 1, // Try once more if failed
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  return {
    agreement,
    isLoading,
    error,
    refetch
  };
};
