
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VehicleStatus, PaymentStatus, AgreementStatus } from '@/types/dashboard.types';

interface DatabaseChangeEvent {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any>;
  old?: Record<string, any>;
}

export const useDashboardSubscriptions = () => {
  const subscriptionRef = useRef<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (subscriptionRef.current) {
      return;
    }

    const handleDatabaseChange = (payload: DatabaseChangeEvent) => {
      console.log('Change received!', payload);
      setLastUpdate(new Date());
      
      // Extract table name and event from payload
      const { table, eventType, new: newRecord, old: oldRecord } = payload;
      
      // Show appropriate toast based on the table and event
      if (table === 'leases') {
        if (eventType === 'INSERT') {
          const agreementNumber = newRecord.agreement_number || 'New agreement';
          toast.success(`${agreementNumber} created`);
        } else if (eventType === 'UPDATE') {
          // Check if status has changed
          if (oldRecord && newRecord.status !== oldRecord.status) {
            const agreementNumber = newRecord.agreement_number || 'Agreement';
            const newStatus = newRecord.status as AgreementStatus;
            
            switch (newStatus) {
              case 'active':
                toast.info(`${agreementNumber} is now active`);
                break;
              case 'completed':
                toast.success(`${agreementNumber} completed`);
                break;
              case 'cancelled':
                toast.warning(`${agreementNumber} cancelled`);
                break;
              case 'overdue':
                toast.error(`${agreementNumber} is overdue`);
                break;
              default:
                toast.info(`${agreementNumber} status updated to ${newStatus}`);
            }
          } else {
            toast.info('Agreement updated');
          }
        }
      } else if (table === 'vehicles') {
        if (eventType === 'INSERT') {
          const vehicleInfo = `${newRecord.make} ${newRecord.model} ${newRecord.year || ''}`.trim();
          toast.success(`New vehicle added: ${vehicleInfo}`);
        } else if (eventType === 'UPDATE') {
          // Check if status has changed
          if (oldRecord && newRecord.status !== oldRecord.status) {
            const vehicleInfo = `${newRecord.license_plate || 'Vehicle'}`;
            const newStatus = newRecord.status as VehicleStatus;
            
            switch (newStatus) {
              case 'available':
                toast.success(`${vehicleInfo} is now available`);
                break;
              case 'rented':
                toast.info(`${vehicleInfo} is now rented`);
                break;
              case 'maintenance':
                toast.warning(`${vehicleInfo} is in maintenance`);
                break;
              default:
                toast.info(`${vehicleInfo} status updated to ${newStatus}`);
            }
          } else {
            toast.info('Vehicle information updated');
          }
        }
      } else if (table === 'unified_payments') {
        if (eventType === 'INSERT') {
          const amount = new Intl.NumberFormat('en-QA', {
            style: 'currency',
            currency: 'QAR'
          }).format(newRecord.amount || 0);
          
          toast.success(`New payment recorded: ${amount}`);
        } else if (eventType === 'UPDATE') {
          // Check if status has changed
          if (oldRecord && newRecord.status !== oldRecord.status) {
            const newStatus = newRecord.status as PaymentStatus;
            const amount = new Intl.NumberFormat('en-QA', {
              style: 'currency',
              currency: 'QAR'
            }).format(newRecord.amount || 0);
            
            switch (newStatus) {
              case 'completed':
                toast.success(`Payment of ${amount} completed`);
                break;
              case 'failed':
                toast.error(`Payment of ${amount} failed`);
                break;
              case 'overdue':
                toast.warning(`Payment of ${amount} is overdue`);
                break;
              default:
                toast.info(`Payment status updated to ${newStatus}`);
            }
          }
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
        (payload) => handleDatabaseChange({ 
          ...payload, 
          table: 'leases', 
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        })
      )
      .subscribe((status) => {
        console.log('Leases subscription status:', status);
      });
    
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
        (payload) => handleDatabaseChange({ 
          ...payload, 
          table: 'vehicles', 
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        })
      )
      .subscribe((status) => {
        console.log('Vehicles subscription status:', status);
      });
    
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
        (payload) => handleDatabaseChange({ 
          ...payload, 
          table: 'unified_payments', 
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        })
      )
      .subscribe((status) => {
        console.log('Payments subscription status:', status);
      });

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

  return { lastUpdate };
};
