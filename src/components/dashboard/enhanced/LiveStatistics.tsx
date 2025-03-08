
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { VehicleMetrics } from "@/hooks/useVehicleMetrics";
import { RealTimeVehicleUpdates } from "@/hooks/useRealTimeVehicleUpdates";
import { ArrowUpRight, ArrowDownRight, Car, Users, Banknote, Wrench } from "lucide-react";

interface LiveStatisticsProps {
  stats: DashboardStatsType | undefined;
  vehicleMetrics: VehicleMetrics | undefined;
  updates: RealTimeVehicleUpdates;
  isLoading: boolean;
}

export const LiveStatistics = ({ stats, vehicleMetrics, updates, isLoading }: LiveStatisticsProps) => {
  // Find vehicles with changed status in the last 24 hours
  const recentlyChangedCount = updates.recentStatusChanges?.length || 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Available Vehicles */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-emerald-500/10 pb-2">
          <CardTitle className="text-sm font-medium flex justify-between">
            <span className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-emerald-500" />
              Available Vehicles
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">{stats?.available_vehicles || 0}</div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground">Total: {stats?.total_vehicles || 0}</span>
                <div className="flex items-center mt-1 text-xs font-medium">
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {recentlyChangedCount} changes
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-blue-500/10 pb-2">
          <CardTitle className="text-sm font-medium flex justify-between">
            <span className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-blue-500" />
              Active Rentals
            </span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">{stats?.active_rentals || 0}</div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground">Rented: {stats?.rented_vehicles || 0}</span>
                <div className="flex items-center mt-1 text-xs font-medium">
                  <span className="text-blue-500 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    Utilization {vehicleMetrics?.fleetUtilization || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Vehicles */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-amber-500/10 pb-2">
          <CardTitle className="text-sm font-medium flex justify-between">
            <span className="flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-amber-500" />
              In Maintenance
            </span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">{stats?.maintenance_vehicles || 0}</div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground">
                  {(vehicleMetrics?.estimatedMaintenanceCost || 0) > 0 
                    ? formatCurrency(vehicleMetrics?.estimatedMaintenanceCost || 0) 
                    : 'N/A'}
                </span>
                <div className="flex items-center mt-1 text-xs font-medium">
                  <span className={`${
                    (stats?.maintenance_vehicles || 0) > 5 ? "text-red-500" : "text-amber-500"
                  } flex items-center gap-0.5`}>
                    {(stats?.maintenance_vehicles || 0) > 5 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {vehicleMetrics?.maintenanceRate || 0}% rate
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-purple-500/10 pb-2">
          <CardTitle className="text-sm font-medium flex justify-between">
            <span className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-purple-500" />
              Monthly Revenue
            </span>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.monthly_revenue || 0)}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground">Customers: {stats?.total_customers || 0}</span>
                <div className="flex items-center mt-1 text-xs font-medium">
                  <span className="text-purple-500 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {vehicleMetrics?.revenueGrowth || 0}% growth
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
