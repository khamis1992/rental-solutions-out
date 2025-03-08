
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardSubscriptions = () => {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (subscriptionRef.current) {
      return;
    }

    const handleDatabaseChange = (payload: any) => {
      console.log('Change received!', payload);
      
      // Extract table name and event from payload
      const { table, eventType } = payload;
      
      // Show appropriate toast based on the table and event
      if (table === 'leases') {
        if (eventType === 'INSERT') {
          toast.success('New agreement created');
        } else if (eventType === 'UPDATE') {
          toast.info('Agreement updated');
        }
      } else if (table === 'vehicles') {
        if (eventType === 'INSERT') {
          toast.success('New vehicle added to fleet');
        } else if (eventType === 'UPDATE') {
          toast.info('Vehicle information updated');
        }
      } else if (table === 'unified_payments') {
        if (eventType === 'INSERT') {
          toast.success('New payment recorded');
        }
      }
    };

    // Subscribe to leases table changes
    const leasesChannel = supabase
      .channel('leases-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases'
        },
        (payload) => handleDatabaseChange({ ...payload, table: 'leases', eventType: payload.eventType })
      )
      .subscribe();
    
    // Subscribe to vehicles table changes
    const vehiclesChannel = supabase
      .channel('vehicles-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => handleDatabaseChange({ ...payload, table: 'vehicles', eventType: payload.eventType })
      )
      .subscribe();
    
    // Subscribe to unified_payments table changes
    const paymentsChannel = supabase
      .channel('payments-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_payments'
        },
        (payload) => handleDatabaseChange({ ...payload, table: 'unified_payments', eventType: payload.eventType })
      )
      .subscribe();

    subscriptionRef.current = [leasesChannel, vehiclesChannel, paymentsChannel];

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.forEach((channel: any) => {
          supabase.removeChannel(channel);
        });
        subscriptionRef.current = null;
      }
    };
  }, []);
};
