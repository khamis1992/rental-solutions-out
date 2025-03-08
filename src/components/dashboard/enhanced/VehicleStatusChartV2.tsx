
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useVehicleStatus } from "@/hooks/useVehicleStatus";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GaugeCircle, TrendingUp, TrendingDown } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { STATUS_CONFIG } from "./VehicleStatusConfig";
import { ChartDataPoint } from "@/types/dashboard.types";
import { VehicleStatusDonut } from "./VehicleStatusDonut";
import { StatusGroupList } from "./StatusGroupList";
import { VehicleStatusMetrics } from "./VehicleStatusMetrics";
import { VehicleStatusDialog } from "./VehicleStatusDialog";

export const VehicleStatusChartV2 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  const [prevTotal, setPrevTotal] = useState<number>(0);
  
  // Use the custom hook to get all the vehicle data and statistics
  const { 
    vehicles, 
    statusCounts, 
    groupedStatuses, 
    isLoading, 
    error, 
    totalVehicles, 
    criticalCount 
  } = useVehicleStatus();

  // Show fleet size changes
  useEffect(() => {
    if (vehicles.length > 0 && prevTotal > 0) {
      const diff = vehicles.length - prevTotal;
      if (diff !== 0) {
        toast.info(
          `Fleet size ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)} vehicles`,
          {
            icon: diff > 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-red-500" />
          }
        );
      }
    }
    setPrevTotal(vehicles.length);
  }, [vehicles.length, prevTotal]);

  // Transform status counts into chart data format
  const chartData: ChartDataPoint[] = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
    value: count,
    color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "#6B7280",
  }));

  // Filter vehicles for the selected status
  const filteredVehicles = selectedStatus
    ? vehicles.filter((v) => v.status === selectedStatus)
    : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-2xl font-bold tracking-tight">Vehicle Status Distribution</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold">Vehicle Status Distribution</h3>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
            <p>Error loading vehicle status data: {(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <GaugeCircle className="h-6 w-6 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold tracking-tight">Vehicle Status Distribution</h3>
          </div>
          
          {/* Vehicle metrics component */}
          <VehicleStatusMetrics 
            totalVehicles={totalVehicles} 
            criticalCount={criticalCount} 
            isLoading={isLoading} 
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center">
              {/* Vehicle status donut chart component */}
              <VehicleStatusDonut 
                data={chartData} 
                totalVehicles={totalVehicles}
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Status group list component */}
                  <StatusGroupList 
                    groups={groupedStatuses}
                    onStatusClick={setSelectedStatus}
                    statusConfigs={STATUS_CONFIG}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle status dialog component */}
      <VehicleStatusDialog
        isOpen={!!selectedStatus}
        onClose={() => setSelectedStatus(null)}
        status={selectedStatus || "available"}
        vehicles={filteredVehicles}
        isLoading={isLoading}
      />
    </TooltipProvider>
  );
};
