
import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeTransform } from "@/lib/transformUtils";

/**
 * Extended query options with simplified error handling and transformations
 */
export interface TypedQueryOptions<TData, TError, TResult = TData> extends 
  Omit<UseQueryOptions<TData, TError, TResult, QueryKey>, 'queryKey' | 'queryFn'> {
  onSuccess?: (data: TResult) => void;
  onError?: (error: TError) => void;
  transform?: (data: TData) => TResult;
  defaultValue?: TResult;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * A hook that extends React Query's useQuery with better error handling,
 * transformation utilities, and integration with the toast system
 */
export function useQueryState<TData, TError = Error, TResult = TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: TypedQueryOptions<TData, TError, TResult>
) {
  const { 
    transform,
    defaultValue,
    showSuccessToast = false,
    successMessage = "Data loaded successfully",
    showErrorToast = true,
    errorMessage = "Failed to load data",
    onSuccess,
    onError,
    ...queryOptions
  } = options || {};

  const queryResult = useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
    select: (data) => {
      // Apply transformation if provided
      if (transform) {
        return safeTransform(data, transform, defaultValue as TResult);
      }
      return data as unknown as TResult;
    },
  });

  // Handle success with optional toast
  if (queryResult.isSuccess && queryResult.data && showSuccessToast) {
    toast.success(successMessage);
    
    if (onSuccess) {
      onSuccess(queryResult.data);
    }
  }

  // Handle error with optional toast
  if (queryResult.isError && showErrorToast) {
    const errorMsg = 
      errorMessage || 
      (queryResult.error instanceof Error ? 
        queryResult.error.message : 
        "An error occurred");
    
    toast.error(errorMsg);
    
    if (onError) {
      onError(queryResult.error as TError);
    }
  }

  return {
    ...queryResult,
    // Add convenience computed properties
    isLoaded: queryResult.isSuccess && !queryResult.isLoading && !queryResult.isFetching,
    isEmpty: queryResult.isSuccess && !queryResult.data,
    lastUpdated: queryResult.dataUpdatedAt ? new Date(queryResult.dataUpdatedAt) : undefined
  };
}

/**
 * Extended mutation options with simplified error handling
 */
export interface TypedMutationOptions<TData, TError, TVariables, TContext> extends 
  Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * A hook that extends React Query's useMutation with better error handling
 * and integration with the toast system
 */
export function useMutationState<TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: TypedMutationOptions<TData, TError, TVariables, TContext>
) {
  const { 
    showSuccessToast = true,
    successMessage = "Operation completed successfully",
    showErrorToast = true,
    errorMessage = "Operation failed",
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {};

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        const errorMsg = 
          errorMessage || 
          (error instanceof Error ? 
            error.message : 
            "An error occurred");
        
        toast.error(errorMsg);
      }
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
}
