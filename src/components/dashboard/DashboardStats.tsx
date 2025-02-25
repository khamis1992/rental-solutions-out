
import { Car, Key, Wrench, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats?: {
    total_vehicles: number;
    available_vehicles: number;
    rented_vehicles: number;
    maintenance_vehicles: number;
    total_customers: number;
    active_rentals: number;
    monthly_revenue: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  // Add debug logging
  console.log("DashboardStats received stats:", stats);

  const fleetUtilization = stats?.total_vehicles 
    ? ((stats.rented_vehicles / stats.total_vehicles) * 100).toFixed(1) 
    : '0';

  // Ensure all values are numbers and not undefined
  const safeStats = {
    total_vehicles: stats?.total_vehicles || 0,
    rented_vehicles: stats?.rented_vehicles || 0,
    maintenance_vehicles: stats?.maintenance_vehicles || 0,
    active_rentals: stats?.active_rentals || 0,
    total_customers: stats?.total_customers || 0,
    monthly_revenue: stats?.monthly_revenue || 0
  };

  console.log("Calculated safe stats:", safeStats);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Fleet Utilization"
          value={`${fleetUtilization}%`}
          icon={Car}
          iconClassName="blue"
          description={
            <span className="text-muted-foreground text-xs">
              of fleet is currently rented
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={safeStats.active_rentals.toString()}
          icon={Key}
          iconClassName="purple"
          description={
            <span className="text-amber-600 text-xs flex items-center">
              <Wrench className="mr-1 h-4 w-4" />
              {safeStats.maintenance_vehicles} in maintenance
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(safeStats.monthly_revenue)}
          icon={Users}
          iconClassName="green"
          description={
            <span className="text-muted-foreground text-xs">
              {safeStats.total_customers} total customers
            </span>
          }
        />
      </div>
    </div>
  );
};
