
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DonutChart } from "../charts/DonutChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { StatusGroupV2 } from "./StatusGroupV2";
import { VehicleStatusDialogV2 } from "./VehicleStatusDialogV2";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export const STATUS_CONFIG = {
  available: { color: "#10B981", label: "Available", group: "operational", icon: "🚗" },
  rented: { color: "#3B82F6", label: "Rented Out", group: "operational", icon: "📋" },
  maintenance: { color: "#F59E0B", label: "In Maintenance", group: "attention", icon: "⚠️" },
  reserve: { color: "#8B5CF6", label: "In Reserve", group: "operational", icon: "🚗" },
  police_station: { color: "#8B5CF6", label: "At Police Station", group: "attention", icon: "🏢" },
  accident: { color: "#EF4444", label: "In Accident", group: "critical", icon: "⚠️" },
  stolen: { color: "#1F2937", label: "Reported Stolen", group: "critical", icon: "🚫" },
  retired: { color: "#6B7280", label: "Retired", group: "attention", icon: "🔒" },
};

export const VehicleStatusChartV2 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*");

        if (error) {
          throw error;
        }

        return data as Vehicle[];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to fetch vehicles");
        return [];
      }
    },
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const chartData = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "#6B7280",
    }));
  }, [statusCounts]);

  const groupedStatuses = useMemo(() => {
    const grouped = {
      operational: [] as { status: VehicleStatus; count: number }[],
      attention: [] as { status: VehicleStatus; count: number }[],
      critical: [] as { status: VehicleStatus; count: number }[],
    };

    Object.entries(statusCounts).forEach(([status, count]) => {
      const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
      if (config) {
        grouped[config.group as keyof typeof grouped].push({
          status: status as VehicleStatus,
          count,
        });
      }
    });

    return grouped;
  }, [statusCounts]);

  const filteredVehicles = useMemo(() => {
    if (!selectedStatus) return [];
    return vehicles.filter((v) => v.status === selectedStatus);
  }, [selectedStatus, vehicles]);

  const criticalCount = useMemo(() => {
    return groupedStatuses.critical.reduce((sum, item) => sum + item.count, 0);
  }, [groupedStatuses.critical]);

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

  return (
    <>
      <Card className="bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-2xl font-bold tracking-tight">Vehicle Status Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Total Vehicles</span>
              <span className="text-2xl font-bold">{vehicles.length}</span>
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{criticalCount} critical</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center">
              <DonutChart 
                data={chartData} 
                config={{
                  width: 300,
                  height: 300,
                  innerRadius: 60,
                  outerRadius: 100,
                }}
                primaryValue={vehicles.length}
                primaryLabel="Total Vehicles"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-6">
                  <StatusGroupV2
                    title="Operational"
                    subtitle={`${groupedStatuses.operational.reduce((sum, item) => sum + item.count, 0)} vehicles`}
                    items={groupedStatuses.operational}
                    onStatusClick={setSelectedStatus}
                  />
                  <StatusGroupV2
                    title="Needs Attention"
                    subtitle={`${groupedStatuses.attention.reduce((sum, item) => sum + item.count, 0)} vehicles`}
                    items={groupedStatuses.attention}
                    onStatusClick={setSelectedStatus}
                  />
                  <StatusGroupV2
                    title="Critical"
                    subtitle={`${groupedStatuses.critical.reduce((sum, item) => sum + item.count, 0)} vehicles`}
                    items={groupedStatuses.critical}
                    onStatusClick={setSelectedStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <VehicleStatusDialogV2
        isOpen={!!selectedStatus}
        onClose={() => setSelectedStatus(null)}
        status={selectedStatus || "available"}
        vehicles={filteredVehicles}
        isLoading={isLoading}
      />
    </>
  );
};
