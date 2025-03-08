
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertDetails } from '@/types/dashboard.types';
import { toast } from 'sonner';

interface UseSmartAlertsOptions {
  enableNotifications?: boolean;
  maxAlerts?: number;
  alertTypes?: ('vehicle' | 'customer' | 'payment' | 'maintenance' | 'contract')[];
}

export const useSmartAlerts = (options: UseSmartAlertsOptions = {}) => {
  const {
    enableNotifications = true,
    maxAlerts = 10,
    alertTypes = ['vehicle', 'customer', 'payment', 'maintenance', 'contract'],
  } = options;

  const [alerts, setAlerts] = useState<AlertDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      // Fetch alerts based on the alert types
      const typeFilter = alertTypes.map(type => `type.eq.${type}`).join(',');
      
      const { data, error } = await supabase
        .from('dashboard_alerts')
        .select(`
          id,
          type,
          title,
          description,
          priority,
          date,
          status,
          customer:customer_id (*),
          vehicle:vehicle_id (*)
        `)
        .or(typeFilter)
        .order('date', { ascending: false })
        .limit(maxAlerts);

      if (error) throw error;
      
      setAlerts(data as unknown as AlertDetails[]);
      setUnreadCount(data.filter(alert => alert.status === 'unread').length);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to alert changes
    const alertsSubscription = supabase
      .channel('dashboard-alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'dashboard_alerts' 
        }, 
        (payload) => {
          const newAlert = payload.new as AlertDetails;
          
          if (alertTypes.includes(newAlert.type)) {
            setAlerts(prev => [newAlert, ...prev].slice(0, maxAlerts));
            setUnreadCount(prev => prev + 1);
            
            if (enableNotifications) {
              toast.info(`New alert: ${newAlert.title}`, {
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      alertsSubscription.unsubscribe();
    };
  }, [enableNotifications, maxAlerts, alertTypes]);

  const markAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('dashboard_alerts')
        .update({ status: 'read' })
        .eq('id', alertId);
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'read' } : alert
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking alert as read:', err);
      toast.error('Failed to update alert status');
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('dashboard_alerts')
        .update({ status: 'read' })
        .in('id', alerts.map(alert => alert.id));
      
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, status: 'read' }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
      toast.error('Failed to update alert statuses');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await supabase
        .from('dashboard_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      if (alerts.find(alert => alert.id === alertId)?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
      toast.error('Failed to dismiss alert');
    }
  };

  return {
    alerts,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    refreshAlerts: fetchAlerts
  };
};
