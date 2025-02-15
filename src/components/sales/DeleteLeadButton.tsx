
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteLeadButtonProps {
  leadId: string;
  className?: string;
}

export function DeleteLeadButton({ leadId, className }: DeleteLeadButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error, data } = await supabase
        .from("sales_leads")
        .delete()
        .eq("id", leadId)
        .select();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Lead deleted successfully");
      // Immediately invalidate and refetch the leads query
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead. Please try again.");
      setShowConfirmDialog(false);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className={className}
        onClick={() => setShowConfirmDialog(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Lead
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
