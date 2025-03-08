
import { useState, useCallback } from 'react';
import { z } from 'zod';

interface FormValidationOptions<T> {
  schema?: z.ZodType<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  onValid?: (values: T) => void;
  onInvalid?: (errors: FormErrors<T>) => void;
}

export type FormErrors<T> = Partial<Record<keyof T, string[]>>;

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: FormValidationOptions<T> = {}
) {
  const {
    schema,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    onValid,
    onInvalid
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validate single field
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!schema) return true;

      try {
        // Create a partial schema for just this field
        const partialSchema = z.object({ [name]: schema.shape[name] } as any);
        partialSchema.parse({ [name]: value });
        
        // Clear any existing errors for this field
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(prev => ({
            ...prev,
            [name]: error.errors.map(e => e.message)
          }));
        }
        return false;
      }
    },
    [schema]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    if (!schema) return true;
    
    try {
      schema.parse(values);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors<T> = {};
        
        error.errors.forEach(err => {
          const path = err.path[0] as keyof T;
          if (!newErrors[path]) {
            newErrors[path] = [];
          }
          newErrors[path]!.push(err.message);
        });
        
        setErrors(newErrors);
        setIsValid(false);
        
        if (onInvalid) {
          onInvalid(newErrors);
        }
      }
      return false;
    }
  }, [schema, values, onInvalid]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let processedValue = value;
      
      // Handle checkbox inputs
      if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      }
      
      setValues(prev => ({
        ...prev,
        [name]: processedValue
      }));
      
      if (validateOnChange && touched[name as keyof T]) {
        validateField(name as keyof T, processedValue);
      }
    },
    [validateOnChange, touched, validateField]
  );

  // Set field value programmatically 
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (validateOnChange && touched[name]) {
        validateField(name, value);
      }
    },
    [validateOnChange, touched, validateField]
  );

  // Mark field as touched
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched = true) => {
      setTouched(prev => ({
        ...prev,
        [name]: isTouched
      }));
      
      if (validateOnBlur && isTouched) {
        validateField(name, values[name]);
      }
    },
    [validateOnBlur, values, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T);
    },
    [setFieldTouched]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      setIsSubmitting(true);
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);
      
      let isFormValid = true;
      if (validateOnSubmit) {
        isFormValid = validateForm();
      }
      
      if (isFormValid && onValid) {
        onValid(values);
      }
      
      setIsSubmitting(false);
      return isFormValid;
    },
    [values, validateOnSubmit, validateForm, onValid]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm
  };
}
