import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/types/dashboard.types";
import { supabase } from "@/integrations/supabase/client";
import { Car, CheckSquare, FileCheck, KeyRound, Users, Wrench, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data as DashboardStats;
    }
  });

  if (isStatsLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Vehicles"
          value={stats?.total_vehicles ?? 0}
          icon={<Car className="h-4 w-4" />}
        />
        <StatsCard
          title="Available Vehicles"
          value={stats?.available_vehicles ?? 0}
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatsCard
          title="Rented Vehicles"
          value={stats?.rented_vehicles ?? 0}
          icon={<KeyRound className="h-4 w-4" />}
        />
        <StatsCard
          title="In Maintenance"
          value={stats?.maintenance_vehicles ?? 0}
          icon={<Wrench className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Customers"
          value={stats?.total_customers ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.active_rentals ?? 0}
          icon={<FileCheck className="h-4 w-4" />}
        />
        <StatsCard
          title="Monthly Revenue"
          value={stats?.monthly_revenue ?? 0}
          icon={<DollarSign className="h-4 w-4" />}
          format="currency"
        />
      </div>
    </div>
  );
}
