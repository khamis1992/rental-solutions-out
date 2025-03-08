
import React, { ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

interface DataLoaderProps {
  status: LoadingStatus;
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  loadingMessage?: string;
  showEmptyState?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  EmptyComponent?: React.ReactNode;
}

/**
 * A component that handles the loading and error states when fetching data.
 */
export const DataLoader = ({
  status,
  children,
  isLoading,
  error,
  errorMessage = "An error occurred while loading data",
  onRetry,
  className,
  loadingMessage = "Loading data...",
  showEmptyState = false,
  emptyMessage = "No data available",
  isEmpty = false,
  EmptyComponent
}: DataLoaderProps) => {
  // Determine the effective status based on the props
  const effectiveStatus = 
    status !== 'idle' ? status :
    isLoading ? 'loading' :
    error ? 'error' : 'success';

  // Determine if we should show empty state
  const shouldShowEmptyState = showEmptyState && isEmpty && effectiveStatus === 'success';

  return (
    <div className={cn("w-full", className)}>
      {effectiveStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      )}

      {effectiveStatus === 'error' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-destructive/10 p-3 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium mb-4">{errorMessage}</p>
          {error && (
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
          )}
          {onRetry && (
            <Button onClick={onRetry} variant="secondary">
              Try Again
            </Button>
          )}
        </div>
      )}

      {shouldShowEmptyState && (
        EmptyComponent || (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )
      )}

      {effectiveStatus === 'success' && !shouldShowEmptyState && children}
    </div>
  );
};
