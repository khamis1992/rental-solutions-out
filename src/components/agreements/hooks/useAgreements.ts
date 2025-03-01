
/**
 * useAgreements Hook
 * 
 * This custom hook handles fetching and filtering agreement data from the Supabase database.
 * It manages the connection with the backend, handles error cases, and provides a unified
 * interface for retrieving agreement data throughout the application.
 * 
 * Features:
 * - Fetches agreements with related customer and vehicle data
 * - Handles search functionality to filter agreements
 * - Provides graceful fallbacks for database relationship issues
 * - Implements caching through React Query
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Agreement interface that defines the shape of agreement data
 * This is used throughout the application to ensure type safety
 */
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

/**
 * Custom hook for fetching and filtering agreements
 * 
 * @param searchQuery - Optional search string to filter agreements
 * @returns Query object containing agreements data, loading state, and error info
 */
export const useAgreements = (searchQuery: string = "") => {
  return useQuery({
    queryKey: ["agreements", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching agreements...");
        console.log("Search query:", searchQuery);
        
        // ----- Section: First Query Approach -----
        // Try direct join with specific relationship constraint
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

        // ----- Section: Fallback Query Approach -----
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

        // ----- Section: Search Filtering -----
        // Filter by search query if provided
        let filteredData = data;
        if (searchQuery && searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase().trim();
          filteredData = data.filter((agreement: any) => {
            // Check agreement number
            if (agreement.agreement_number && 
                agreement.agreement_number.toLowerCase().includes(query)) {
              return true;
            }
            
            // Check customer name
            if (agreement.customer && 
                agreement.customer.full_name && 
                agreement.customer.full_name.toLowerCase().includes(query)) {
              return true;
            }
            
            // Check vehicle license plate
            if (agreement.vehicle && 
                agreement.vehicle.license_plate && 
                agreement.vehicle.license_plate.toLowerCase().includes(query)) {
              return true;
            }
            
            // Check vehicle make and model
            if (agreement.vehicle) {
              const vehicleInfo = `${agreement.vehicle.make} ${agreement.vehicle.model}`.toLowerCase();
              if (vehicleInfo.includes(query)) {
                return true;
              }
            }
            
            return false;
          });
        }

        console.log(`Retrieved ${filteredData.length} agreements after filtering`);
        return filteredData as Agreement[];
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};
