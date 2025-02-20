
import { Car, Key, Wrench, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats?: {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    totalCustomers: number;
    activeRentals: number;
    monthlyRevenue: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Fleet Utilization"
          value={`${stats ? ((stats.rentedVehicles / stats.totalVehicles) * 100).toFixed(1) : '0'}%`}
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
          value={stats?.activeRentals?.toString() || "0"}
          icon={Key}
          iconClassName="purple"
          description={
            <span className="text-amber-600 text-xs flex items-center">
              <Wrench className="mr-1 h-4 w-4" />
              {stats?.maintenanceVehicles || 0} in maintenance
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={Users}
          iconClassName="green"
          description={
            <span className="text-muted-foreground text-xs">
              {stats?.totalCustomers || 0} total customers
            </span>
          }
        />
      </div>
      
      <VehicleStatusChart />
    </div>
  );
};

export default DashboardStats;
