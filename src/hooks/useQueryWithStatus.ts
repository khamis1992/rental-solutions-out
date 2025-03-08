
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';

interface UseQueryWithStatusOptions<TData, TError> extends UseQueryOptions<TData, TError> {
  showErrorToast?: boolean;
  errorToastMessage?: string;
  showSuccessToast?: boolean;
  successToastMessage?: string;
  onSuccessCallback?: (data: TData) => void;
  onErrorCallback?: (error: TError) => void;
}

export function useQueryWithStatus<
  TData = unknown,
  TError = Error,
  TQueryKey extends any[] = any[]
>(
  options: UseQueryWithStatusOptions<TData, TError>
): [UseQueryResult<TData, TError>, QueryStatus] {
  const {
    showErrorToast = true,
    errorToastMessage,
    showSuccessToast = false,
    successToastMessage,
    onSuccessCallback,
    onErrorCallback,
    ...queryOptions
  } = options;

  const [status, setStatus] = useState<QueryStatus>('idle');
  
  const queryResult = useQuery<TData, TError>({
    ...queryOptions,
    onSuccess: (data) => {
      if (showSuccessToast && successToastMessage) {
        toast.success(successToastMessage);
      }
      
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
      
      // Forward to the original onSuccess if it exists
      if (queryOptions.onSuccess) {
        queryOptions.onSuccess(data);
      }
    },
    onError: (error) => {
      if (showErrorToast) {
        toast.error(errorToastMessage || 'An error occurred while fetching data');
      }
      
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      
      // Forward to the original onError if it exists
      if (queryOptions.onError) {
        queryOptions.onError(error);
      }
    },
  });

  useEffect(() => {
    if (queryResult.isLoading) {
      setStatus('loading');
    } else if (queryResult.isError) {
      setStatus('error');
    } else if (queryResult.isSuccess) {
      setStatus('success');
    } else {
      setStatus('pending');
    }
  }, [queryResult.isLoading, queryResult.isError, queryResult.isSuccess]);

  return [queryResult, status];
}
