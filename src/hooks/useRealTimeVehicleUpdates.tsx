
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleStatus } from '@/types/vehicle';
import { toast } from 'sonner';

type VehicleUpdateType = 'status' | 'location' | 'maintenance';

interface UseRealTimeVehicleUpdatesOptions {
  updateTypes?: VehicleUpdateType[];
  notifyOnChanges?: boolean;
  onVehicleStatusChange?: (vehicleId: string, newStatus: VehicleStatus, previousStatus: VehicleStatus) => void;
  onVehicleLocationChange?: (vehicleId: string, lat: number, lng: number) => void;
  onMaintenanceUpdate?: (vehicleId: string) => void;
}

export const useRealTimeVehicleUpdates = (options: UseRealTimeVehicleUpdatesOptions = {}) => {
  const {
    updateTypes = ['status', 'location', 'maintenance'],
    notifyOnChanges = false,
    onVehicleStatusChange,
    onVehicleLocationChange,
    onMaintenanceUpdate
  } = options;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) throw error;
      
      setVehicles(data as Vehicle[]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vehicles'));
      if (notifyOnChanges) {
        toast.error('Failed to load vehicle data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();

    // Set up real-time subscriptions based on updateTypes
    const subscriptions = [];

    if (updateTypes.includes('status') || updateTypes.includes('location')) {
      const vehicleSubscription = supabase
        .channel('vehicles-updates')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'vehicles' 
          }, 
          (payload) => {
            const oldRecord = payload.old as Vehicle;
            const newRecord = payload.new as Vehicle;
            
            // Handle status changes
            if (updateTypes.includes('status') && oldRecord.status !== newRecord.status) {
              if (onVehicleStatusChange) {
                onVehicleStatusChange(
                  newRecord.id, 
                  newRecord.status as VehicleStatus, 
                  oldRecord.status as VehicleStatus
                );
              }
              
              if (notifyOnChanges) {
                toast.info(`Vehicle ${newRecord.license_plate} status changed to ${newRecord.status}`);
              }
            }
            
            // Handle location changes
            if (updateTypes.includes('location') && 
                (newRecord.last_location_lat !== oldRecord.last_location_lat || 
                 newRecord.last_location_lng !== oldRecord.last_location_lng)) {
              if (onVehicleLocationChange && 
                  newRecord.last_location_lat && 
                  newRecord.last_location_lng) {
                onVehicleLocationChange(
                  newRecord.id,
                  newRecord.last_location_lat,
                  newRecord.last_location_lng
                );
              }
            }
            
            // Update the local state
            setVehicles(prev => 
              prev.map(vehicle => 
                vehicle.id === newRecord.id ? newRecord as Vehicle : vehicle
              )
            );
            setLastUpdate(new Date());
          }
        )
        .subscribe();
        
      subscriptions.push(vehicleSubscription);
    }

    if (updateTypes.includes('maintenance')) {
      const maintenanceSubscription = supabase
        .channel('maintenance-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'maintenance' 
          }, 
          (payload) => {
            const record = payload.new as { vehicle_id: string };
            
            if (onMaintenanceUpdate && record.vehicle_id) {
              onMaintenanceUpdate(record.vehicle_id);
            }
            
            if (notifyOnChanges) {
              toast.info('Vehicle maintenance records updated');
            }
            
            // Fetch the updated vehicles data
            fetchVehicles();
          }
        )
        .subscribe();
        
      subscriptions.push(maintenanceSubscription);
    }

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [updateTypes, notifyOnChanges, onVehicleStatusChange, onVehicleLocationChange, onMaintenanceUpdate]);

  return {
    vehicles,
    isLoading,
    error,
    lastUpdate,
    refreshVehicles: fetchVehicles
  };
};
