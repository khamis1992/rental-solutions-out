
import React from "react";
import { Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface DataLoaderProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  skeletonCount?: number;
  skeletonHeight?: number;
  children: React.ReactNode;
}

export function DataLoader({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  skeletonCount = 3,
  skeletonHeight = 50,
  children,
}: DataLoaderProps) {
  // Default loading state
  const defaultLoading = (
    <div className="w-full space-y-3">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Skeleton 
          key={index} 
          className="w-full" 
          style={{ height: `${skeletonHeight}px` }} 
        />
      ))}
    </div>
  );

  // Default error state
  const defaultError = (
    <Alert variant="destructive">
      <AlertTitle>Error loading data</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error?.message || "An unexpected error occurred."}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="mt-2 self-start"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );

  // Default empty state
  const defaultEmpty = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-muted-foreground">No data available.</p>
    </div>
  );

  if (isLoading) {
    return <>{loadingComponent || defaultLoading}</>;
  }

  if (isError) {
    return <>{errorComponent || defaultError}</>;
  }

  if (isEmpty) {
    return <>{emptyComponent || defaultEmpty}</>;
  }

  return <>{children}</>;
}
