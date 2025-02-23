
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "../charts/DonutChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { StatusGroupV2 } from "./StatusGroupV2";
import { VehicleStatusDialogV2 } from "./VehicleStatusDialogV2";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const STATUS_CONFIG = {
  available: { color: "#10B981", label: "Available", group: "operational" },
  rented: { color: "#3B82F6", label: "Rented", group: "operational" },
  maintenance: { color: "#F59E0B", label: "Maintenance", group: "attention" },
  reserve: { color: "#8B5CF6", label: "Reserved", group: "operational" },
  police_station: { color: "#8B5CF6", label: "Police Station", group: "critical" },
  accident: { color: "#EF4444", label: "Accident", group: "critical" },
  stolen: { color: "#1F2937", label: "Stolen", group: "critical" },
  retired: { color: "#6B7280", label: "Retired", group: "attention" },
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status Distribution</CardTitle>
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vehicle Status Distribution</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total Vehicles: {vehicles.length}
            </span>
          </CardTitle>
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
                primaryValue={chartData.reduce((sum, item) => sum + item.value, 0)}
                primaryLabel="Total Vehicles"
              />
            </div>
            <div className="space-y-6">
              <StatusGroupV2
                title="Operational"
                items={groupedStatuses.operational}
                onStatusClick={setSelectedStatus}
              />
              <StatusGroupV2
                title="Needs Attention"
                items={groupedStatuses.attention}
                onStatusClick={setSelectedStatus}
              />
              <StatusGroupV2
                title="Critical"
                items={groupedStatuses.critical}
                onStatusClick={setSelectedStatus}
              />
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
