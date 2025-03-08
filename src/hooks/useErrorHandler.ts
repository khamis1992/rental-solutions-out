
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorOptions {
  severity?: ErrorSeverity;
  shouldToast?: boolean;
  context?: Record<string, unknown>;
  retry?: () => Promise<any>;
}

export function useErrorHandler() {
  const [lastError, setLastError] = useState<Error | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  // Enhanced error logging with severity and context
  const logError = useCallback((error: unknown, options?: ErrorOptions) => {
    const { 
      severity = 'medium', 
      shouldToast = true, 
      context = {},
      retry
    } = options || {};
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Augment error with additional metadata
    const errorWithContext = {
      message: errorObj.message,
      stack: errorObj.stack,
      severity,
      timestamp: new Date().toISOString(),
      context,
      occurrences: errorCount + 1
    };
    
    // Log to console with appropriate level based on severity
    if (severity === 'critical' || severity === 'high') {
      console.error('Error:', errorWithContext);
    } else {
      console.warn('Error:', errorWithContext);
    }
    
    // Store for reference
    setLastError(errorObj);
    setErrorCount(prev => prev + 1);
    
    // Show toast if enabled
    if (shouldToast) {
      const toastMessage = errorObj.message || 'An error occurred';
      if (retry) {
        toast.error(toastMessage, {
          action: {
            label: 'Retry',
            onClick: retry
          }
        });
      } else {
        toast.error(toastMessage);
      }
    }
    
    // For critical errors, potentially report to an error tracking service
    if (severity === 'critical') {
      // TODO: Add integration with error reporting service
      // errorReportingService.report(errorWithContext);
    }
    
    return errorObj;
  }, [errorCount]);
  
  const clearError = useCallback(() => {
    setLastError(null);
    setErrorCount(0);
  }, []);
  
  return {
    logError,
    clearError,
    lastError,
    errorCount,
    hasError: lastError !== null
  };
}
