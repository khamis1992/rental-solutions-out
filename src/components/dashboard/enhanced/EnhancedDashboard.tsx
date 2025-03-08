
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveStatistics } from "./LiveStatistics";
import { StatusGroupList } from "./StatusGroupList";
import { VehicleStatusDonut } from "./VehicleStatusDonut";
import { useVehicleMetrics } from "@/hooks/useVehicleMetrics";
import { useRealTimeVehicleUpdates } from "@/hooks/useRealTimeVehicleUpdates";
import { RealTimeIndicator } from "./RealTimeIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, BarChart3, PieChart, ActivitySquare, Calendar, Clock, ArrowRight } from "lucide-react";
import { StatusItem, VehicleStatus } from "@/types/dashboard.types";
import { VehicleStatusConfig } from "./VehicleStatusConfig";
import { DashboardHeader } from "./DashboardHeader";
import { KeyMetricsCards } from "./KeyMetricsCards";
import { RecentActivity } from "./RecentActivity";
import { Button } from "@/components/ui/button";
import { FinancialOverview } from "@/components/finance/dashboard/FinancialOverview";
import { QuickActions } from "./QuickActions";

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
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Header with Date, Time and Stats */}
      <DashboardHeader />
      
      {/* Key Metrics Grid */}
      <KeyMetricsCards metrics={metrics} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status Overview - Takes 2/3 of width on large screens */}
        <Card className="lg:col-span-2 overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 border-b border-border/20 bg-gradient-to-r from-card to-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5 text-primary/70" />
              Vehicle Fleet Status
              <div className="ml-auto">
                <RealTimeIndicator 
                  hasChanges={recentStatusChanges.length > 0} 
                  lastUpdate={lastUpdate} 
                  status={connectedStatus} 
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="stats" onClick={() => setCurrentView("stats")} className="data-[state=active]:bg-background/80">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Status Breakdown
                </TabsTrigger>
                <TabsTrigger value="charts" onClick={() => setCurrentView("charts")} className="data-[state=active]:bg-background/80">
                  <PieChart className="h-4 w-4 mr-2" />
                  Distribution Chart
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-background/80">
                  <ActivitySquare className="h-4 w-4 mr-2" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="pt-4 px-4 pb-4 animate-fade-in">
                <StatusGroupList 
                  statuses={statusItems}
                  statusConfigs={VehicleStatusConfig}
                  onStatusClick={handleStatusClick}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="charts" className="pt-6 pb-4 animate-fade-in">
                <div className="flex flex-col items-center">
                  <VehicleStatusDonut 
                    data={donutData} 
                    totalVehicles={metrics?.totalVehicles || 0} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="p-4 animate-fade-in">
                <RecentActivity 
                  activities={recentStatusChanges}
                  limit={5}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Financial Overview - Takes 1/3 of width on large screens */}
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 border-b border-border/20 bg-gradient-to-r from-card to-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary/70" />
              Financial Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <FinancialOverview />
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions and Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 border-b border-border/20 bg-gradient-to-r from-card to-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary/70" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <QuickActions />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 border-b border-border/20 bg-gradient-to-r from-card to-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary/70" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Vehicle Inspection</h4>
                    <p className="text-sm text-muted-foreground">Toyota Camry - ABC123</p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">Today</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Lease Expiration</h4>
                    <p className="text-sm text-muted-foreground">Honda Civic - XYZ789</p>
                  </div>
                  <span className="text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded">Tomorrow</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Maintenance Due</h4>
                    <p className="text-sm text-muted-foreground">BMW X5 - LMN456</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">In 2 days</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-2 text-sm">
                View Full Schedule <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
