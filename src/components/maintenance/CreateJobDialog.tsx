
/**
 * CreateJobDialog Component
 * 
 * This component provides a dialog for creating new maintenance job cards.
 * It handles the creation process, validation, and submission of maintenance records.
 * 
 * Part of the maintenance module, it enables users to initiate maintenance work
 * by creating job cards that track maintenance activities for vehicles.
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { JobCardForm } from "./job-card/JobCardForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Props interface for the CreateJobDialog component
 * 
 * @property open - Boolean controlling dialog visibility
 * @property onOpenChange - Callback when dialog open state changes
 */
interface CreateJobDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog component for creating new maintenance job cards
 */
export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  // State for form submission
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ----- Section: Data Fetching -----
  // Fetch available vehicles for maintenance
  const { data: vehicles = [] } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      console.log("Fetching available vehicles...");
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate")
        .eq("status", "available");

      if (error) throw error;
      console.log("Available vehicles:", data);
      return data;
    },
  });

  // Fetch maintenance categories
  const { data: categories = [] } = useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_categories")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  // Form data state
  const [formData, setFormData] = useState({
    vehicle_id: "",
    category_id: "",
    service_type: "",
    description: "",
    scheduled_date: "",
    cost: "",
  });

  /**
   * Checks if there are existing job cards for the selected vehicle
   * 
   * @param vehicleId - ID of the vehicle to check
   * @returns Boolean indicating if vehicle has existing active job cards
   */
  const checkExistingJobCard = async (vehicleId: string) => {
    console.log("Checking existing job cards for vehicle:", vehicleId);
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .in("status", ["scheduled", "in_progress"]);

      if (error) {
        console.error("Error checking existing job cards:", error);
        throw error;
      }

      console.log("Existing job cards:", data);
      return data.length > 0;
    } catch (error) {
      console.error("Error checking existing job cards:", error);
      throw error;
    }
  };

  /**
   * Handles form submission to create a new job card
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ----- Section: Validation -----
      // Check if vehicle already has active job cards
      const hasExistingJobCard = await checkExistingJobCard(formData.vehicle_id);
      if (hasExistingJobCard) {
        toast.error(
          "A job card already exists for this vehicle. Please complete or cancel the existing job card first."
        );
        return;
      }

      // ----- Section: Job Card Creation -----
      // Create the maintenance record
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .insert([
          {
            vehicle_id: formData.vehicle_id,
            category_id: formData.category_id,
            service_type: formData.service_type,
            description: formData.description,
            scheduled_date: formData.scheduled_date,
            cost: formData.cost ? parseFloat(formData.cost) : null,
            status: "scheduled",
          },
        ])
        .select()
        .single();

      if (maintenanceError) throw maintenanceError;

      // Update vehicle status to maintenance
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "maintenance" })
        .eq("id", formData.vehicle_id);

      if (vehicleError) throw vehicleError;

      // Notify success and navigate to inspection page
      toast.success("Job card created successfully");
      if (onOpenChange) onOpenChange(false);
      navigate(`/maintenance/${maintenance.id}/inspection`);
    } catch (error: any) {
      console.error("Error creating job card:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ----- Section: Dialog UI -----
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] px-1">
          <JobCardForm
            formData={formData}
            vehicles={vehicles}
            categories={categories}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
