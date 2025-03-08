
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";

interface UseRealTimeVehicleUpdatesOptions {
  onStatusChange?: (oldVehicle: Vehicle, newVehicle: Vehicle) => void;
  onLocationChange?: (vehicle: Vehicle, newLocation: { lat: number; lng: number }) => void;
  onVehicleAdded?: (vehicle: Vehicle) => void;
  onVehicleRemoved?: (vehicleId: string) => void;
}

export const useRealTimeVehicleUpdates = (options: UseRealTimeVehicleUpdatesOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [vehicleUpdates, setVehicleUpdates] = useState<Record<string, Vehicle>>({});

  useEffect(() => {
    // Subscribe to realtime updates
    const vehicleSubscription = supabase
      .channel('vehicle-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vehicles'
      }, (payload) => {
        setLastUpdate(new Date());

        if (payload.eventType === 'INSERT' && payload.new) {
          const newVehicle = payload.new as Vehicle;
          setVehicleUpdates(prev => ({
            ...prev,
            [newVehicle.id]: newVehicle
          }));
          
          if (options.onVehicleAdded) {
            options.onVehicleAdded(newVehicle);
          }
          
          toast.success(`New vehicle added: ${newVehicle.make} ${newVehicle.model}`);
        }
        
        if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
          const oldVehicle = payload.old as Vehicle;
          const newVehicle = payload.new as Vehicle;
          
          setVehicleUpdates(prev => ({
            ...prev,
            [newVehicle.id]: newVehicle
          }));
          
          // Check if status changed
          if (oldVehicle.status !== newVehicle.status && options.onStatusChange) {
            options.onStatusChange(oldVehicle, newVehicle);
            toast.info(`Vehicle status changed: ${newVehicle.make} ${newVehicle.model} is now ${newVehicle.status}`);
          }
          
          // Check if location changed
          if (
            (oldVehicle.last_location_lat !== newVehicle.last_location_lat ||
             oldVehicle.last_location_lng !== newVehicle.last_location_lng) &&
            options.onLocationChange &&
            newVehicle.last_location_lat &&
            newVehicle.last_location_lng
          ) {
            options.onLocationChange(newVehicle, {
              lat: newVehicle.last_location_lat,
              lng: newVehicle.last_location_lng
            });
          }
        }
        
        if (payload.eventType === 'DELETE' && payload.old) {
          const oldVehicle = payload.old as Vehicle;
          
          setVehicleUpdates(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[oldVehicle.id];
            return newUpdates;
          });
          
          if (options.onVehicleRemoved) {
            options.onVehicleRemoved(oldVehicle.id);
          }
          
          toast.info(`Vehicle removed: ${oldVehicle.make} ${oldVehicle.model}`);
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Connected to vehicle updates');
        } else {
          console.error('Failed to connect to vehicle updates:', status);
        }
      });

    // Clean up subscription
    return () => {
      vehicleSubscription.unsubscribe();
    };
  }, [options]);

  return {
    isConnected,
    lastUpdate,
    vehicleUpdates,
    clearUpdates: () => setVehicleUpdates({}),
  };
};
