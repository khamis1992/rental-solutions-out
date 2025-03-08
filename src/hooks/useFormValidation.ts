
import { useCallback } from "react";
import { z } from "zod";
import { UseFormSetError } from "react-hook-form";

/**
 * Common validation schemas for reuse across forms
 */
export const commonValidations = {
  email: z.string().email("Please enter a valid email address"),
  
  name: z.string().min(2, "Name must be at least 2 characters"),
  
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  
  required: z.string().min(1, "This field is required"),
  
  number: z.number().or(
    z.string().refine(val => !isNaN(Number(val)), "Must be a valid number")
    .transform(val => Number(val))
  ),
  
  positiveNumber: z.number().or(
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number")
    .transform(val => Number(val))
  ),
  
  date: z.date().or(
    z.string().refine(
      val => !isNaN(Date.parse(val)), 
      "Please enter a valid date"
    )
    .transform(val => new Date(val))
  ),
  
  futureDate: z.date().or(
    z.string().refine(
      val => !isNaN(Date.parse(val)) && new Date(val) > new Date(), 
      "Date must be in the future"
    )
    .transform(val => new Date(val))
  ),
};

/**
 * Hook to handle form validation errors from API responses
 */
export function useFormValidationErrors<T extends Record<string, any>>() {
  const handleValidationErrors = useCallback(
    (errors: Record<string, string>, setError: UseFormSetError<T>) => {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field as any, {
          type: "manual",
          message,
        });
      });
    },
    []
  );

  return { handleValidationErrors };
}

/**
 * Utility to extract form validation errors from API response
 */
export function extractValidationErrors(error: any): Record<string, string> {
  if (!error) return {};
  
  // Handle Supabase errors
  if (error.code === "23505") {
    // Unique constraint error
    return { 
      // Try to extract field name from message
      [error.details?.split(/[()]/)?.at(1) || "field"]: "This value already exists"
    };
  }
  
  // Handle custom validation errors format
  if (error.errors && typeof error.errors === "object") {
    return error.errors;
  }
  
  // Handle error messages
  if (error.message) {
    return { _error: error.message };
  }
  
  return { _error: "An unknown error occurred" };
}
