
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SyncConfig = {
  resourceName: string;
  tableName: string;
  queryKey: string[];
  enableToasts?: boolean;
  onError?: (error: Error) => void;
};

/**
 * Hook to enable real-time data synchronization with Supabase
 * for a specific resource
 */
export function useDataSync({
  resourceName,
  tableName,
  queryKey,
  enableToasts = true,
  onError
}: SyncConfig) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setup real-time subscription
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        async (payload) => {
          console.log(`${resourceName} data changed:`, payload);
          
          try {
            // Invalidate the query to refresh data
            await queryClient.invalidateQueries({ queryKey });
            
            // Show toast notification if enabled
            if (enableToasts) {
              const eventLabels = {
                INSERT: 'added',
                UPDATE: 'updated',
                DELETE: 'removed'
              };
              
              const action = eventLabels[payload.eventType as keyof typeof eventLabels] || 'changed';
              toast.info(`${resourceName} ${action} successfully`);
            }
          } catch (error) {
            console.error(`Error syncing ${resourceName} data:`, error);
            if (onError && error instanceof Error) {
              onError(error);
            }
          }
        }
      )
      .subscribe(status => {
        setSyncStatus(status === 'SUBSCRIBED' ? 'connected' : 'error');
        if (status !== 'SUBSCRIBED' && enableToasts) {
          toast.error(`Failed to sync ${resourceName} data in real-time`);
        }
      });   

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryKey, resourceName, tableName, queryClient, enableToasts, onError]);

  return { syncStatus };
}
