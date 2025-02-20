
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card } from "@/components/ui/card";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardStatsData {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalCustomers: number;
  activeRentals: number;
  monthlyRevenue: number;
}

const Dashboard = () => {
  const { data: stats } = useQuery<DashboardStatsData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) {
        throw error;
      }
      
      // Type assertion and data transformation
      return {
        totalVehicles: data.total_vehicles || 0,
        availableVehicles: data.available_vehicles || 0,
        rentedVehicles: data.rented_vehicles || 0,
        maintenanceVehicles: data.maintenance_vehicles || 0,
        totalCustomers: data.total_customers || 0,
        activeRentals: data.active_rentals || 0,
        monthlyRevenue: data.monthly_revenue || 0
      };
    }
  });

  return (
    <div className="space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] animate-fade-in">
      <Card className="bg-gradient-to-r from-purple-50/90 to-blue-50/90 dark:from-purple-900/20 dark:to-blue-900/20 border-none shadow-lg">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      <div className="grid gap-6">
        <DashboardStats stats={stats} />
      </div>

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

      <div className="w-full">
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
