
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Vehicle {
  id: string;
  status: string;
  make: string;
  model: string;
  license_plate: string;
  [key: string]: any;
}

export interface StatusChange {
  vehicleId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
  vehicle: Vehicle;
}

export interface RealTimeVehicleUpdates {
  isLoading: boolean;
  recentStatusChanges: StatusChange[];
  lastUpdate: Date | null;
  connectedStatus: 'connected' | 'disconnected';
  reconnect: () => void;
}

export interface UseRealTimeVehicleUpdatesOptions {
  notifyOnStatusChange?: boolean;
  includeLocation?: boolean;
  includeMaintenanceUpdates?: boolean;
  historyLimit?: number;
  onUpdate?: (vehicle: Vehicle) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export const useRealTimeVehicleUpdates = (options: UseRealTimeVehicleUpdatesOptions = {}): RealTimeVehicleUpdates => {
  const {
    notifyOnStatusChange = false,
    includeLocation = false,
    includeMaintenanceUpdates = true,
    historyLimit = 10,
    onUpdate,
    onDisconnect,
    onReconnect
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [recentStatusChanges, setRecentStatusChanges] = useState<StatusChange[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectedStatus, setConnectedStatus] = useState<'connected' | 'disconnected'>('connected');
  
  // Use refs to store subscription objects for potential reconnection
  const vehicleSubscriptionRef = useRef<any>(null);
  const maintenanceSubscriptionRef = useRef<any>(null);
  const locationSubscriptionRef = useRef<any>(null);

  // Function to handle reconnection
  const reconnect = () => {
    setConnectedStatus('connected');
    
    // Re-subscribe to all previously subscribed channels
    setupSubscriptions();
    
    if (onReconnect) {
      onReconnect();
    }
    
    toast.success("Reconnected to real-time vehicle updates");
  };

  // Setup subscriptions based on options
  const setupSubscriptions = () => {
    // Vehicle status subscription
    vehicleSubscriptionRef.current = supabase
      .channel('vehicle-status-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'vehicles',
          filter: 'status=is.not.null'
        }, 
        async (payload) => {
          if (payload.old && payload.new && payload.old.status !== payload.new.status) {
            const change: StatusChange = {
              vehicleId: payload.new.id,
              oldStatus: payload.old.status,
              newStatus: payload.new.status,
              timestamp: new Date(),
              vehicle: payload.new as Vehicle
            };
            
            // Update state with the new change
            setRecentStatusChanges(prev => [change, ...prev].slice(0, historyLimit));
            setLastUpdate(new Date());
            
            // Call the onUpdate callback if provided
            if (onUpdate) {
              onUpdate(payload.new as Vehicle);
            }
            
            // Notify if enabled
            if (notifyOnStatusChange) {
              toast.info(`Vehicle status changed: ${payload.new.license_plate} is now ${payload.new.status}`);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          setConnectedStatus('disconnected');
          if (onDisconnect) onDisconnect();
        }
        setIsLoading(false);
      });
    
    // Maintenance updates subscription if enabled
    if (includeMaintenanceUpdates) {
      maintenanceSubscriptionRef.current = supabase
        .channel('maintenance-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'maintenance'
          }, 
          async (payload) => {
            if (payload.new) {
              // Get vehicle details
              const { data: vehicle, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', payload.new.vehicle_id)
                .single();
              
              if (error || !vehicle) {
                console.error('Error fetching vehicle for maintenance update:', error);
                return;
              }
              
              // Create status change object
              const change: StatusChange = {
                vehicleId: vehicle.id,
                oldStatus: payload.eventType === 'INSERT' ? 'unknown' : 'maintenance',
                newStatus: 'maintenance',
                timestamp: new Date(),
                vehicle: vehicle as Vehicle
              };
              
              // Update state with the new change
              setRecentStatusChanges(prev => [change, ...prev].slice(0, historyLimit));
              setLastUpdate(new Date());
              
              // Call the onUpdate callback if provided
              if (onUpdate) {
                onUpdate(vehicle as Vehicle);
              }
              
              // Notify if enabled
              if (notifyOnStatusChange) {
                toast.info(`Maintenance update for ${vehicle.license_plate}: ${payload.new.service_type}`);
              }
            }
          }
        )
        .subscribe();
    }
    
    // Location updates subscription if enabled
    if (includeLocation) {
      locationSubscriptionRef.current = supabase
        .channel('location-updates')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'vehicle_locations'
          }, 
          async (payload) => {
            if (payload.new) {
              // Get vehicle details
              const { data: vehicle, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', payload.new.vehicle_id)
                .single();
              
              if (error || !vehicle) {
                console.error('Error fetching vehicle for location update:', error);
                return;
              }
              
              // Call the onUpdate callback if provided
              if (onUpdate) {
                onUpdate({
                  ...vehicle,
                  location: {
                    latitude: payload.new.latitude,
                    longitude: payload.new.longitude,
                    timestamp: payload.new.timestamp
                  }
                });
              }
            }
          }
        )
        .subscribe();
    }
  };

  // Initial setup of subscriptions
  useEffect(() => {
    setupSubscriptions();
    
    // Fetch recent status changes to populate history
    const fetchRecentChanges = async () => {
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { data, error } = await supabase
          .from('vehicle_status_history')
          .select('*, vehicle:vehicles(*)')
          .gt('created_at', threeDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(historyLimit);
        
        if (error) throw error;
        
        if (data) {
          const formattedChanges: StatusChange[] = data.map(change => ({
            vehicleId: change.vehicle_id,
            oldStatus: change.old_status,
            newStatus: change.new_status,
            timestamp: new Date(change.created_at),
            vehicle: change.vehicle as Vehicle
          }));
          
          setRecentStatusChanges(formattedChanges);
        }
      } catch (error) {
        console.error('Error fetching recent vehicle status changes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentChanges();
    
    // Cleanup subscriptions on unmount
    return () => {
      if (vehicleSubscriptionRef.current) {
        vehicleSubscriptionRef.current.unsubscribe();
      }
      if (maintenanceSubscriptionRef.current) {
        maintenanceSubscriptionRef.current.unsubscribe();
      }
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.unsubscribe();
      }
    };
  }, []); // Empty dependency array to run only on mount

  return {
    isLoading,
    recentStatusChanges,
    lastUpdate,
    connectedStatus,
    reconnect
  };
};
