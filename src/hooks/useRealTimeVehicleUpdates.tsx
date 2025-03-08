
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleUpdateOptions {
  notifyOnStatusChange?: boolean;
  historyLimit?: number;
}

export const useRealTimeVehicleUpdates = (options: VehicleUpdateOptions = {}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectedStatus, setConnectedStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [recentStatusChanges, setRecentStatusChanges] = useState<any[]>([]);
  
  const { notifyOnStatusChange = false, historyLimit = 10 } = options;
  
  useEffect(() => {
    // Update connection status
    setConnectedStatus('connecting');
    
    // Subscribe to vehicle status changes 
    const channel = supabase
      .channel('vehicle-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'status=neq.status'
        },
        (payload) => {
          // Update last update timestamp
          const updateTime = new Date();
          setLastUpdate(updateTime);
          
          // Get old and new status
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          
          // Get vehicle details
          const vehicle = {
            id: payload.new.id,
            make: payload.new.make,
            model: payload.new.model,
            year: payload.new.year,
            licensePlate: payload.new.license_plate
          };
          
          // Create a status change record
          const statusChange = {
            vehicle,
            oldStatus,
            newStatus,
            timestamp: updateTime
          };
          
          // Add to recent changes
          setRecentStatusChanges(prev => {
            const newChanges = [statusChange, ...prev];
            return newChanges.slice(0, historyLimit);
          });
          
          // Show notification if enabled
          if (notifyOnStatusChange) {
            toast.info(`Vehicle status changed to ${newStatus}`, {
              description: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}) - Was: ${oldStatus}`
            });
          }
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          setConnectedStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectedStatus('error');
        } else {
          setConnectedStatus('disconnected');
        }
      });
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [notifyOnStatusChange, historyLimit]);
  
  return {
    lastUpdate,
    connectedStatus,
    recentStatusChanges
  };
};
