
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface ErrorDetails {
  source: string;
  message: string;
  timestamp: Date;
  code?: string;
  stack?: string;
}

export function useErrorHandler(componentName: string) {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [hasError, setHasError] = useState(false);

  // Clear errors when component unmounts or on manual reset
  const clearErrors = useCallback(() => {
    setErrors([]);
    setHasError(false);
  }, []);

  // Handle errors consistently across the application
  const handleError = useCallback(
    (error: Error | string, customSource?: string, shouldToast = true) => {
      const errorDetails: ErrorDetails = {
        source: customSource || componentName,
        message: typeof error === "string" ? error : error.message,
        timestamp: new Date(),
        code: typeof error !== "string" && "code" in error ? (error as any).code : undefined,
        stack: typeof error !== "string" ? error.stack : undefined,
      };

      console.error(`[${errorDetails.source}]`, errorDetails.message, error);
      
      setErrors((prev) => [...prev, errorDetails]);
      setHasError(true);

      if (shouldToast) {
        toast.error(errorDetails.message, {
          description: errorDetails.source,
          duration: 5000,
        });
      }

      return errorDetails;
    },
    [componentName]
  );

  // Automatically handle unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, "UnhandledPromiseRejection");
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [handleError]);

  return {
    handleError,
    clearErrors,
    errors,
    hasError,
    latestError: errors[errors.length - 1],
  };
}
