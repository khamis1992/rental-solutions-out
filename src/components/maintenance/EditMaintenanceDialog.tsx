import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useState } from "react";
import { MaintenanceRecord, MaintenanceStatus } from "@/types/maintenance";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceStatusSelect } from "./MaintenanceStatusSelect";
import { useQueryClient } from "@tanstack/react-query";

interface EditMaintenanceDialogProps {
  record: MaintenanceRecord;
}

export const EditMaintenanceDialog = ({ record }: EditMaintenanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceRecord>({
    defaultValues: record
  });

  const onSubmit = async (data: MaintenanceRecord) => {
    try {
      const { error } = await supabase
        .from("maintenance")
        .update({
          service_type: data.service_type,
          description: data.description,
          status: data.status,
          cost: data.cost,
          scheduled_date: data.scheduled_date,
          completed_date: data.completed_date,
          performed_by: data.performed_by,
          notes: data.notes
        })
        .eq("id", record.id);

      if (error) throw error;

      toast.success("Maintenance record updated successfully");
      queryClient.invalidateQueries(["maintenance"]);
      setOpen(false);
    } catch (error) {
      console.error("Error updating maintenance:", error);
      toast.error("Failed to update maintenance record");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hover:bg-blue-50 transition-colors duration-300"
      >
        <Edit className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors duration-300" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Maintenance Record</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Input
                id="service_type"
                {...register("service_type", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                {...register("cost", { min: 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                {...register("scheduled_date", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completed_date">Completed Date</Label>
              <Input
                id="completed_date"
                type="date"
                {...register("completed_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performed_by">Performed By</Label>
              <Input
                id="performed_by"
                {...register("performed_by")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
