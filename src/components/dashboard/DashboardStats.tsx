
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
  const fleetUtilization = stats?.total_vehicles 
    ? ((stats.rented_vehicles / stats.total_vehicles) * 100).toFixed(1) 
    : '0';

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
          value={stats?.active_rentals?.toString() || "0"}
          icon={Key}
          iconClassName="purple"
          description={
            <span className="text-amber-600 text-xs flex items-center">
              <Wrench className="mr-1 h-4 w-4" />
              {stats?.maintenance_vehicles || 0} in maintenance
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthly_revenue || 0)}
          icon={Users}
          iconClassName="green"
          description={
            <span className="text-muted-foreground text-xs">
              {stats?.total_customers || 0} total customers
            </span>
          }
        />
      </div>
    </div>
  );
};
