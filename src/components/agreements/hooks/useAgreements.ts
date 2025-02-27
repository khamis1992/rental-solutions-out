
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agreement {
  id: string;
  agreement_number: string | null;
  agreement_type: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  initial_mileage: number;
  return_mileage: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_status: string | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string | null;
  rent_amount?: number;
  daily_late_fee?: number;
  processed_content?: string;
  customer?: {
    id: string;
    full_name: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export const useAgreements = () => {
  return useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        console.log("Fetching agreements...");
        
        // First try direct join with specific relationship constraint
        let { data, error } = await supabase
          .from("leases")
          .select(`
            *,
            customer:profiles(
              id,
              full_name
            ),
            vehicle:vehicles(
              id,
              make,
              model,
              year,
              license_plate
            )
          `)
          .order("created_at", { ascending: false });

        // If the first query fails, try a second approach using the customer_id explicitly
        if (error) {
          console.error("First query approach failed:", error);
          
          // Get all agreements first
          const { data: agreements, error: agreementsError } = await supabase
            .from("leases")
            .select(`
              *,
              vehicle:vehicles(
                id,
                make,
                model,
                year,
                license_plate
              )
            `)
            .order("created_at", { ascending: false });
            
          if (agreementsError) {
            console.error("Error fetching agreements:", agreementsError);
            toast.error("Failed to fetch agreements");
            throw agreementsError;
          }
          
          // For each agreement, get the customer details separately
          if (agreements && agreements.length > 0) {
            const customerIds = agreements.map(agreement => agreement.customer_id);
            
            const { data: customers, error: customersError } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", customerIds);
              
            if (customersError) {
              console.error("Error fetching customers:", customersError);
            } else if (customers) {
              // Add customer details to agreements
              data = agreements.map(agreement => {
                const customer = customers.find(c => c.id === agreement.customer_id);
                return {
                  ...agreement,
                  customer: customer || null
                };
              });
            }
          } else {
            data = [];
          }
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        console.log(`Retrieved ${data.length} agreements`);
        return data as Agreement[];
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};
