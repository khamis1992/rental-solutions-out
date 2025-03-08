
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useErrorHandler } from './useErrorHandler';

// Extended status to give more granular feedback
export type QueryStatus = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'stale' 
  | 'partial' 
  | 'refreshing';

interface UseQueryWithStatusResult<TData, TError> extends Omit<UseQueryResult<TData, TError>, 'status'> {
  status: QueryStatus;
  statusText: string;
  isPartialData: boolean;
  isStale: boolean;
  isRefreshing: boolean;
}

export function useQueryWithStatus<TData, TError = Error>(
  options: UseQueryOptions<TData, TError, TData, any[]>
): UseQueryWithStatusResult<TData, TError> {
  const { logError } = useErrorHandler();
  const [extendedStatus, setExtendedStatus] = useState<QueryStatus>('idle');
  const [statusText, setStatusText] = useState<string>('Initializing...');
  
  // Use the base React Query hook
  const queryResult = useQuery<TData, TError, TData, any[]>(options);
  const { 
    status: baseStatus, 
    error, 
    data, 
    isSuccess, 
    isFetching, 
    isStale,
    isPlaceholderData,
    isError
  } = queryResult;
  
  // Determine the extended status based on query state
  useEffect(() => {
    if (isError) {
      setExtendedStatus('error');
      setStatusText('Failed to load data');
      
      if (error) {
        logError(error, { 
          context: { 
            queryKey: options.queryKey,
            queryHash: queryResult.queryHash
          }
        });
      }
    } else if (isSuccess && isPlaceholderData) {
      setExtendedStatus('partial');
      setStatusText('Loaded placeholder data');
    } else if (isSuccess && isFetching) {
      setExtendedStatus('refreshing');
      setStatusText('Refreshing data...');
    } else if (isSuccess && isStale) {
      setExtendedStatus('stale');
      setStatusText('Data may be outdated');
    } else if (isSuccess) {
      setExtendedStatus('success');
      setStatusText('Data loaded successfully');
    } else if (baseStatus === 'loading') {
      setExtendedStatus('loading');
      setStatusText('Loading data...');
    } else {
      setExtendedStatus('idle');
      setStatusText('Waiting to load data');
    }
  }, [baseStatus, isError, isSuccess, isFetching, isStale, isPlaceholderData, error, logError, options.queryKey, queryResult.queryHash]);
  
  return {
    ...queryResult,
    status: extendedStatus,
    statusText,
    isPartialData: extendedStatus === 'partial',
    isStale: extendedStatus === 'stale',
    isRefreshing: extendedStatus === 'refreshing',
  };
}
