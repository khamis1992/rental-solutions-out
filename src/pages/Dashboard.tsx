
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) throw error;
      
      const typedData = data as DashboardStatsType;
      
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
      <Card className="bg-gradient-to-r from-purple-50/90 to-blue-50/90 dark:from-purple-900/20 dark:to-blue-900/20 border-none shadow-lg">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      <div className="grid gap-6">
        <DashboardStats stats={stats || {
          totalVehicles: 0,
          availableVehicles: 0,
          rentedVehicles: 0,
          maintenanceVehicles: 0,
          totalCustomers: 0,
          activeRentals: 0,
          monthlyRevenue: 0
        }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DashboardAlerts />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
