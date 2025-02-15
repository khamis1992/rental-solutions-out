
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/sales/leadService";
import { toast } from "sonner";
import type { SalesLead } from "@/types/sales.types";

export const useLeadDetails = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: lead,
    isLoading,
    error
  } = useQuery({
    queryKey: ["lead-details", leadId],
    queryFn: () => leadService.getLeadDetails(leadId)
  });

  const updateLead = useMutation({
    mutationFn: (updates: Partial<SalesLead>) => 
      leadService.updateLead(leadId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-details", leadId] });
      toast.success("Lead updated successfully");
    },
    onError: () => {
      toast.error("Failed to update lead");
    }
  });

  return {
    lead,
    isLoading,
    error,
    updateLead
  };
};
