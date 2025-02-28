
import { Car, Key, Wrench, Users, Activity, CreditCard, LineChart, UserCheck } from "lucide-react";
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
      {/* Main KPIs */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fleet Utilization"
          value={`${fleetUtilization}%`}
          icon={LineChart}
          iconClassName="indigo"
          trend="up"
          description="5.2% increase from last month"
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.active_rentals?.toString() || "0"}
          icon={Key}
          iconClassName="purple"
          trend="up"
          description="3.1% increase from last week"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthly_revenue || 0)}
          icon={CreditCard}
          iconClassName="green"
          trend="up"
          description="8.7% above monthly target"
        />
        <StatsCard
          title="Total Customers"
          value={stats?.total_customers?.toString() || "0"}
          icon={UserCheck}
          iconClassName="blue"
          trend="up"
          description="12 new customers this month"
        />
      </div>

      {/* Vehicle Status */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          title="Available Vehicles"
          value={stats?.available_vehicles?.toString() || "0"}
          icon={Car}
          iconClassName="teal"
          trend="neutral"
          description={
            <span className="text-muted-foreground text-xs">
              Ready for rental
            </span>
          }
        />
        <StatsCard
          title="Rented Vehicles"
          value={stats?.rented_vehicles?.toString() || "0"}
          icon={Activity}
          iconClassName="amber"
          trend="up"
          description={
            <span className="text-muted-foreground text-xs">
              Currently on the road
            </span>
          }
        />
        <StatsCard
          title="In Maintenance"
          value={stats?.maintenance_vehicles?.toString() || "0"}
          icon={Wrench}
          iconClassName="red"
          trend="down"
          description={
            <span className="text-muted-foreground text-xs">
              Under service or repair
            </span>
          }
        />
      </div>
    </div>
  );
};
