
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Hook for synchronizing data with the database
 */
export function useDataSync<T extends { id: string }>(
  tableName: string,
  options?: {
    fetchOnMount?: boolean;
    enableRealtime?: boolean;
    handleError?: (error: Error) => void;
    onDataChange?: (data: T[]) => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const { error, handleError } = useErrorHandler();
  const {
    fetchOnMount = true,
    enableRealtime = false,
    onDataChange
  } = options || {};

  const fetchData = useCallback(async () => {
    try {
      setStatus('syncing');
      // We need to handle this case dynamically because the tableName is passed as a string
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*');

      if (fetchError) throw fetchError;

      setData(fetchedData as unknown as T[]);
      setStatus('success');
      
      if (onDataChange) {
        onDataChange(fetchedData as unknown as T[]);
      }
      
      return fetchedData;
    } catch (err) {
      setStatus('error');
      handleError(err);
      return null;
    }
  }, [tableName, handleError, onDataChange]);

  // Set up realtime subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    try {
      const subscription = supabase
        .channel(`${tableName}-changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: tableName
        }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (err) {
      handleError(err);
    }
  }, [tableName, enableRealtime, fetchData, handleError]);

  // Fetch data on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  return {
    data,
    status,
    error,
    refetch: fetchData
  };
}
