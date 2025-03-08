
import { useState, useCallback, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { toast } from "sonner";

// Event handler for form input with validation
export interface UseInputHandlerOptions<T> {
  validator?: (value: T) => boolean;
  transform?: (value: T) => T;
  debounceMs?: number;
  onValueChange?: (value: T) => void;
}

export interface UseInputHandlerResult<T> {
  value: T;
  debouncedValue: T;
  setValue: (newValue: T) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isValid: boolean;
  reset: () => void;
}

export function useInputHandler<T>(
  initialValue: T,
  options: UseInputHandlerOptions<T> = {}
): UseInputHandlerResult<T> {
  const { validator, transform, debounceMs, onValueChange } = options;
  
  const [value, setValueState] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Create a debounced setter function if needed
  const debouncedSetValue = useMemo(
    () =>
      debounceMs
        ? debounce((newValue: T) => {
            setDebouncedValue(newValue);
          }, debounceMs)
        : (newValue: T) => {
            setDebouncedValue(newValue);
          },
    [debounceMs]
  );

  // Handle value changes with validation and transformation
  const setValue = useCallback(
    (newValue: T) => {
      // Apply transformation if provided
      const transformedValue = transform ? transform(newValue) : newValue;
      
      // Update the immediate value
      setValueState(transformedValue);
      
      // Validate the value if a validator is provided
      if (validator) {
        const validationResult = validator(transformedValue);
        setIsValid(validationResult);
      }
      
      // Update the debounced value
      debouncedSetValue(transformedValue);
      
      // Call the onChange callback if provided
      if (onValueChange) {
        onValueChange(transformedValue);
      }
    },
    [transform, validator, debouncedSetValue, onValueChange]
  );

  // Handle input change events
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value: inputValue, type, checked } = e.target as HTMLInputElement;
      
      if (type === 'checkbox') {
        setValue(checked as unknown as T);
      } else if (type === 'number' || type === 'range') {
        setValue(
          inputValue === '' ? ('' as unknown as T) : (Number(inputValue) as unknown as T)
        );
      } else {
        setValue(inputValue as unknown as T);
      }
    },
    [setValue]
  );

  // Reset handler
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue, setValue]);

  // Cleanup effect for debounce
  useEffect(() => {
    return () => {
      if (debounceMs && debouncedSetValue.cancel) {
        debouncedSetValue.cancel();
      }
    };
  }, [debounceMs, debouncedSetValue]);

  return {
    value,
    debouncedValue,
    setValue,
    handleChange,
    isValid,
    reset,
  };
}

// Form submit handler with standardized loading/error states
export interface UseFormSubmitHandlerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  resetFormOnSuccess?: boolean;
  validateBeforeSubmit?: boolean;
}

export interface UseFormSubmitHandlerResult {
  handleSubmit: (e: React.FormEvent | null) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
  success: boolean;
  reset: () => void;
}

export function useFormSubmitHandler(
  submitFn: () => Promise<void>,
  options: UseFormSubmitHandlerOptions = {}
): UseFormSubmitHandlerResult {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    successMessage = "Operation completed successfully",
    showErrorToast = true,
    errorMessage = "An error occurred",
    resetFormOnSuccess = false,
    validateBeforeSubmit = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent | null) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        await submitFn();
        setSuccess(true);
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        setError(error);
        console.error("Form submission error:", error);
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      submitFn,
      onSuccess,
      onError,
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
    ]
  );

  return {
    handleSubmit,
    isSubmitting,
    error,
    success,
    reset,
  };
}

// Toggle handler with standardized loading/error states
export interface UseToggleHandlerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

export interface UseToggleHandlerResult {
  handleToggle: () => Promise<void>;
  isToggling: boolean;
  error: Error | null;
}

export function useToggleHandler(
  toggleFn: () => Promise<void>,
  options: UseToggleHandlerOptions = {}
): UseToggleHandlerResult {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    successMessage = "Status updated successfully",
    showErrorToast = true,
    errorMessage = "Failed to update status",
  } = options;

  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleToggle = useCallback(
    async () => {
      setIsToggling(true);
      setError(null);

      try {
        await toggleFn();
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(error);
        }
      } finally {
        setIsToggling(false);
      }
    },
    [
      toggleFn,
      onSuccess,
      onError,
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
    ]
  );

  return {
    handleToggle,
    isToggling,
    error,
  };
}

