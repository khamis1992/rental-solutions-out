
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Truck, Wrench } from "lucide-react";
import { VehicleStatus } from "@/types/vehicle";
import { useState, useEffect } from "react";
import { StatusGroup, StatusItem, VehicleMetrics } from "@/types/dashboard.types";

export const useVehicleMetrics = () => {
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);

  // Get vehicle statuses
  const { data: metrics, isLoading, error } = useQuery<VehicleMetrics>({
    queryKey: ['vehicleMetrics'],
    queryFn: async () => {
      try {
        // Get available vehicles
        const { data: availableVehicles, error: availableError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available');

        if (availableError) throw availableError;

        // Get rented vehicles
        const { data: rentedVehicles, error: rentedError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'rented');

        if (rentedError) throw rentedError;

        // Get maintenance vehicles
        const { data: maintenanceVehicles, error: maintenanceError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'maintenance');

        if (maintenanceError) throw maintenanceError;

        // Get accident vehicles
        const { data: accidentVehicles, error: accidentError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'accident');

        if (accidentError) throw accidentError;

        // Get retired vehicles
        const { data: retiredVehicles, error: retiredError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'retired');

        if (retiredError) throw retiredError;

        // Get all vehicles
        const { data: allVehicles, error: allError } = await supabase
          .from('vehicles')
          .select('*');

        if (allError) throw allError;

        // Get maintenance costs
        const { data: maintenanceData, error: maintenanceDataError } = await supabase
          .from('maintenance')
          .select('*');

        if (maintenanceDataError) throw maintenanceDataError;

        // Group vehicles by make
        const byMake: Record<string, number> = {};
        allVehicles.forEach(vehicle => {
          byMake[vehicle.make] = (byMake[vehicle.make] || 0) + 1;
        });

        // Group vehicles by year
        const byYear: Record<string, number> = {};
        allVehicles.forEach(vehicle => {
          byYear[vehicle.year.toString()] = (byYear[vehicle.year.toString()] || 0) + 1;
        });

        // Calculate maintenance costs
        const totalCost = maintenanceData.reduce((sum, item) => {
          return sum + (item.cost || 0);
        }, 0);

        // Group by maintenance type
        const byType: Record<string, number> = {};
        maintenanceData.forEach(item => {
          byType[item.service_type] = (byType[item.service_type] || 0) + (item.cost || 0);
        });

        // Calculate utilization rate
        const utilization = allVehicles.length > 0 
          ? rentedVehicles.length / allVehicles.length 
          : 0;

        // Return compiled metrics
        return {
          availableCount: availableVehicles.length,
          rentedCount: rentedVehicles.length,
          maintenanceCount: maintenanceVehicles.length,
          totalVehicles: allVehicles.length,
          byMake,
          byYear,
          utilization,
          maintenanceCosts: {
            total: totalCost,
            average: maintenanceData.length > 0 ? totalCost / maintenanceData.length : 0,
            byType
          }
        };
      } catch (err) {
        console.error('Error fetching vehicle metrics:', err);
        throw err;
      }
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Format data for status groups
  useEffect(() => {
    if (metrics) {
      // Format data for status groups
      const newStatusGroups: StatusGroup[] = [
        {
          name: 'Primary Statuses',
          icon: <Car />,
          items: [
            { status: 'available' as VehicleStatus, count: metrics.availableCount },
            { status: 'rented' as VehicleStatus, count: metrics.rentedCount },
            { status: 'maintenance' as VehicleStatus, count: metrics.maintenanceCount },
          ]
        },
        {
          name: 'By Make',
          icon: <Truck />,
          items: Object.entries(metrics.byMake)
            .slice(0, 5)
            .map(([make, count]) => ({ 
              status: make as VehicleStatus,
              count 
            }))
        },
        {
          name: 'Maintenance Services',
          icon: <Wrench />,
          items: Object.entries(metrics.maintenanceCosts.byType)
            .slice(0, 5)
            .map(([type, cost]) => ({ 
              status: type as VehicleStatus, 
              count: Math.round(cost) 
            }))
        }
      ];

      setStatusGroups(newStatusGroups);
    }
  }, [metrics]);

  return {
    metrics,
    statusGroups,
    isLoading,
    error
  };
};
