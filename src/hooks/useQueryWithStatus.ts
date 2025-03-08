
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export type QueryStatus = "idle" | "loading" | "success" | "error" | "pending";

interface StatusOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useQueryWithStatus<
  TData = unknown,
  TError = Error,
  TQueryKey extends unknown[] = unknown[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError, TData, TQueryKey> & StatusOptions
): UseQueryResult<TData, TError> & { status: QueryStatus } {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "Data loaded successfully",
    onSuccess,
    onError,
    ...queryOptions
  } = options || {};

  const query = useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  useEffect(() => {
    if (query.isSuccess && showSuccessToast) {
      toast.success(successMessage);
      if (onSuccess) {
        onSuccess(query.data);
      }
    }
  }, [query.isSuccess, showSuccessToast, successMessage, onSuccess, query.data]);

  useEffect(() => {
    if (query.isError && showErrorToast) {
      const errorMessage = query.error instanceof Error ? query.error.message : "An error occurred";
      toast.error(`Error: ${errorMessage}`);
      if (onError && query.error instanceof Error) {
        onError(query.error);
      }

      // Log the error details for debugging
      console.error("[QueryError]", {
        queryKey: queryKey,
        error: query.error,
        timestamp: new Date().toISOString(),
      });
    }
  }, [query.isError, showErrorToast, onError, query.error, queryKey]);

  // Map the React Query status to our custom status enum
  let status: QueryStatus = "idle";
  if (query.isLoading) status = "loading";
  else if (query.isSuccess) status = "success";
  else if (query.isError) status = "error";
  else if (query.isPending) status = "pending";

  return {
    ...query,
    status,
  };
}
