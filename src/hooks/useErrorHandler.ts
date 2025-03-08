
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logToConsole?: boolean;
}

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  toastMessage: 'An error occurred',
  logToConsole: true
};

export function useErrorHandler(customOptions?: ErrorHandlerOptions) {
  const options = { ...defaultOptions, ...customOptions };
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown, customMessage?: string) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    
    setError(errorObj);
    
    if (options.logToConsole) {
      console.error('Error caught by useErrorHandler:', errorObj);
    }
    
    if (options.showToast) {
      toast.error(customMessage || options.toastMessage || errorObj.message);
    }
    
    return errorObj;
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}
