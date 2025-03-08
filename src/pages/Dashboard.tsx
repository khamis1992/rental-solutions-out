
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
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: statsData, error, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        // Try to use RPC function first
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        
        if (error) {
          console.error("RPC error:", error);
          throw error;
        }

        if (!data) {
          console.error("No data returned from dashboard stats RPC");
          // Fallback: Call Edge Function
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase
            .functions.invoke('get-dashboard-stats');
          
          if (edgeFunctionError) {
            console.error("Edge function error:", edgeFunctionError);
            throw edgeFunctionError;
          }
          
          return edgeFunctionData as DashboardStatsType;
        }

        // Convert the data to the correct format
        const statsData: DashboardStatsType = {
          total_vehicles: Number(data.total_vehicles || 0),
          available_vehicles: Number(data.available_vehicles || 0),
          rented_vehicles: Number(data.rented_vehicles || 0),
          maintenance_vehicles: Number(data.maintenance_vehicles || 0),
          total_customers: Number(data.total_customers || 0),
          active_rentals: Number(data.active_rentals || 0),
          monthly_revenue: Number(data.monthly_revenue || 0)
        };

        return statsData;
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (err: Error) => {
        toast.error("Failed to load dashboard stats: " + err.message);
      }
    }
  });

  useEffect(() => {
    if (error) {
      console.error("Dashboard stats error:", error);
      toast.error("Error loading dashboard data. Please try again later.");
    }
  }, [error]);

  const fadeInClass = mounted ? "opacity-100" : "opacity-0";

  return (
    <div className={`space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] transition-opacity duration-500 ${fadeInClass}`}>
      {/* Enhanced Welcome Card with Gradient Background */}
      <Card className="bg-gradient-to-r from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900/90 dark:via-indigo-900/30 dark:to-purple-900/20 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      {/* Dashboard Stats with Enhanced Visual Design */}
      <div className="grid gap-6">
        <DashboardStats stats={statsData} />
      </div>

      {/* Vehicle Status Chart with Interactive Elements */}
      <VehicleStatusChartV2 />

      {/* Activity & Notifications with Tabbed Interface */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* SmartNotifications Card with Styled Wrapper */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/70 hover:border-indigo-200/70 transition-all duration-300 shadow-md hover:shadow-lg h-[400px] overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Notifications & Alerts
            </h3>
          </div>
          <ScrollArea className="h-[336px]">
            <SmartNotifications />
          </ScrollArea>
        </Card>
        
        {/* Recent Activity with Enhanced Styling */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/70 hover:border-indigo-200/70 transition-all duration-300 shadow-md hover:shadow-lg h-[400px] overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-sky-500 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Recent Activity
            </h3>
            <Tabs defaultValue="all" className="w-[200px]">
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="important" className="text-xs">Important</TabsTrigger>
                <TabsTrigger value="new" className="text-xs">New</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="h-[336px]">
            <RecentActivity />
          </ScrollArea>
        </Card>
      </div>

      {/* Quick Actions with Advanced Layout */}
      <div className="w-full">
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
