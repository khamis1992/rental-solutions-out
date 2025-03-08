
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VehicleFormData } from "@/types/vehicle";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormSubmitHandler } from "@/hooks/useEventHandlers";

// Define the vehicle form schema using Zod
const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required").max(50, "Make is too long"),
  model: z.string().min(1, "Model is required").max(50, "Model is too long"),
  year: z.string()
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear() + 1,
      { message: "Year must be between 1900 and next year" }
    ),
  color: z.string().min(1, "Color is required").max(30, "Color is too long"),
  license_plate: z.string()
    .min(2, "License plate is required")
    .max(20, "License plate is too long"),
  vin: z.string()
    .min(1, "VIN is required")
    .max(30, "VIN is too long"),
  mileage: z.string()
    .refine(
      (val) => val === "" || (!isNaN(parseInt(val)) && parseInt(val) >= 0),
      { message: "Mileage must be a positive number" }
    ),
  description: z.string().max(500, "Description is too long").optional(),
});

export const useVehicleForm = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Use react-hook-form with zod resolver for validation
  const form = useForm<VehicleFormData>({
    defaultValues: {
      make: "",
      model: "",
      year: "",
      color: "",
      license_plate: "",
      vin: "",
      mileage: "",
      description: "",
    },
    resolver: zodResolver(vehicleFormSchema),
  });

  // Define the submit handler function
  const submitVehicle = async () => {
    const data = form.getValues();
    
    const { error } = await supabase.from("vehicles").insert({
      make: data.make,
      model: data.model,
      year: parseInt(data.year),
      color: data.color,
      license_plate: data.license_plate,
      vin: data.vin,
      mileage: parseInt(data.mileage) || 0,
      description: data.description,
    });

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    setOpen(false);
    form.reset();
  };

  // Use our standardized form submit handler
  const submitHandler = useFormSubmitHandler(submitVehicle, {
    successMessage: "Vehicle added successfully",
    errorMessage: "Failed to add vehicle",
    showSuccessToast: true,
    showErrorToast: true,
    resetFormOnSuccess: true
  });

  return {
    open,
    setOpen,
    form,
    onSubmit: form.handleSubmit(() => submitHandler.handleSubmit(null)),
    isSubmitting: submitHandler.isSubmitting,
    error: submitHandler.error
  };
};