// Keyboard event handler
export interface UseKeyboardHandlerOptions {
  targetKey: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardHandler(
  handler: (e: KeyboardEvent) => void,
  options: UseKeyboardHandlerOptions
): void {
  const {
    targetKey,
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
    preventDefault = true,
    stopPropagation = true,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === targetKey &&
        e.ctrlKey === ctrlKey &&
        e.altKey === altKey &&
        e.shiftKey === shiftKey &&
        e.metaKey === metaKey
      ) {
        if (preventDefault) {
          e.preventDefault();
        }
        
        if (stopPropagation) {
          e.stopPropagation();
        }
        
        handler(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handler,
    targetKey,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey,
    preventDefault,
    stopPropagation,
  ]);
}

// Mouse event handler
export interface UseMouseEventOptions {
  eventType: 'click' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave';
  targetRef?: React.RefObject<HTMLElement>;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useMouseEvent(
  handler: (e: MouseEvent) => void,
  options: UseMouseEventOptions
): void {
  const {
    eventType,
    targetRef,
    preventDefault = false,
    stopPropagation = false,
  } = options;

  useEffect(() => {
    const handleEvent = (e: MouseEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      
      if (stopPropagation) {
        e.stopPropagation();
      }
      
      handler(e);
    };

    const target = targetRef?.current || document;
    target.addEventListener(eventType, handleEvent);
    
    return () => {
      target.removeEventListener(eventType, handleEvent);
    };
  }, [handler, eventType, targetRef, preventDefault, stopPropagation]);
}

// Drag and drop handlers
export interface UseDragAndDropOptions {
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent, files?: FileList) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export interface UseDragAndDropResult {
  isDragging: boolean;
  dragProps: {
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
    onDrop: (e: React.DragEvent<HTMLElement>) => void;
  };
}

export function useDragAndDrop(
  targetRef: React.RefObject<HTMLElement>,
  options: UseDragAndDropOptions = {}
): UseDragAndDropResult {
  const {
    onDragOver,
    onDragLeave,
    onDrop,
    acceptedFileTypes = [],
    maxFileSize,
  } = options;

  const [isDragging, setIsDragging] = useState(false);

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      
      if (onDragOver) {
        onDragOver(e.nativeEvent);
      }
    },
    [onDragOver]
  );

  // Handle drag leave
  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      
      if (onDragLeave) {
        onDragLeave(e.nativeEvent);
      }
    },
    [onDragLeave]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      
      const { files } = e.dataTransfer;
      
      // Validate file types
      if (acceptedFileTypes.length > 0 && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileType = file.type;
          
          if (!acceptedFileTypes.some((type) => fileType.includes(type))) {
            toast.error(`File type not accepted: ${fileType}`);
            return;
          }
          
          // Validate file size
          if (maxFileSize && file.size > maxFileSize) {
            toast.error(`File too large: ${file.name}`);
            return;
          }
        }
      }
      
      if (onDrop) {
        onDrop(e.nativeEvent, files);
      }
    },
    [onDrop, acceptedFileTypes, maxFileSize]
  );

  useEffect(() => {
    const target = targetRef.current;
    
    if (!target) return;
    
    const dragOverHandler = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
      if (onDragOver) onDragOver(e);
    };
    
    const dragLeaveHandler = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (onDragLeave) onDragLeave(e);
    };
    
    const dropHandler = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (onDrop) onDrop(e, e.dataTransfer?.files);
    };
    
    target.addEventListener('dragover', dragOverHandler);
    target.addEventListener('dragleave', dragLeaveHandler);
    target.addEventListener('drop', dropHandler);
    
    return () => {
      target.removeEventListener('dragover', dragOverHandler);
      target.removeEventListener('dragleave', dragLeaveHandler);
      target.removeEventListener('drop', dropHandler);
    };
  }, [targetRef, onDragOver, onDragLeave, onDrop]);

  return {
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
