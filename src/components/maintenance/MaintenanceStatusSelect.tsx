
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaintenanceStatus } from "@/types/maintenance";

interface MaintenanceStatusSelectProps {
  id: string;
  status: MaintenanceStatus;
  vehicleId: string;
}

export const MaintenanceStatusSelect = ({ id, status, vehicleId }: MaintenanceStatusSelectProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("maintenance")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update vehicle status if maintenance is completed
      if (newStatus === "completed") {
        const { error: vehicleError } = await supabase
          .from("vehicles")
          .update({ status: "available" })
          .eq("id", vehicleId);

        if (vehicleError) throw vehicleError;
      }

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={value => handleStatusChange(value as MaintenanceStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
        <SelectItem value="urgent">Urgent</SelectItem>
        <SelectItem value="accident">Accident</SelectItem>
      </SelectContent>
    </Select>
  );
};
