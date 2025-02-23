
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { VehicleStatus } from "@/types/vehicle";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, ArrowDown, BarChart3, CheckCircle2, Circle, Construction, Loader2 } from "lucide-react";
import { StatusGroupV3 } from "./StatusGroupV3";
import { cn } from "@/lib/utils";

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

  const operationalTotal = operationalStatuses.reduce((sum, { count }) => sum + count, 0);
  const attentionTotal = attentionStatuses.reduce((sum, { count }) => sum + count, 0);
  const criticalTotal = criticalStatuses.reduce((sum, { count }) => sum + count, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Vehicle Status Distribution</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total Vehicles: {totalVehicles}
          </div>
          {criticalTotal > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{criticalTotal} Critical</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className={cn(
          "p-4 rounded-lg border",
          "bg-green-50/50 dark:bg-green-900/10 border-green-100"
        )}>
          <StatusGroupV3
            title="Operational"
            total={operationalTotal}
            items={operationalStatuses}
            onStatusClick={handleStatusClick}
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
        </div>

        <div className={cn(
          "p-4 rounded-lg border",
          "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100"
        )}>
          <StatusGroupV3
            title="Needs Attention"
            total={attentionTotal}
            items={attentionStatuses}
            onStatusClick={handleStatusClick}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          />
        </div>

        <div className={cn(
          "p-4 rounded-lg border",
          "bg-red-50/50 dark:bg-red-900/10 border-red-100"
        )}>
          <StatusGroupV3
            title="Critical"
            total={criticalTotal}
            items={criticalStatuses}
            onStatusClick={handleStatusClick}
            icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          />
        </div>
      </div>
    </Card>
  );
};
