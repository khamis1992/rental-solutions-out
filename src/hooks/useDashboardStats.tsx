
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/dashboard.types';
import { toast } from 'sonner';

/**
 * Custom hook for fetching and subscribing to dashboard statistics
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_vehicles: 0,
    available_vehicles: 0,
    rented_vehicles: 0,
    maintenance_vehicles: 0,
    total_customers: 0,
    active_rentals: 0,
    monthly_revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      // Convert the JSON data to DashboardStats type
      const statsData: DashboardStats = {
        total_vehicles: data.total_vehicles || 0,
        available_vehicles: data.available_vehicles || 0,
        rented_vehicles: data.rented_vehicles || 0,
        maintenance_vehicles: data.maintenance_vehicles || 0,
        total_customers: data.total_customers || 0,
        active_rentals: data.active_rentals || 0,
        monthly_revenue: data.monthly_revenue || 0
      };
      
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates
    const vehicleSubscription = supabase
      .channel('vehicles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles' 
        }, 
        () => fetchStats()
      )
      .subscribe();

    const leasesSubscription = supabase
      .channel('leases-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leases' 
        }, 
        () => fetchStats()
      )
      .subscribe();

    const paymentsSubscription = supabase
      .channel('payments-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'unified_payments' 
        }, 
        () => fetchStats()
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      vehicleSubscription.unsubscribe();
      leasesSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, []);

  const refreshStats = () => {
    setIsLoading(true);
    fetchStats();
  };

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
};
