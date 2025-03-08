
import { useEffect, useReducer } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleStatus } from '@/types/dashboard.types';
import { PaymentStatus, NotificationStatus } from '@/types/dashboard.types';
import { toast } from 'sonner';

// Define the state type
interface DashboardSubscriptionState {
  hasChanges: boolean;
  vehicleChanges: number;
  paymentChanges: number;
  customerChanges: number;
  alertChanges: number;
  maintenanceChanges: number;
  lastUpdate: Date | null;
}

// Define action types
type DashboardSubscriptionAction =
  | { type: 'VEHICLE_CHANGE' }
  | { type: 'PAYMENT_CHANGE' }
  | { type: 'CUSTOMER_CHANGE' }
  | { type: 'ALERT_CHANGE' }
  | { type: 'MAINTENANCE_CHANGE' }
  | { type: 'RESET_CHANGES' };

// Reducer function
function dashboardReducer(state: DashboardSubscriptionState, action: DashboardSubscriptionAction): DashboardSubscriptionState {
  switch (action.type) {
    case 'VEHICLE_CHANGE':
      return {
        ...state,
        hasChanges: true,
        vehicleChanges: state.vehicleChanges + 1,
        lastUpdate: new Date()
      };
    case 'PAYMENT_CHANGE':
      return {
        ...state,
        hasChanges: true,
        paymentChanges: state.paymentChanges + 1,
        lastUpdate: new Date()
      };
    case 'CUSTOMER_CHANGE':
      return {
        ...state,
        hasChanges: true,
        customerChanges: state.customerChanges + 1,
        lastUpdate: new Date()
      };
    case 'ALERT_CHANGE':
      return {
        ...state,
        hasChanges: true,
        alertChanges: state.alertChanges + 1,
        lastUpdate: new Date()
      };
    case 'MAINTENANCE_CHANGE':
      return {
        ...state,
        hasChanges: true,
        maintenanceChanges: state.maintenanceChanges + 1,
        lastUpdate: new Date()
      };
    case 'RESET_CHANGES':
      return {
        ...state,
        hasChanges: false,
        vehicleChanges: 0,
        paymentChanges: 0,
        customerChanges: 0,
        alertChanges: 0,
        maintenanceChanges: 0
      };
    default:
      return state;
  }
}

interface UseDashboardSubscriptionsOptions {
  enableToasts?: boolean;
  subscribeToVehicles?: boolean;
  subscribeToPayments?: boolean;
  subscribeToCustomers?: boolean;
  subscribeToAlerts?: boolean;
  subscribeToMaintenance?: boolean;
  onVehicleChange?: (payload: any) => void;
  onPaymentChange?: (payload: any) => void;
  onCustomerChange?: (payload: any) => void;
  onAlertChange?: (payload: any) => void;
  onMaintenanceChange?: (payload: any) => void;
}

export const useDashboardSubscriptions = (options: UseDashboardSubscriptionsOptions = {}) => {
  const {
    enableToasts = false,
    subscribeToVehicles = true,
    subscribeToPayments = true,
    subscribeToCustomers = true,
    subscribeToAlerts = true,
    subscribeToMaintenance = true,
    onVehicleChange,
    onPaymentChange,
    onCustomerChange,
    onAlertChange,
    onMaintenanceChange
  } = options;

  const initialState: DashboardSubscriptionState = {
    hasChanges: false,
    vehicleChanges: 0,
    paymentChanges: 0,
    customerChanges: 0,
    alertChanges: 0,
    maintenanceChanges: 0,
    lastUpdate: null
  };

  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    const subscriptions = [];

    // Subscribe to vehicle changes
    if (subscribeToVehicles) {
      const vehicleSubscription = supabase
        .channel('dashboard-vehicles')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'vehicles' 
          }, 
          (payload) => {
            dispatch({ type: 'VEHICLE_CHANGE' });
            if (onVehicleChange) onVehicleChange(payload);
            if (enableToasts) {
              const event = payload.eventType;
              if (event === 'INSERT') toast.info('New vehicle added');
              if (event === 'UPDATE') toast.info('Vehicle information updated');
              if (event === 'DELETE') toast.info('Vehicle removed from fleet');
            }
          }
        )
        .subscribe();
      
      subscriptions.push(vehicleSubscription);
    }

    // Subscribe to payment changes
    if (subscribeToPayments) {
      const paymentSubscription = supabase
        .channel('dashboard-payments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'unified_payments' 
          }, 
          (payload) => {
            dispatch({ type: 'PAYMENT_CHANGE' });
            if (onPaymentChange) onPaymentChange(payload);
            if (enableToasts && payload.eventType === 'INSERT') {
              toast.success('New payment recorded');
            }
          }
        )
        .subscribe();
      
      subscriptions.push(paymentSubscription);
    }

    // Subscribe to customer changes
    if (subscribeToCustomers) {
      const customerSubscription = supabase
        .channel('dashboard-customers')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles' 
          }, 
          (payload) => {
            dispatch({ type: 'CUSTOMER_CHANGE' });
            if (onCustomerChange) onCustomerChange(payload);
            if (enableToasts && payload.eventType === 'INSERT') {
              toast.info('New customer registered');
            }
          }
        )
        .subscribe();
      
      subscriptions.push(customerSubscription);
    }

    // Subscribe to alert changes
    if (subscribeToAlerts) {
      const alertSubscription = supabase
        .channel('dashboard-alerts')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'dashboard_alerts' 
          }, 
          (payload) => {
            dispatch({ type: 'ALERT_CHANGE' });
            if (onAlertChange) onAlertChange(payload);
            if (enableToasts) {
              const priority = payload.new?.priority || 'medium';
              const title = payload.new?.title || 'New alert';
              
              if (priority === 'high') {
                toast.warning(title, { duration: 6000 });
              } else {
                toast.info(title);
              }
            }
          }
        )
        .subscribe();
      
      subscriptions.push(alertSubscription);
    }

    // Subscribe to maintenance changes
    if (subscribeToMaintenance) {
      const maintenanceSubscription = supabase
        .channel('dashboard-maintenance')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'maintenance' 
          }, 
          (payload) => {
            dispatch({ type: 'MAINTENANCE_CHANGE' });
            if (onMaintenanceChange) onMaintenanceChange(payload);
            if (enableToasts && payload.eventType === 'INSERT') {
              toast.info('New maintenance job created');
            }
          }
        )
        .subscribe();
      
      subscriptions.push(maintenanceSubscription);
    }

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [
    enableToasts,
    subscribeToVehicles,
    subscribeToPayments,
    subscribeToCustomers,
    subscribeToAlerts,
    subscribeToMaintenance,
    onVehicleChange,
    onPaymentChange,
    onCustomerChange,
    onAlertChange,
    onMaintenanceChange
  ]);

  return {
    ...state,
    resetChanges: () => dispatch({ type: 'RESET_CHANGES' })
  };
};
