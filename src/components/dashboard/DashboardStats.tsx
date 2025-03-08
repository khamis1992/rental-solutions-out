
import { Car, Key, Wrench, Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

  const isGoodUtilization = Number(fleetUtilization) > 70;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Fleet Utilization"
          value={`${fleetUtilization}%`}
          icon={Car}
          iconClassName="indigo"
          description={
            <span className={cn(
              "text-xs flex items-center gap-1",
              isGoodUtilization ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {isGoodUtilization ? 
                <ArrowUp className="h-3 w-3" /> : 
                <ArrowDown className="h-3 w-3" />
              }
              <span>
                {isGoodUtilization ? "Good utilization" : "Room for improvement"}
              </span>
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.active_rentals?.toString() || "0"}
          icon={Key}
          iconClassName="purple"
          description={
            <span className="text-amber-600 dark:text-amber-400 text-xs flex items-center">
              <Wrench className="mr-1 h-3.5 w-3.5" />
              {stats?.maintenance_vehicles || 0} in maintenance
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthly_revenue || 0)}
          icon={TrendingUp}
          iconClassName="green"
          description={
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{stats?.total_customers || 0} total customers</span>
            </span>
          }
        />
      </div>
    </div>
  );
};
