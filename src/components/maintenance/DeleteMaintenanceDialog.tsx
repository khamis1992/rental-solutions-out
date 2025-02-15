
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceStatus } from "@/types/maintenance";

interface DeleteMaintenanceDialogProps {
  id: string;
  vehicleId: string;
  status: MaintenanceStatus;
}

export const DeleteMaintenanceDialog = ({ id, vehicleId, status }: DeleteMaintenanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("maintenance")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Maintenance record deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting maintenance:", error);
      toast.error("Failed to delete maintenance record");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hover:bg-red-50 transition-colors duration-300"
      >
        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-500 transition-colors duration-300" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Maintenance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this maintenance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
