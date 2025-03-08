
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useVehicleMetrics } from "@/hooks/useVehicleMetrics";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { useRealTimeVehicleUpdates } from "@/hooks/useRealTimeVehicleUpdates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleStatusChartV2 } from "@/components/dashboard/enhanced/VehicleStatusChartV2";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RealTimeIndicator } from "./RealTimeIndicator";
import { LiveStatistics } from "./LiveStatistics";

export const EnhancedDashboard = () => {
  const [mounted, setMounted] = useState(false);
  
  // Use our real-time stats hook
  const { stats, isLoading, error } = useDashboardStats();
  
  // Use vehicle metrics for enhanced vehicle data
  const { metrics: vehicleMetrics } = useVehicleMetrics();
  
  // Subscribe to real-time updates
  const dashboardUpdates = useDashboardSubscriptions({
    enableToasts: true,
    onVehicleChange: (payload) => {
      console.log("Vehicle update received:", payload);
    },
    onPaymentChange: (payload) => {
      console.log("Payment update received:", payload);
    }
  });
  
  // Subscribe to real-time vehicle status updates
  const vehicleUpdates = useRealTimeVehicleUpdates({
    notifyOnStatusChange: true,
    includeLocation: false,
    onUpdate: (vehicle) => {
      console.log("Vehicle status changed:", vehicle);
    }
  });

  useEffect(() => {
    setMounted(true);
    
    // Show toast if there are changes
    if (mounted && dashboardUpdates.hasChanges) {
      toast.info(`Dashboard updated with ${dashboardUpdates.vehicleChanges + dashboardUpdates.paymentChanges + dashboardUpdates.customerChanges} changes`);
    }
  }, [mounted, dashboardUpdates.hasChanges, dashboardUpdates.vehicleChanges, dashboardUpdates.paymentChanges, dashboardUpdates.customerChanges]);

  const fadeInClass = mounted ? "opacity-100" : "opacity-0";

  return (
    <div className={`space-y-8 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] transition-opacity duration-500 ${fadeInClass}`}>
      {/* Welcome Card with Enterprise Styling */}
      <Card className="bg-gradient-to-r from-card to-muted/30 border-border/50 shadow-sm hover:shadow-md hover:border-border/70 transition-all duration-200">
        <div className="p-6 flex justify-between items-center">
          <WelcomeHeader />
          <RealTimeIndicator 
            hasChanges={dashboardUpdates.hasChanges}
            lastUpdate={dashboardUpdates.lastUpdate}
          />
        </div>
      </Card>

      {/* Live Statistics Panel */}
      <LiveStatistics 
        stats={stats} 
        vehicleMetrics={vehicleMetrics}
        updates={vehicleUpdates}
        isLoading={isLoading}
      />

      {/* Dashboard Stats with Enterprise Design */}
      <div className="grid gap-6">
        <ErrorBoundary>
          <DashboardStats 
            stats={stats} 
            isLoading={isLoading} 
            error={error as Error}
          />
        </ErrorBoundary>
      </div>

      {/* Vehicle Status Chart with Enterprise Styling */}
      <ErrorBoundary>
        <VehicleStatusChartV2 />
      </ErrorBoundary>

      {/* Activity & Notifications with Tabbed Interface */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* SmartNotifications Card with Enterprise Styling */}
        <Card className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-border/70 transition-all duration-200 shadow-sm hover:shadow-md h-[400px] overflow-hidden group">
          <div className="h-1 w-full bg-primary/80 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2 tracking-tight">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Notifications & Alerts
            </h3>
          </div>
          <ScrollArea className="h-[342px]">
            <ErrorBoundary>
              <SmartNotifications />
            </ErrorBoundary>
          </ScrollArea>
        </Card>
        
        {/* Recent Activity with Enterprise Styling */}
        <Card className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-border/70 transition-all duration-200 shadow-sm hover:shadow-md h-[400px] overflow-hidden group">
          <div className="h-1 w-full bg-success/80 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2 tracking-tight">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse"></span>
              Recent Activity
            </h3>
            <Tabs defaultValue="all" className="w-[200px]">
              <TabsList className="grid grid-cols-3 h-8 bg-muted/50">
                <TabsTrigger value="all" className="text-xs font-medium">All</TabsTrigger>
                <TabsTrigger value="important" className="text-xs font-medium">Important</TabsTrigger>
                <TabsTrigger value="new" className="text-xs font-medium">New</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="h-[342px]">
            <ErrorBoundary>
              <RecentActivity />
            </ErrorBoundary>
          </ScrollArea>
        </Card>
      </div>

      {/* Quick Actions with Enterprise Design */}
      <div className="w-full">
        <ErrorBoundary>
          <QuickActions />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
