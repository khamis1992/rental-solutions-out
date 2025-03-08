
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDetails } from "@/types/dashboard.types";
import { toast } from "sonner";

export interface UseSmartAlertsOptions {
  enabled?: boolean;
  showNotifications?: boolean;
  limit?: number;
  alertTypes?: ('vehicle' | 'customer' | 'payment' | 'maintenance' | 'contract')[];
  onNewAlert?: (alert: AlertDetails) => void;
  onAlertStatusChange?: (alertId: string, newStatus: string) => void;
}

export const useSmartAlerts = (options: UseSmartAlertsOptions = {}) => {
  const {
    enabled = true,
    showNotifications = false,
    limit = 10,
    alertTypes,
    onNewAlert,
    onAlertStatusChange
  } = options;

  const [alerts, setAlerts] = useState<AlertDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to fetch alerts
  const fetchAlerts = async () => {
    try {
      let query = supabase
        .from('dashboard_alerts')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit);

      // Add filter for alert types if provided
      if (alertTypes && alertTypes.length > 0) {
        query = query.in('type', alertTypes);
      }

      const { data, error } = await query;

      if (error) throw error;

      const alertsWithDetails: AlertDetails[] = await Promise.all(
        (data || []).map(async (alert) => {
          // Fetch additional details based on alert type
          let customer;
          let vehicle;

          if (alert.type === 'customer' && alert.customer_id) {
            const { data: customerData } = await supabase
              .from('profiles')
              .select('id, full_name, phone_number, email')
              .eq('id', alert.customer_id)
              .single();
            
            customer = customerData;
          }

          if ((alert.type === 'vehicle' || alert.type === 'maintenance') && alert.vehicle_id) {
            const { data: vehicleData } = await supabase
              .from('vehicles')
              .select('id, make, model, year, license_plate')
              .eq('id', alert.vehicle_id)
              .single();
            
            vehicle = vehicleData;
          }

          return {
            id: alert.id,
            type: alert.type,
            title: alert.title,
            description: alert.description,
            priority: alert.priority || 'medium',
            date: alert.date,
            status: alert.status || 'unread',
            customer,
            vehicle
          };
        })
      );

      setAlerts(alertsWithDetails);
      setUnreadCount(alertsWithDetails.filter(a => a.status === 'unread').length);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mark an alert as read
  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_alerts')
        .update({ status: 'read' })
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'read' } 
            : alert
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call the callback if provided
      if (onAlertStatusChange) {
        onAlertStatusChange(alertId, 'read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Function to dismiss an alert
  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      if (alerts.find(a => a.id === alertId)?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Call the callback if provided
      if (onAlertStatusChange) {
        onAlertStatusChange(alertId, 'dismissed');
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  // Set up subscription to real-time alerts
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchAlerts();

    // Set up real-time listener for new alerts
    const subscription = supabase
      .channel('dashboard-alerts-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'dashboard_alerts' 
        }, 
        async (payload) => {
          const newAlert = payload.new as any;
          
          // Skip if alert type is not in the filter
          if (alertTypes && !alertTypes.includes(newAlert.type)) {
            return;
          }
          
          // Fetch additional details based on alert type
          let customer;
          let vehicle;

          if (newAlert.type === 'customer' && newAlert.customer_id) {
            const { data: customerData } = await supabase
              .from('profiles')
              .select('id, full_name, phone_number, email')
              .eq('id', newAlert.customer_id)
              .single();
            
            customer = customerData;
          }

          if ((newAlert.type === 'vehicle' || newAlert.type === 'maintenance') && newAlert.vehicle_id) {
            const { data: vehicleData } = await supabase
              .from('vehicles')
              .select('id, make, model, year, license_plate')
              .eq('id', newAlert.vehicle_id)
              .single();
            
            vehicle = vehicleData;
          }
          
          const formattedAlert: AlertDetails = {
            id: newAlert.id,
            type: newAlert.type,
            title: newAlert.title,
            description: newAlert.description,
            priority: newAlert.priority || 'medium',
            date: newAlert.date,
            status: newAlert.status || 'unread',
            customer,
            vehicle
          };
          
          // Update state with the new alert
          setAlerts(prev => [formattedAlert, ...prev].slice(0, limit));
          setUnreadCount(prev => prev + 1);
          setLastUpdated(new Date());
          
          // Show notification if enabled
          if (showNotifications) {
            const toastFn = 
              formattedAlert.priority === 'high' 
                ? toast.warning 
                : formattedAlert.priority === 'medium' 
                  ? toast.info 
                  : toast.info;
            
            toastFn(`${formattedAlert.title}`, {
              description: formattedAlert.description,
              duration: formattedAlert.priority === 'high' ? 6000 : 4000,
            });
          }
          
          // Call the callback if provided
          if (onNewAlert) {
            onNewAlert(formattedAlert);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [enabled, limit, showNotifications, JSON.stringify(alertTypes)]);

  return {
    alerts,
    isLoading,
    unreadCount,
    lastUpdated,
    markAsRead,
    dismissAlert,
    refresh: fetchAlerts
  };
};
