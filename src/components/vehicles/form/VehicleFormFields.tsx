
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VehicleFormData } from "@/types/vehicle";
import { VehicleFormFieldsProps } from "@/types/ui.types";
import { z } from "zod";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useEffect } from "react";

// Define validation schema for vehicle form
const vehicleSchema = z.object({
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

export const VehicleFormFields = ({ form }: VehicleFormFieldsProps) => {
  // Use our enhanced form validation for additional validation capabilities
  const validation = useFormValidation(
    {
      make: form.getValues('make') || '',
      model: form.getValues('model') || '',
      year: form.getValues('year') || '',
      color: form.getValues('color') || '',
      license_plate: form.getValues('license_plate') || '',
      vin: form.getValues('vin') || '',
      mileage: form.getValues('mileage') || '',
      description: form.getValues('description') || '',
    },
    {
      schema: vehicleSchema,
      validateOnChange: true,
      validateOnBlur: true
    }
  );

  // Sync validation errors with the form
  useEffect(() => {
    if (Object.keys(validation.errors).length > 0) {
      Object.entries(validation.errors).forEach(([field, errors]) => {
        form.setError(field as any, {
          type: 'manual',
          message: errors[0]
        });
      });
    }
  }, [validation.errors, form]);

  // Sync form values with validation state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        validation.setFieldValue(name as any, form.getValues(name));
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validation]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="make"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Make</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Toyota" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('make');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('make', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Camry" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('model');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('model', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g., 2024" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('year');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('year', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Silver" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('color');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('color', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="license_plate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Plate</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., ABC123" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('license_plate');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('license_plate', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VIN</FormLabel>
            <FormControl>
              <Input 
                placeholder="Vehicle Identification Number" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('vin');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('vin', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="mileage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mileage</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g., 50000" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('mileage');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('mileage', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Vehicle description" 
                {...field} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('description');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('description', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
