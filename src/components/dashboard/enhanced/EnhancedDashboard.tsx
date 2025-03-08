
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveStatistics } from "./LiveStatistics";
import { StatusGroupList } from "./StatusGroupList";
import { VehicleStatusDonut } from "./VehicleStatusDonut";
import { useVehicleMetrics } from "@/hooks/useVehicleMetrics";
import { useRealTimeVehicleUpdates } from "@/hooks/useRealTimeVehicleUpdates";
import { RealTimeIndicator } from "./RealTimeIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, BarChart3, PieChart, ActivitySquare } from "lucide-react";
import { StatusItem, VehicleStatus } from "@/types/dashboard.types";
import { VehicleStatusConfig } from "./VehicleStatusConfig";

export const EnhancedDashboard = () => {
  const [currentView, setCurrentView] = useState<"stats" | "charts">("stats");
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  const { metrics, isLoading } = useVehicleMetrics();
  const { 
    lastUpdate, 
    connectedStatus, 
    recentStatusChanges 
  } = useRealTimeVehicleUpdates({
    notifyOnStatusChange: true,
    historyLimit: 5
  });

  // Prepare status items for the StatusGroupList
  const statusItems: StatusItem[] = [
    { status: 'available' as VehicleStatus, count: metrics?.availableCount || 0 },
    { status: 'rented' as VehicleStatus, count: metrics?.rentedCount || 0 },
    { status: 'maintenance' as VehicleStatus, count: metrics?.maintenanceCount || 0 },
  ];

  // Handle status click
  const handleStatusClick = (status: VehicleStatus) => {
    console.log(`Status clicked: ${status}`);
    setSelectedStatus(status);
    // Additional logic for filtering vehicles by status could be added here
  };

  // Convert metrics to chart data
  const donutData = [
    { name: "Available", value: metrics?.availableCount || 0, color: "#10b981" },
    { name: "Rented", value: metrics?.rentedCount || 0, color: "#3b82f6" },
    { name: "Maintenance", value: metrics?.maintenanceCount || 0, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <RealTimeIndicator 
          hasChanges={recentStatusChanges.length > 0} 
          lastUpdate={lastUpdate} 
          status={connectedStatus} 
        />
      </div>

      {/* Live Statistics */}
      <LiveStatistics />

      {/* Vehicle Status Overview */}
      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              Vehicle Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stats" className="mt-2">
              <TabsList>
                <TabsTrigger value="stats" onClick={() => setCurrentView("stats")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Status Breakdown
                </TabsTrigger>
                <TabsTrigger value="charts" onClick={() => setCurrentView("charts")}>
                  <PieChart className="h-4 w-4 mr-2" />
                  Distribution Chart
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <ActivitySquare className="h-4 w-4 mr-2" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-4">
                <StatusGroupList 
                  statuses={statusItems}
                  statusConfigs={VehicleStatusConfig}
                  onStatusClick={handleStatusClick}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="charts" className="mt-6">
                <div className="flex flex-col items-center">
                  <VehicleStatusDonut 
                    data={donutData} 
                    totalVehicles={metrics?.totalVehicles || 0} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                <div className="space-y-4">
                  {recentStatusChanges.length > 0 ? (
                    recentStatusChanges.map((change, index) => (
                      <div key={index} className="flex items-start p-3 border rounded-lg">
                        <div className="mr-3 mt-1">
                          <div className={`h-3 w-3 rounded-full ${
                            change.newStatus === 'available' ? 'bg-green-500' :
                            change.newStatus === 'rented' ? 'bg-blue-500' :
                            change.newStatus === 'maintenance' ? 'bg-orange-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{change.vehicle.make} {change.vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">
                            Status changed from <span className="font-medium">{change.oldStatus}</span> to{" "}
                            <span className="font-medium">{change.newStatus}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {change.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No recent status changes
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
