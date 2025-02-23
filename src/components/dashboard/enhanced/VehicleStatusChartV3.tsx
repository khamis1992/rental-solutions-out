
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { VehicleStatus } from "@/types/vehicle";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, ArrowDown, BarChart3, CheckCircle2, Circle, Construction, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusItem {
  status: VehicleStatus;
  count: number;
  label: string;
  icon: JSX.Element;
  color: string;
}

export const VehicleStatusChartV3 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);

  const { data: counts = {}, isLoading } = useQuery({
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

  const statusGroups = {
    operational: {
      title: "Operational",
      bgClass: "bg-green-50/50 dark:bg-green-900/10 border-green-100",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      statuses: {
        available: {
          label: "Available",
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          color: "#22c55e"
        },
        rented: {
          label: "Rented",
          icon: <Circle className="w-5 h-5 text-blue-500" />,
          color: "#3b82f6"
        }
      }
    },
    attention: {
      title: "Needs Attention",
      bgClass: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      statuses: {
        maintenance: {
          label: "Maintenance",
          icon: <Construction className="w-5 h-5 text-amber-500" />,
          color: "#f59e0b"
        },
        repair: {
          label: "Repair",
          icon: <Loader2 className="w-5 h-5 text-orange-500" />,
          color: "#f97316"
        }
      }
    },
    critical: {
      title: "Critical",
      bgClass: "bg-red-50/50 dark:bg-red-900/10 border-red-100",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      statuses: {
        accident: {
          label: "Accident",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          color: "#ef4444"
        },
        inactive: {
          label: "Inactive",
          icon: <ArrowDown className="w-5 h-5 text-slate-500" />,
          color: "#94a3b8"
        }
      }
    }
  };

  const renderStatusGroup = (group: typeof statusGroups.operational) => {
    const groupStatuses = Object.entries(group.statuses).map(([status, config]) => ({
      status: status as VehicleStatus,
      count: counts[status] || 0,
      ...config
    }));

    const groupTotal = groupStatuses.reduce((sum, { count }) => sum + count, 0);

    return (
      <div className={cn("p-6 rounded-lg border", group.bgClass)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {group.icon}
            <h3 className="text-sm font-medium">{group.title}</h3>
          </div>
          <div className="text-sm font-semibold">
            {groupTotal} vehicles
          </div>
        </div>
        <div className="space-y-3">
          {groupStatuses.map(({ status, count, label, icon }) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status === selectedStatus ? null : status)}
              className={cn(
                "w-full flex items-center justify-between",
                "p-3 rounded-lg",
                "transition-all duration-200",
                "hover:bg-background/80 active:bg-background",
                "hover:scale-[1.02]",
                "border border-transparent hover:border-border",
                selectedStatus === status && "bg-background/60 border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {icon}
                </div>
                <span className="text-sm font-medium">
                  {label}
                </span>
              </div>
              <div className="text-sm font-bold">{count}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 pb-6 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Vehicle Status Distribution</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total Vehicles: {totalVehicles}
          </div>
          {(counts.accident || 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{counts.accident} Critical</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderStatusGroup(statusGroups.operational)}
        {renderStatusGroup(statusGroups.attention)}
        {renderStatusGroup(statusGroups.critical)}
      </div>
    </Card>
  );
};
