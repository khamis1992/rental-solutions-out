
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useRealTimeStats = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { 
    data: stats, 
    error, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from dashboard stats");
      }

      // Convert the data to the correct format
      const statsData: DashboardStats = {
        total_vehicles: Number(data.total_vehicles || 0),
        available_vehicles: Number(data.available_vehicles || 0),
        rented_vehicles: Number(data.rented_vehicles || 0),
        maintenance_vehicles: Number(data.maintenance_vehicles || 0),
        total_customers: Number(data.total_customers || 0),
        active_rentals: Number(data.active_rentals || 0),
        monthly_revenue: Number(data.monthly_revenue || 0)
      };

      return statsData;
    },
  });

  useEffect(() => {
    if (isSubscribed) return;

    // Subscribe to changes in vehicles table
    const vehiclesChannel = supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        () => {
          refetch();
          toast.info('Vehicle data updated');
        }
      )
      .subscribe();
    
    // Subscribe to changes in leases table
    const leasesChannel = supabase
      .channel('leases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases'
        },
        () => {
          refetch();
          toast.info('Rental data updated');
        }
      )
      .subscribe();

    // Subscribe to changes in unified_payments table
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_payments'
        },
        () => {
          refetch();
          toast.info('Payment data updated');
        }
      )
      .subscribe();

    setIsSubscribed(true);

    return () => {
      supabase.removeChannel(vehiclesChannel);
      supabase.removeChannel(leasesChannel);
      supabase.removeChannel(paymentsChannel);
      setIsSubscribed(false);
    };
  }, [refetch, isSubscribed]);

  return { stats, error, isLoading };
};
