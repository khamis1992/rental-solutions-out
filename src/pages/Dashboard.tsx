
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { Card } from "@/components/ui/card";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) throw error;
      
      // Type assertion to ensure the data matches our expected structure
      const typedData = data as {
        total_vehicles: number;
        available_vehicles: number;
        rented_vehicles: number;
        maintenance_vehicles: number;
        total_customers: number;
        active_rentals: number;
        monthly_revenue: number;
      };
      
      return {
        totalVehicles: typedData.total_vehicles,
        availableVehicles: typedData.available_vehicles,
        rentedVehicles: typedData.rented_vehicles,
        maintenanceVehicles: typedData.maintenance_vehicles,
        totalCustomers: typedData.total_customers,
        activeRentals: typedData.active_rentals,
        monthlyRevenue: typedData.monthly_revenue
      };
    },
    staleTime: 30000,
  });

  return (
    <div className="space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] animate-fade-in">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-purple-50/90 to-blue-50/90 dark:from-purple-900/20 dark:to-blue-900/20 border-none shadow-lg">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      {/* Dashboard Stats */}
      <div className="grid gap-6">
        <DashboardStats stats={stats} />
      </div>

      {/* Two Column Layout for Notifications and Activity */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:border-gray-300 transition-all duration-300 h-[400px]">
          <ScrollArea className="h-full">
            <SmartNotifications />
          </ScrollArea>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:border-gray-300 transition-all duration-300 h-[400px]">
          <ScrollArea className="h-full">
            <RecentActivity />
          </ScrollArea>
        </Card>
      </div>

      {/* Quick Actions - Full Width */}
      <div className="w-full">
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
