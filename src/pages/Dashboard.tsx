
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

interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

interface DashboardStatsResponse {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

const Dashboard = () => {
  // Add a direct query to verify raw data
  const { data: rawVehicles } = useQuery({
    queryKey: ["raw-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) {
        console.error("Error fetching raw vehicles:", error);
        throw error;
      }
      console.log("Raw vehicles data:", data);
      return data;
    }
  });

  // Add a direct query to verify raw customers
  const { data: rawCustomers } = useQuery({
    queryKey: ["raw-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');
      
      if (error) {
        console.error("Error fetching raw customers:", error);
        throw error;
      }
      console.log("Raw customers data:", data);
      return data;
    }
  });

  // Add a direct query to verify raw leases
  const { data: rawLeases } = useQuery({
    queryKey: ["raw-leases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error("Error fetching raw leases:", error);
        throw error;
      }
      console.log("Raw active leases data:", data);
      return data;
    }
  });

  const { data: statsData, error, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      console.log("Fetching dashboard stats...");

      // First try the RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc<DashboardStatsResponse>('get_dashboard_stats');
      
      if (rpcError) {
        console.error("RPC Error, falling back to direct queries:", rpcError);
        
        // Fallback to direct calculation if RPC fails
        const statsData: DashboardStats = {
          total_vehicles: rawVehicles?.length || 0,
          available_vehicles: rawVehicles?.filter(v => v.status === 'available').length || 0,
          rented_vehicles: rawVehicles?.filter(v => v.status === 'rented').length || 0,
          maintenance_vehicles: rawVehicles?.filter(v => v.status === 'maintenance').length || 0,
          total_customers: rawCustomers?.length || 0,
          active_rentals: rawLeases?.length || 0,
          monthly_revenue: rawLeases?.reduce((sum, lease) => sum + (lease.rent_amount || 0), 0) || 0
        };

        console.log("Calculated fallback stats:", statsData);
        return statsData;
      }

      if (!rpcData) {
        console.error("No data returned from dashboard stats");
        throw new Error("No data returned from dashboard stats");
      }

      console.log("Received RPC stats:", rpcData);

      const statsData: DashboardStats = {
        total_vehicles: Number(rpcData.total_vehicles ?? 0),
        available_vehicles: Number(rpcData.available_vehicles ?? 0),
        rented_vehicles: Number(rpcData.rented_vehicles ?? 0),
        maintenance_vehicles: Number(rpcData.maintenance_vehicles ?? 0),
        total_customers: Number(rpcData.total_customers ?? 0),
        active_rentals: Number(rpcData.active_rentals ?? 0),
        monthly_revenue: Number(rpcData.monthly_revenue ?? 0)
      };

      return statsData;
    },
    staleTime: 30000,
    meta: {
      onError: (err: Error) => {
        console.error("Dashboard stats error:", err);
        toast.error("Failed to load dashboard stats: " + err.message);
      }
    }
  });

  if (error) {
    console.error("Dashboard query error:", error);
    toast.error("Error loading dashboard data");
  }

  console.log("Current stats data:", statsData);

  return (
    <div className="space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] animate-fade-in">
      <Card className="bg-gradient-to-r from-purple-50/90 to-blue-50/90 dark:from-purple-900/20 dark:to-blue-900/20 border-none shadow-lg">
        <div className="p-6">
          <WelcomeHeader />
        </div>
      </Card>

      <div className="grid gap-6">
        <DashboardStats stats={statsData} />
      </div>

      <VehicleStatusChartV2 />

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
