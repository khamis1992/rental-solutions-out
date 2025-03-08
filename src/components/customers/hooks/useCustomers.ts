
import { useQueryState } from "@/hooks/useQueryState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Customer } from "../types/customer";
import { buildQuery } from "@/lib/supabaseUtils";
import { Profile } from "@/types/supabase.types";
import { safeTransform, safeArray } from "@/lib/transformUtils";
import { useComponentState } from "@/hooks/useComponentState";
import { useCallback } from "react";
import { useInputHandler } from "@/hooks/useEventHandlers";

interface UseCustomersOptions {
  searchQuery: string;
  page: number;
  pageSize: number;
}

interface UseCustomersResult {
  customers: Customer[];
  totalCount: number;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  debouncedSearchQuery: string;
}

export const useCustomers = ({ searchQuery, page, pageSize }: UseCustomersOptions): UseCustomersResult => {
  // Use our standardized input handler for search with debouncing
  const searchHandler = useInputHandler(searchQuery, {
    debounceMs: 300, // 300ms debounce for search
    transform: (value) => value.trim() // Trim whitespace from search input
  });

  // Use our component state for managing search state
  const { state: searchState, updateState: updateSearchState } = useComponentState({
    currentSearchTerm: searchQuery,
    previousSearchTerm: '',
    hasSearched: false
  });

  // Track if the search has changed for analytics
  if (searchState.currentSearchTerm !== searchQuery) {
    updateSearchState({ 
      previousSearchTerm: searchState.currentSearchTerm,
      currentSearchTerm: searchQuery,
      hasSearched: true 
    });
  }

  // Use our enhanced query state management
  const queryResult = useQueryState<{ customers: Customer[], totalCount: number }, Error>(
    ['customers', searchHandler.debouncedValue, page, pageSize],
    async () => {
      try {
        console.log("Fetching customers with search:", searchHandler.debouncedValue);
        
        // First get total count for pagination
        const countQuery = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'customer'); // Only count customers

        if (searchHandler.debouncedValue) {
          countQuery.or(`full_name.ilike.%${searchHandler.debouncedValue}%,phone_number.ilike.%${searchHandler.debouncedValue}%,driver_license.ilike.%${searchHandler.debouncedValue}%`);
        }

        const countResult = await countQuery;
        const totalCount = countResult.count || 0;

        // Then fetch paginated data using our type-safe utilities
        const baseQuery = supabase
          .from('profiles')
          .select('*');
          
        const query = buildQuery(baseQuery, {
          filters: { 
            role: 'customer' 
          },
          page,
          pageSize,
          sort: { field: 'created_at', direction: 'desc' }
        });
          
        // Add search filter if provided
        let customerQuery = query;
        if (searchHandler.debouncedValue) {
          customerQuery = customerQuery.or(
            `full_name.ilike.%${searchHandler.debouncedValue}%,phone_number.ilike.%${searchHandler.debouncedValue}%,driver_license.ilike.%${searchHandler.debouncedValue}%`
          );
        }

        const result = await customerQuery;
        
        if (result.error) throw result.error;
        
        // Transform database records to match our Customer type using the safe transform utility
        const profileData = result.data || [];
        
        const customers = safeTransform(
          profileData,
          (profiles) => safeArray(profiles).map((record: Profile) => ({
            id: record.id,
            full_name: record.full_name || '',
            phone_number: record.phone_number || '',
            email: record.email || '',
            address: record.address || '',
            driver_license: record.driver_license || '',
            id_document_url: record.id_document_url || '',
            license_document_url: record.license_document_url || '',
            contract_document_url: record.contract_document_url || '',
            created_at: record.created_at || '',
            role: record.role as 'customer' | 'staff' | 'admin',
            status: record.status as Customer['status'],
            document_verification_status: record.document_verification_status as Customer['document_verification_status'],
            profile_completion_score: record.profile_completion_score || 0,
            merged_into: record.merged_into || null,
            nationality: record.nationality || '',
            id_document_expiry: record.id_document_expiry || null,
            license_document_expiry: record.license_document_expiry || null
          })),
          []
        );
        
        console.log("Fetched customers:", customers.length, "records");
        return {
          customers,
          totalCount,
        };
      } catch (err) {
        console.error("Error in customer query:", err);
        throw new Error(err instanceof Error ? err.message : "Failed to fetch customers");
      }
    },
    {
      retry: 1,
      staleTime: 30000, // Consider data fresh for 30 seconds
      showErrorToast: true,
      errorMessage: "Failed to fetch customers"
    }
  );

  return {
    customers: queryResult.data?.customers || [],
    totalCount: queryResult.data?.totalCount || 0,
    error: queryResult.error,
    isLoading: queryResult.isLoading,
    refetch: async () => { await queryResult.refetch(); },
    handleSearchChange: searchHandler.handleChange,
    debouncedSearchQuery: searchHandler.debouncedValue
  };
};
