
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card } from "@/components/ui/card";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { VehicleStatusChartV2 } from "@/components/dashboard/enhanced/VehicleStatusChartV2";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: statsData, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from dashboard stats");
      }

      // Convert the data to the correct format
      const statsData: DashboardStats = {
        total_vehicles: Number(data.total_vehicles || 0),
        available_vehicles: Number(data.available_vehicles || 0),
        rented_vehicles: Number(data.rented_vehicles || 0),
        maintenance_vehicles: Number(data.maintenance_vehicles || 0),
        total_customers: Number(data.total_customers || 0),
        active_rentals: Number(data.active_rentals || 0),
        monthly_revenue: Number(data.monthly_revenue || 0)
      };

      return statsData;
    },
    meta: {
      onError: (err: Error) => {
        toast.error("Failed to load dashboard stats: " + err.message);
      }
    }
  });

  const fadeInClass = mounted ? "opacity-100" : "opacity-0";

  return (
    <div className={`space-y-8 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] transition-opacity duration-500 ${fadeInClass}`}>
      {/* Welcome Card with Enterprise Styling */}
      <Card className="bg-gradient-to-r from-card to-muted/30 border-border/50 shadow-sm hover:shadow-md hover:border-border/70 transition-all duration-200">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      {/* Dashboard Stats with Enterprise Design */}
      <div className="grid gap-6">
        <DashboardStats stats={statsData} />
      </div>

      {/* Vehicle Status Chart with Enterprise Styling */}
      <VehicleStatusChartV2 />

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
            <SmartNotifications />
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
            <RecentActivity />
          </ScrollArea>
        </Card>
      </div>

      {/* Quick Actions with Enterprise Design */}
      <div className="w-full">
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
