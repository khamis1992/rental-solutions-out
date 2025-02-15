
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import type { MaintenanceRecord } from "@/types/maintenance";

const Maintenance = () => {
  const { data: maintenanceData = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          *,
          vehicles (
            id,
            make,
            model,
            year,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
      }

      return (data || []) as MaintenanceRecord[];
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 group">
                <div className="p-3 bg-yellow-500/10 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow-500/20">
                  <Wrench className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600">
                    Maintenance Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Track and manage vehicle maintenance and repairs
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm text-muted-foreground">
                {maintenanceData.filter(m => m.status === 'urgent').length} urgent tasks
              </span>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Stats Section */}
        <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <CardContent className="p-6">
            <ErrorBoundary>
              <MaintenanceStats maintenanceData={maintenanceData} />
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Maintenance List Section */}
        <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <ErrorBoundary>
              <MaintenanceList />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
