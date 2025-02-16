
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead, LeadStatus } from "@/types/sales-lead";
import { toast } from "sonner";

interface UseLeadsListParams {
  page?: number;
  perPage?: number;
  filters?: {
    status?: LeadStatus;
    search?: string;
  };
}

interface UseLeadsListReturn {
  leads: SalesLead[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLead: (lead: Partial<SalesLead> & { id: string }) => Promise<void>;
}

export function useLeadsList({
  page = 1,
  perPage = 10,
  filters,
}: UseLeadsListParams = {}): UseLeadsListReturn {
  const queryClient = useQueryClient();

  // Calculate range for pagination
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["leads", page, perPage, filters],
    queryFn: async () => {
      // Start with the base query
      let query = supabase
        .from("sales_leads")
        .select("*", { count: "exact" });

      // Add filters if they exist
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Add pagination
      query = query.range(start, end).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        leads: data as SalesLead[],
        totalCount: count || 0,
      };
    },
  });

  // Setup real-time subscription
  React.useEffect(() => {
    const subscription = supabase
      .channel("sales_leads_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales_leads",
        },
        () => {
          // Refetch data when changes occur
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales_leads")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (lead: Partial<SalesLead> & { id: string }) => {
      const { error } = await supabase
        .from("sales_leads")
        .update(lead)
        .eq("id", lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated successfully");
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    },
  });

  return {
    leads: data?.leads || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    isError,
    error,
    refetch,
    deleteLead: deleteMutation.mutate,
    updateLead: updateMutation.mutate,
  };
}
