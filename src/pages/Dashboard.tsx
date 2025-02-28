
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
import { ArrowUp, ArrowDown, Equal } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
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
      {/* Enhanced Welcome Card with 3D Effect and Gradient */}
      <Card className="bg-gradient-to-r from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900/90 dark:via-indigo-900/30 dark:to-purple-900/20 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      {/* Dashboard Stats with Enhanced Visual Design */}
      <div className="grid gap-6">
        <DashboardStats stats={statsData} />
      </div>

      {/* Vehicle Status Chart with Interactive Elements */}
      <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg rounded-xl overflow-hidden">
        <VehicleStatusChartV2 />
      </div>

      {/* Activity & Notifications with Tabbed Interface */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* SmartNotifications Card with Advanced Styling */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/70 hover:border-indigo-200/70 transition-all duration-300 shadow-md hover:shadow-lg h-[450px] overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Notifications & Alerts
            </h3>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              New
            </span>
          </div>
          <ScrollArea className="h-[386px]">
            <div className="p-1">
              <SmartNotifications />
            </div>
          </ScrollArea>
        </Card>
        
        {/* Recent Activity with Enhanced Styling */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/70 hover:border-indigo-200/70 transition-all duration-300 shadow-md hover:shadow-lg h-[450px] overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-sky-500 transform origin-left group-hover:scale-x-105 transition-transform duration-300"></div>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Recent Activity
            </h3>
            <Tabs defaultValue="all" className="w-[200px]" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="important" className="text-xs">Important</TabsTrigger>
                <TabsTrigger value="new" className="text-xs">New</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="h-[386px]">
            <div className="p-1">
              <RecentActivity />
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Business Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-sm border border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 group hover:border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Revenue Growth</h3>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <div className="h-[150px] bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 rounded-lg flex items-center justify-center mb-4">
            {/* Placeholder for a chart */}
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold text-emerald-600">$32,580</span>
              <span className="text-sm text-slate-500">Monthly average</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Past Month</p>
              <p className="font-medium text-emerald-600">$35,240</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">This Month</p>
              <p className="font-medium text-emerald-600">$39,450</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Projection</p>
              <p className="font-medium text-emerald-600">$42,800</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-sm border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 group hover:border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Vehicle Utilization</h3>
            <span className="flex items-center text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded-full">
              <Equal className="w-3 h-3 mr-1" />
              0%
            </span>
          </div>
          <div className="h-[150px] bg-gradient-to-r from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center mb-4">
            {/* Placeholder for a chart */}
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold text-blue-600">85%</span>
              <span className="text-sm text-slate-500">Average utilization</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Sedans</p>
              <p className="font-medium text-blue-600">92%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">SUVs</p>
              <p className="font-medium text-blue-600">78%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Luxury</p>
              <p className="font-medium text-blue-600">65%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-sm border border-amber-100 shadow-md hover:shadow-lg transition-all duration-300 group hover:border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Customer Satisfaction</h3>
            <span className="flex items-center text-amber-600 text-sm font-medium bg-amber-50 px-2 py-1 rounded-full">
              <ArrowDown className="w-3 h-3 mr-1" />
              -2%
            </span>
          </div>
          <div className="h-[150px] bg-gradient-to-r from-amber-500/20 to-amber-500/5 rounded-lg flex items-center justify-center mb-4">
            {/* Placeholder for a chart */}
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold text-amber-600">4.7</span>
              <span className="text-sm text-slate-500">Average rating</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Service</p>
              <p className="font-medium text-amber-600">4.8</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Vehicle</p>
              <p className="font-medium text-amber-600">4.6</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <p className="font-medium text-amber-600">4.3</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions with Advanced Layout */}
      <div className="w-full transform transition-all duration-300 hover:translate-y-[-2px]">
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
