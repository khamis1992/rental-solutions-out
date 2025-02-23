
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { VehicleStatus } from "@/types/vehicle";
import { DonutChart } from "../charts/DonutChart";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, ArrowDown, BarChart3, CheckCircle2, Circle, Construction, Loader2 } from "lucide-react";
import { StatusGroupV3 } from "./StatusGroupV3";

export const STATUS_CONFIG_V3 = {
  available: {
    label: "Available",
    color: "#22c55e",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    group: "operational"
  },
  rented: {
    label: "Rented",
    color: "#3b82f6",
    icon: <Circle className="w-5 h-5 text-blue-500" />,
    group: "operational"
  },
  maintenance: {
    label: "Maintenance",
    color: "#f59e0b",
    icon: <Construction className="w-5 h-5 text-amber-500" />,
    group: "attention"
  },
  repair: {
    label: "Repair",
    color: "#f97316",
    icon: <Loader2 className="w-5 h-5 text-orange-500" />,
    group: "attention"
  },
  accident: {
    label: "Accident",
    color: "#ef4444",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    group: "critical"
  },
  inactive: {
    label: "Inactive",
    color: "#94a3b8",
    icon: <ArrowDown className="w-5 h-5 text-slate-500" />,
    group: "inactive"
  }
};

export const VehicleStatusChartV3 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);

  const { data: counts = {} } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        throw error;
      }

      const statusCounts: Record<string, number> = {};
      data.forEach(vehicle => {
        statusCounts[vehicle.status] = (statusCounts[vehicle.status] || 0) + 1;
      });

      return statusCounts;
    },
    meta: {
      onError: (err: Error) => {
        toast.error("Failed to load vehicle status data");
      }
    }
  });

  const totalVehicles = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const chartData = Object.entries(counts).map(([status, count]) => ({
    name: STATUS_CONFIG_V3[status as VehicleStatus]?.label || status,
    value: count,
    color: STATUS_CONFIG_V3[status as VehicleStatus]?.color || "#000000"
  }));

  const handleStatusClick = (status: VehicleStatus) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const operationalStatuses = Object.entries(counts)
    .filter(([status]) => STATUS_CONFIG_V3[status as VehicleStatus]?.group === "operational")
    .map(([status, count]) => ({ status: status as VehicleStatus, count }));

  const attentionStatuses = Object.entries(counts)
    .filter(([status]) => STATUS_CONFIG_V3[status as VehicleStatus]?.group === "attention")
    .map(([status, count]) => ({ status: status as VehicleStatus, count }));

  const criticalStatuses = Object.entries(counts)
    .filter(([status]) => STATUS_CONFIG_V3[status as VehicleStatus]?.group === "critical")
    .map(([status, count]) => ({ status: status as VehicleStatus, count }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Vehicle Status Distribution</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Vehicles: {totalVehicles}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-6">
        <div className="flex items-center justify-center">
          <DonutChart
            data={chartData}
            config={{
              width: 320,
              height: 320,
              innerRadius: 70,
              outerRadius: 110,
            }}
            primaryValue={totalVehicles}
            primaryLabel="Total Vehicles"
          />
        </div>

        <div className="grid gap-6">
          {operationalStatuses.length > 0 && (
            <Card className="p-4 border-green-100 bg-green-50/50 dark:bg-green-900/10">
              <StatusGroupV3
                title="Operational"
                items={operationalStatuses}
                onStatusClick={handleStatusClick}
                icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
              />
            </Card>
          )}

          {attentionStatuses.length > 0 && (
            <Card className="p-4 border-amber-100 bg-amber-50/50 dark:bg-amber-900/10">
              <StatusGroupV3
                title="Attention Required"
                items={attentionStatuses}
                onStatusClick={handleStatusClick}
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
              />
            </Card>
          )}

          {criticalStatuses.length > 0 && (
            <Card className="p-4 border-red-100 bg-red-50/50 dark:bg-red-900/10">
              <StatusGroupV3
                title="Critical"
                subtitle="Requires Immediate Action"
                items={criticalStatuses}
                onStatusClick={handleStatusClick}
                icon={<AlertCircle className="w-5 h-5 text-red-500" />}
              />
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};
