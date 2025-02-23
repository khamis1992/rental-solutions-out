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
import { AlertTriangle, Building, Car, CheckCircle2, AlertCircle, GaugeCircle, Key, Lock, Ban, ParkingCircle, RefreshCw, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export const STATUS_CONFIG = {
  available: {
    color: "#10B981",
    label: "Available",
    group: "operational",
    icon: <Car className="text-emerald-500" />,
    description: "Vehicles ready for rental"
  },
  rented: {
    color: "#3B82F6",
    label: "Rented Out",
    group: "operational",
    icon: <Key className="text-blue-500" />,
    description: "Currently with customers"
  },
  maintenance: {
    color: "#F59E0B",
    label: "In Maintenance",
    group: "attention",
    icon: <Wrench className="text-amber-500" />,
    description: "Under maintenance or repair"
  },
  reserve: {
    color: "#8B5CF6",
    label: "In Reserve",
    group: "operational",
    icon: <ParkingCircle className="text-violet-500" />,
    description: "Reserved for future bookings"
  },
  police_station: {
    color: "#8B5CF6",
    label: "At Police Station",
    group: "attention",
    icon: <Building className="text-violet-500" />,
    description: "At police station for documentation"
  },
  accident: {
    color: "#EF4444",
    label: "In Accident",
    group: "critical",
    icon: <AlertTriangle className="text-red-500" />,
    description: "Involved in accidents"
  },
  stolen: {
    color: "#1F2937",
    label: "Reported Stolen",
    group: "critical",
    icon: <Ban className="text-gray-800 dark:text-gray-200" />,
    description: "Reported as stolen"
  },
  retired: {
    color: "#6B7280",
    label: "Retired",
    group: "attention",
    icon: <Lock className="text-gray-500" />,
    description: "No longer in service"
  }
};
const GROUP_ICONS = {
  operational: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  attention: <AlertCircle className="h-5 w-5 text-amber-500" />,
  critical: <AlertTriangle className="h-5 w-5 text-red-500" />
};
export const VehicleStatusChartV2 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  const [prevTotal, setPrevTotal] = useState<number>(0);
  const {
    data: vehicles = [],
    isLoading
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("vehicles").select("*");
        if (error) {
          throw error;
        }
        return data as Vehicle[];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to fetch vehicles");
        return [];
      }
    }
  });
  useEffect(() => {
    if (vehicles.length > 0 && prevTotal > 0) {
      const diff = vehicles.length - prevTotal;
      if (diff !== 0) {
        toast.info(`Fleet size ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)} vehicles`, {
          icon: diff > 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-red-500" />
        });
      }
    }
    setPrevTotal(vehicles.length);
  }, [vehicles.length, prevTotal]);
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach(vehicle => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);
  const chartData = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "#6B7280"
    }));
  }, [statusCounts]);
  const groupedStatuses = useMemo(() => {
    const grouped = {
      operational: [] as {
        status: VehicleStatus;
        count: number;
      }[],
      attention: [] as {
        status: VehicleStatus;
        count: number;
      }[],
      critical: [] as {
        status: VehicleStatus;
        count: number;
      }[]
    };
    Object.entries(statusCounts).forEach(([status, count]) => {
      const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
      if (config) {
        grouped[config.group as keyof typeof grouped].push({
          status: status as VehicleStatus,
          count
        });
      }
    });
    return grouped;
  }, [statusCounts]);
  const filteredVehicles = useMemo(() => {
    if (!selectedStatus) return [];
    return vehicles.filter(v => v.status === selectedStatus);
  }, [selectedStatus, vehicles]);
  const criticalCount = useMemo(() => {
    return groupedStatuses.critical.reduce((sum, item) => sum + item.count, 0);
  }, [groupedStatuses.critical]);
  if (isLoading) {
    return <Card>
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
      </Card>;
  }
  return <TooltipProvider>
      <Card className="bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <GaugeCircle className="h-6 w-6 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold tracking-tight">Vehicle Status Distribution</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground px-[79px]">Total Vehicles</span>
              <div className="flex items-center gap-2 px-[100px]">
                <Car className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{vehicles.length}</span>
              </div>
            </div>
            {criticalCount > 0 && <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{criticalCount} critical</span>
              </div>}
            {isLoading && <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center">
              <DonutChart data={chartData} config={{
              width: 300,
              height: 300,
              innerRadius: 60,
              outerRadius: 100
            }} primaryValue={vehicles.length} primaryLabel="Total Vehicles" />
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(groupedStatuses).map(([group, items]) => <div key={group} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {GROUP_ICONS[group as keyof typeof GROUP_ICONS]}
                          <h3 className="text-sm text-muted-foreground font-medium capitalize">
                            {group}
                          </h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {items.reduce((sum, item) => sum + item.count, 0)} vehicles
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map(({
                      status,
                      count
                    }) => {
                      const config = STATUS_CONFIG[status];
                      return <Tooltip key={status}>
                              <TooltipTrigger asChild>
                                <button onClick={() => setSelectedStatus(status)} className={cn("w-full flex items-center justify-between p-2 rounded-lg", "transition-all duration-200", "hover:bg-muted/50 active:bg-muted", "hover:scale-[1.02]", "border border-transparent hover:border-border", config?.group === "critical" && "hover:bg-red-500/10 dark:hover:bg-red-500/20")}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{config?.icon}</span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {config?.label || status}
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold">{count}</div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{config?.description}</p>
                              </TooltipContent>
                            </Tooltip>;
                    })}
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <VehicleStatusDialogV2 isOpen={!!selectedStatus} onClose={() => setSelectedStatus(null)} status={selectedStatus || "available"} vehicles={filteredVehicles} isLoading={isLoading} />
    </TooltipProvider>;
};