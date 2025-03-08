
import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QueryStatus } from "@/hooks/useQueryWithStatus";

interface DataLoaderProps {
  status: QueryStatus;
  children: React.ReactNode;
  error?: Error | null;
  onRetry?: () => void;
  statusText?: string;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  loadingHeight?: string;
  className?: string;
}

export function DataLoader({
  status,
  children,
  error,
  onRetry,
  statusText,
  isEmpty = false,
  emptyState,
  loadingHeight = "16rem",
  className,
}: DataLoaderProps) {
  // Placeholder for empty state if none is provided
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="w-16 h-16 text-muted-foreground/40 mb-4"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M21 15V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" />
        <path d="M2 15h20" />
        <path d="M14 19v-4" />
        <path d="M10 19v-4" />
        <path d="M6 19v-4" />
        <path d="M18 19v-4" />
      </svg>
      <h3 className="text-lg font-medium">No data found</h3>
      <p className="text-muted-foreground max-w-sm mt-2">
        There are no items to display at this time. Check back later or try
        changing your filters.
      </p>
    </div>
  );

  // Handle loading state
  if (status === "loading") {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ minHeight: loadingHeight }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {statusText || "Loading data..."}
        </p>
      </div>
    );
  }

  // Handle refreshing state (show content with loading indicator)
  if (status === "refreshing") {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute top-0 right-0 p-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        </div>
        {children}
      </div>
    );
  }

  // Handle error state
  if (status === "error") {
    return (
      <Card className={`border-destructive/20 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="text-muted-foreground mt-2 mb-4 max-w-md">
            {error?.message || "Failed to load data. Please try again."}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (isEmpty) {
    return (
      <div className={className}>
        {emptyState || defaultEmptyState}
      </div>
    );
  }

  // When data is successfully loaded, show partial or stale data indicators if needed
  if (status === "partial" || status === "stale") {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute top-0 right-0 p-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {status === "partial" ? "Partial Data" : "Outdated"}
          </span>
        </div>
        {children}
      </div>
    );
  }

  // Default case - successful data load
  return <div className={className}>{children}</div>;
}
