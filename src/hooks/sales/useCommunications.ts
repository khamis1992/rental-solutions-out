
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationService } from "@/services/sales/communicationService";
import { toast } from "sonner";

export const useCommunications = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: communications,
    isLoading,
    error
  } = useQuery({
    queryKey: ["lead-communications", leadId],
    queryFn: () => communicationService.getCommunications(leadId)
  });

  const addCommunication = useMutation({
    mutationFn: (content: string) => 
      communicationService.addCommunication(leadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-communications", leadId] });
      toast.success("Communication added successfully");
    },
    onError: () => {
      toast.error("Failed to add communication");
    }
  });

  return {
    communications,
    isLoading,
    error,
    addCommunication
  };
};
