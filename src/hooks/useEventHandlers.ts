
import { useState, useCallback, ChangeEvent, MouseEvent, KeyboardEvent, FocusEvent } from 'react';
import { useDebounce } from './use-debounce';

/**
 * Type definitions for event handlers
 */
export type InputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type MouseEventHandler = (e: MouseEvent<HTMLElement>) => void;
export type KeyboardEventHandler = (e: KeyboardEvent<HTMLElement>) => void;
export type FocusEventHandler = (e: FocusEvent<HTMLElement>) => void;

export interface UseInputHandlerOptions {
  /** Validation function to check input value */
  validator?: (value: string) => boolean;
  /** Transform function to modify input value */
  transform?: (value: string) => string;
  /** Callback when validation fails */
  onInvalid?: (value: string) => void;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

/**
 * Hook for handling input changes with validation, transformation, and debouncing
 */
export function useInputHandler(
  initialValue: string = '', 
  options: UseInputHandlerOptions = {}
) {
  const { 
    validator, 
    transform, 
    onInvalid,
    debounceMs 
  } = options;
  
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  
  const handleChange = useCallback<InputChangeHandler>((e) => {
    const newValue = e.target.value;
    let transformedValue = transform ? transform(newValue) : newValue;
    
    if (validator) {
      const valid = validator(transformedValue);
      setIsValid(valid);
      
      if (!valid && onInvalid) {
        onInvalid(transformedValue);
      }
    }
    
    setValue(transformedValue);
  }, [validator, transform, onInvalid]);
  
  // Create debounced value if debounceMs is provided
  const debouncedValue = debounceMs 
    ? useDebounce(value, debounceMs)
    : value;
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setIsValid(true);
  }, [initialValue]);
  
  return {
    value,
    debouncedValue,
    isValid,
    handleChange,
    setValue,
    reset
  };
}

/**
 * Hook for handling toggle state (checkbox, switch, etc.)
 */
export function useToggleHandler(initialState: boolean = false) {
  const [isToggled, setIsToggled] = useState(initialState);
  
  const toggle = useCallback(() => {
    setIsToggled(prev => !prev);
  }, []);
  
  const handleToggle = useCallback<InputChangeHandler>((e) => {
    const target = e.target as HTMLInputElement;
    setIsToggled(target.checked);
  }, []);
  
  const setToggled = useCallback((value: boolean) => {
    setIsToggled(value);
  }, []);
  
  return {
    isToggled,
    toggle,
    handleToggle,
    setToggled
  };
}

/**
 * Hook for handling form submission with loading state
 */
export function useFormSubmitHandler<T>(
  onSubmit: (data: T) => Promise<void> | void,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onSuccess, onError]);
  
  return {
    handleSubmit,
    isSubmitting,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { ctrl = false, alt = false, shift = false, meta = false, enabled = true } = options;
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement> | globalThis.KeyboardEvent) => {
      if (!enabled) return;
      
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesModifiers = (
        (ctrl === event.ctrlKey) &&
        (alt === event.altKey) &&
        (shift === event.shiftKey) &&
        (meta === event.metaKey)
      );
      
      if (matchesKey && matchesModifiers) {
        event.preventDefault();
        callback();
      }
    },
    [key, ctrl, alt, shift, meta, enabled, callback]
  );
  
  // Add global event listener on mount, remove on unmount
  useState(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown as any);
      return () => {
        window.addEventListener('keydown', handleKeyDown as any);
      };
    }
    return undefined;
  });
  
  return handleKeyDown as KeyboardEventHandler;
}

/**
 * Hook for handling mouse events with enhanced features
 */
export function useMouseHandler(
  onClick?: () => void,
  options: {
    doubleClick?: () => void;
    rightClick?: () => void;
    doubleClickDelay?: number;
    preventContextMenu?: boolean;
  } = {}
) {
  const {
    doubleClick,
    rightClick,
    doubleClickDelay = 300,
    preventContextMenu = false
  } = options;
  
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleClick = useCallback<MouseEventHandler>((e) => {
    // Handle right click
    if (e.button === 2) {
      if (rightClick) rightClick();
      return;
    }
    
    // Handle left click
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      setClickCount(0);
      if (doubleClick) doubleClick();
    } else {
      setClickCount(1);
      const timer = setTimeout(() => {
        setClickCount(0);
        setClickTimer(null);
        if (onClick) onClick();
      }, doubleClickDelay);
      setClickTimer(timer);
    }
  }, [onClick, doubleClick, rightClick, doubleClickDelay, clickTimer]);
  
  const handleContextMenu = useCallback<MouseEventHandler>((e) => {
    if (preventContextMenu) {
      e.preventDefault();
    }
  }, [preventContextMenu]);
  
  return {
    handleClick,
    handleContextMenu
  };
}

/**
 * Hook for handling drag and drop events
 */
export function useDragHandler<T>(
  onDrop: (item: T) => void,
  options: {
    allowedTypes?: string[];
    onDragOver?: () => void;
    onDragLeave?: () => void;
  } = {}
) {
  const { allowedTypes = [], onDragOver, onDragLeave } = options;
  
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const handleDragOver = useCallback<(e: React.DragEvent<HTMLElement>) => void>((e) => {
    e.preventDefault();
    
    if (!isDraggingOver) {
      setIsDraggingOver(true);
      if (onDragOver) onDragOver();
    }
  }, [isDraggingOver, onDragOver]);
  
  const handleDragLeave = useCallback<(e: React.DragEvent<HTMLElement>) => void>((e) => {
    e.preventDefault();
    
    setIsDraggingOver(false);
    if (onDragLeave) onDragLeave();
  }, [onDragLeave]);
  
  const handleDrop = useCallback<(e: React.DragEvent<HTMLElement>) => void>((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    // Check if the dropped item matches allowed types
    try {
      const droppedData = JSON.parse(e.dataTransfer.getData('application/json')) as T;
      const type = e.dataTransfer.types[0];
      
      if (allowedTypes.length === 0 || allowedTypes.includes(type)) {
        onDrop(droppedData);
      }
    } catch (error) {
      console.error('Error processing dropped data:', error);
    }
  }, [allowedTypes, onDrop]);
  
  return {
    isDraggingOver,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
