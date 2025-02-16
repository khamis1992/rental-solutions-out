
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form/FormField";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CreateLeadDTO } from "@/types/sales.types";

interface PreregisteredFormProps {
  vehicleTypes: { id: string; name: string; status: string }[];
  onSubmit: (data: CreateLeadDTO) => Promise<void>;
}

export function PreregisteredForm({ vehicleTypes, onSubmit }: PreregisteredFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLeadDTO>({
    defaultValues: {
      budget_min: 1400
    }
  });

  const onSubmitForm = async (data: CreateLeadDTO) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      reset();
      toast.success("Lead created successfully");
    } catch (error) {
      toast.error("Failed to create lead");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-gray-900">New Lead Registration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Full Name"
          error={errors.full_name?.message}
          required
        >
          <Input
            {...register("full_name", { required: "Full name is required" })}
            placeholder="Enter full name"
          />
        </FormField>

        <FormField
          label="Phone Number"
          error={errors.phone_number?.message}
          required
        >
          <Input
            {...register("phone_number", { required: "Phone number is required" })}
            placeholder="Enter phone number"
          />
        </FormField>

        <FormField
          label="Nationality"
          error={errors.nationality?.message}
          required
        >
          <Input
            {...register("nationality", { required: "Nationality is required" })}
            placeholder="Enter nationality"
          />
        </FormField>

        <FormField
          label="Email"
          error={errors.email?.message}
          required
        >
          <Input
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            type="email"
            placeholder="Enter email address"
          />
        </FormField>

        <FormField
          label="Preferred Vehicle Type"
          error={errors.preferred_vehicle_type?.message}
          required
        >
          <Select
            onValueChange={(value) => {
              register("preferred_vehicle_type").onChange({
                target: { value, name: "preferred_vehicle_type" }
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem 
                  key={type.id} 
                  value={type.id}
                  disabled={type.status !== 'active'}
                >
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Minimum Budget"
          error={errors.budget_min?.message}
          required
        >
          <Input
            {...register("budget_min", { 
              required: "Minimum budget is required",
              min: { value: 1400, message: "Minimum budget must be at least 1400" }
            })}
            type="number"
            defaultValue={1400}
          />
        </FormField>

        <FormField
          label="Maximum Budget"
          error={errors.budget_max?.message}
        >
          <Input
            {...register("budget_max", {
              min: { value: 1400, message: "Maximum budget must be at least 1400" }
            })}
            type="number"
            placeholder="Enter maximum budget"
          />
        </FormField>
      </div>

      <FormField
        label="Notes"
        error={errors.notes?.message}
      >
        <Input
          {...register("notes")}
          placeholder="Enter any additional notes"
        />
      </FormField>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </motion.form>
  );
}
