
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormData } from "./types/customer";
import { z } from "zod";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useEffect } from "react";

interface CustomCustomerFormFieldsProps {
  form: UseFormReturn<CustomerFormData>;
  customerId?: string;
}

// Define validation schema for customer form fields
const phoneRegex = /^\+?[\d\s-]{10,}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const customerFieldSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must have at least 2 characters")
    .max(100, "Full name is too long"),
  phone_number: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  nationality: z
    .string()
    .min(2, "Nationality should have at least 2 characters")
    .optional()
    .or(z.literal('')),
  driver_license: z
    .string()
    .min(3, "Driver license should have at least 3 characters")
    .optional()
    .or(z.literal('')),
  id_document_expiry: z
    .string()
    .optional()
    .or(z.literal('')),
  license_document_expiry: z
    .string()
    .optional()
    .or(z.literal(''))
});

export const CustomCustomerFormFields = ({
  form,
  customerId
}: CustomCustomerFormFieldsProps) => {
  // Use our enhanced form validation to provide additional validation features
  const validation = useFormValidation(
    {
      full_name: form.getValues('full_name') || '',
      phone_number: form.getValues('phone_number') || '',
      email: form.getValues('email') || '',
      address: form.getValues('address') || '',
      nationality: form.getValues('nationality') || '',
      driver_license: form.getValues('driver_license') || '',
      id_document_expiry: form.getValues('id_document_expiry') || '',
      license_document_expiry: form.getValues('license_document_expiry') || ''
    },
    {
      schema: customerFieldSchema,
      validateOnChange: true,
      validateOnBlur: true
    }
  );

  // Sync the validation results with the form
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

  // Sync form values with validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        validation.setFieldValue(name as any, form.getValues(name));
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validation]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter full name" 
                {...field} 
                value={field.value || ''} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('full_name');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('full_name', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input 
                type="text"
                placeholder="Enter phone number"
                {...field}
                value={field.value || ''}
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('phone_number');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('phone_number', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="Enter email" 
                {...field} 
                value={field.value || ''}
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('email');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('email', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter address" 
                {...field} 
                value={field.value || ''}
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('address');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('address', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nationality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nationality</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter nationality" 
                {...field} 
                value={field.value || ''}
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('nationality');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('nationality', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="driver_license"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Driver License</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter driver license number" 
                {...field} 
                value={field.value || ''}
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('driver_license');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('driver_license', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="id_document_expiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ID Document Expiry</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                value={field.value || ''} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('id_document_expiry');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('id_document_expiry', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="license_document_expiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Document Expiry</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                value={field.value || ''} 
                onBlur={(e) => {
                  field.onBlur();
                  validation.setFieldTouched('license_document_expiry');
                }}
                onChange={(e) => {
                  field.onChange(e);
                  validation.setFieldValue('license_document_expiry', e.target.value);
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
