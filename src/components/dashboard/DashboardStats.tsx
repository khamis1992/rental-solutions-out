
import { Car, Key, DollarSign, TrendingUp, CarFront, TrendingDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        
        if (error) {
          console.error('Error fetching dashboard stats:', error);
          throw error;
        }
        
        return {
          totalVehicles: data?.total_vehicles || 0,
          rentedVehicles: data?.rented_vehicles || 0,
          monthlyRevenue: data?.monthly_revenue || 0,
          pendingReturns: data?.pending_returns || 0,
          growth: {
            vehicles: `+${data?.new_vehicles || 0} this month`,
            revenue: `${data?.revenue_growth?.toFixed(1) || 0}% from last month`
          }
        };
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        toast.error('Failed to load dashboard statistics');
        throw err;
      }
    },
    staleTime: 60000,
    retry: 2,
  });

  if (error) {
    console.error('Error in DashboardStats:', error);
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value="Error"
          icon={Car}
          iconClassName="red"
          description="Failed to load data"
        />
        <StatsCard
          title="Active Rentals"
          value="Error"
          icon={Key}
          iconClassName="red"
          description="Failed to load data"
        />
        <StatsCard
          title="Monthly Revenue"
          value="Error"
          icon={DollarSign}
          iconClassName="red"
          description="Failed to load data"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <Skeleton className="h-7 w-[200px] mb-4" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatsCard
        title="Total Vehicles"
        value={stats?.totalVehicles.toString() || "0"}
        icon={Car}
        iconClassName="blue"
        description={
          <span className="flex items-center text-emerald-600 text-xs">
            <TrendingUp className="mr-1 h-4 w-4" />
            {stats?.growth.vehicles}
          </span>
        }
      />
      <StatsCard
        title="Active Rentals"
        value={stats?.rentedVehicles.toString() || "0"}
        icon={Key}
        iconClassName="purple"
        description={
          <span className="text-amber-600 text-xs flex items-center">
            <CarFront className="mr-1 h-4 w-4" />
            {stats?.pendingReturns} pending returns
          </span>
        }
      />
      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(stats?.monthlyRevenue || 0)}
        icon={DollarSign}
        iconClassName="green"
        description={
          <span className="flex items-center text-emerald-600 text-xs">
            <TrendingUp className="mr-1 h-4 w-4" />
            {stats?.growth.revenue}
          </span>
        }
      />
    </div>
  );
};

export default DashboardStats;
