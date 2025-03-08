
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VehicleFormData } from "@/types/vehicle";

export const useVehicleForm = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
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
  });

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const { error } = await supabase.from("vehicles").insert({
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        color: data.color,
        license_plate: data.license_plate,
        vin: data.vin,
        mileage: parseInt(data.mileage),
        description: data.description,
      });

      if (error) throw error;

      toast.success("Vehicle added successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };

  return {
    open,
    setOpen,
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
