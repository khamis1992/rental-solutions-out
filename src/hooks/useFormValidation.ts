
import { useState, useEffect, useCallback } from "react";
import { ZodSchema, z } from "zod";
import { toast } from "sonner";

/**
 * Type for a validation field with value, errors, and validation state
 */
export interface ValidationField<T> {
  value: T;
  errors: string[];
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

/**
 * Options for configuring field validation
 */
export interface FieldValidationOptions<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: T) => boolean | string;
  customError?: string;
  dependencies?: any[];
}

/**
 * Configuration for form validation
 */
export interface FormValidationConfig<T> {
  schema?: ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (errors: Record<string, string[]>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  autoScrollToErrors?: boolean;
}

/**
 * Result from the useFormValidation hook
 */
export interface FormValidationResult<T> {
  values: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  validateField: (field: keyof T) => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Hook for form validation using Zod schemas
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  config: FormValidationConfig<T> = {}
): FormValidationResult<T> {
  const {
    schema,
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    autoScrollToErrors = true,
  } = config;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty({});
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!schema) return true;

      try {
        // Extract just the field we want to validate
        const fieldValue = { [field]: values[field] };
        
        // Create a partial schema for just this field
        const partialSchema = z.object({ [field]: (schema as any).shape[field] });
        
        partialSchema.parse(fieldValue);
        
        // Clear errors for this field if validation passes
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors
            .filter((err) => err.path[0] === field)
            .map((err) => err.message);
          
          setErrors((prev) => ({
            ...prev,
            [field as string]: fieldErrors,
          }));
          
          return fieldErrors.length === 0;
        }
        return false;
      }
    },
    [schema, values]
  );

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    if (!schema) return true;

    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!formattedErrors[field]) {
            formattedErrors[field] = [];
          }
          formattedErrors[field].push(err.message);
        });
        
        setErrors(formattedErrors);
        
        if (autoScrollToErrors && Object.keys(formattedErrors).length > 0) {
          // Scroll to the first field with an error
          const firstErrorField = document.querySelector(
            `[name="${Object.keys(formattedErrors)[0]}"]`
          );
          
          if (firstErrorField) {
            firstErrorField.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
        
        if (onError) {
          onError(formattedErrors);
        }
        
        return false;
      }
      return false;
    }
  }, [schema, values, autoScrollToErrors, onError]);

  // Set a field's value
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
      
      setDirty((prev) => ({
        ...prev,
        [field]: true,
      }));
      
      if (validateOnChange) {
        validateField(field);
      }
    },
    [validateOnChange, validateField]
  );

  // Mark a field as touched (usually on blur)
  const setFieldTouched = useCallback(
    (field: keyof T, isTouched = true) => {
      setTouched((prev) => ({
        ...prev,
        [field]: isTouched,
      }));
      
      if (validateOnBlur && isTouched) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      setIsSubmitting(true);
      
      const isValid = validateOnSubmit ? validateForm() : true;
      
      if (isValid && onSubmit) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Form submission error:", error);
          toast.error("An error occurred while submitting the form.");
        }
      }
      
      setIsSubmitting(false);
    },
    [validateOnSubmit, validateForm, onSubmit, values]
  );

  // Handle input change events
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      let parsedValue: any = value;
      
      // Handle different input types
      if (type === "checkbox") {
        parsedValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        parsedValue = value === "" ? "" : Number(value);
      }
      
      setFieldValue(name as keyof T, parsedValue);
    },
    [setFieldValue]
  );

  // Handle input blur events
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T);
    },
    [setFieldTouched]
  );

  // Calculate overall form validity
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    resetForm,
    validateForm,
    validateField,
    handleSubmit,
    handleChange,
    handleBlur,
  };
}

/**
 * Create a validation field with initial state
 */
export function createValidationField<T>(initialValue: T): ValidationField<T> {
  return {
    value: initialValue,
    errors: [],
    isValid: true,
    isDirty: false,
    isTouched: false,
  };
}

/**
 * Validate a field using the provided options
 */
export function validateField<T>(
  field: ValidationField<T>,
  options: FieldValidationOptions<T> = {}
): ValidationField<T> {
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    validate,
    customError,
  } = options;

  const errors: string[] = [];
  let isValid = true;

  // Check if required
  if (required && (field.value === null || field.value === undefined || field.value === "")) {
    errors.push(customError || "This field is required");
    isValid = false;
  }

  // Check string length constraints if the value is a string
  if (typeof field.value === "string") {
    const strValue = field.value as string;
    
    if (minLength !== undefined && strValue.length < minLength) {
      errors.push(customError || `Must be at least ${minLength} characters`);
      isValid = false;
    }
    
    if (maxLength !== undefined && strValue.length > maxLength) {
      errors.push(customError || `Must be at most ${maxLength} characters`);
      isValid = false;
    }
    
    if (pattern && !pattern.test(strValue)) {
      errors.push(customError || "Invalid format");
      isValid = false;
    }
  }

  // Run custom validation function
  if (validate && field.value !== null && field.value !== undefined) {
    const result = validate(field.value);
    
    if (result !== true) {
      errors.push(typeof result === "string" ? result : customError || "Invalid value");
      isValid = false;
    }
  }

  return {
    ...field,
    errors,
    isValid,
  };
}
