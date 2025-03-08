
import { useState } from "react";
import { useVehicleStatus } from "@/hooks/useVehicleStatus";
import { StatusGroupList } from "./StatusGroupList";
import { LiveStatistics } from "./LiveStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleStatusDonut } from "./VehicleStatusDonut";
import { useVehicleMetrics } from "@/hooks/useVehicleMetrics";
import { formatCurrency } from "@/lib/utils";

export const EnhancedDashboard = () => {
  const { groupedStatuses, isLoading: statusesLoading } = useVehicleStatus();
  const { metrics, isLoading: metricsLoading } = useVehicleMetrics({
    refreshInterval: 60000, // 1 minute
    includeRealTimeUpdates: true
  });
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="space-y-8 p-4">
      <LiveStatistics />

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Vehicle Status</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicle Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {!metricsLoading && metrics && (
                  <VehicleStatusDonut
                    data={[
                      { name: 'Available', value: metrics.availableCount || 0 },
                      { name: 'Rented', value: metrics.rentedCount || 0 },
                      { name: 'Maintenance', value: metrics.maintenanceCount || 0 },
                      { name: 'Other', value: metrics.totalVehicles - (metrics.availableCount + metrics.rentedCount + metrics.maintenanceCount) || 0 },
                    ]}
                    totalVehicles={metrics.totalVehicles || 0}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.fleetUtilization ? `${Math.round(metrics.fleetUtilization)}%` : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of vehicles currently rented
                </p>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${metrics?.fleetUtilization || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.maintenanceRate ? `${Math.round(metrics.maintenanceRate)}%` : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vehicles currently in maintenance
                </p>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${metrics?.maintenanceRate || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <StatusGroupList 
            groupedStatuses={groupedStatuses} 
            isLoading={statusesLoading} 
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.avgDailyRevenue ? formatCurrency(metrics.avgDailyRevenue) : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per vehicle revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.revenueGrowth ? `${metrics.revenueGrowth}%` : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Month over month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.estimatedMaintenanceCost 
                    ? formatCurrency(metrics.estimatedMaintenanceCost) 
                    : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated total cost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mileage Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average:</span>
                    <span className="font-medium">
                      {metrics?.mileageStats?.avg ? `${metrics.mileageStats.avg.toLocaleString()} km` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maximum:</span>
                    <span className="font-medium">
                      {metrics?.mileageStats?.max ? `${metrics.mileageStats.max.toLocaleString()} km` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Minimum:</span>
                    <span className="font-medium">
                      {metrics?.mileageStats?.min ? `${metrics.mileageStats.min.toLocaleString()} km` : 'Loading...'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
