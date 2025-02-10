import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { ChartStatusSelect } from "./charts/ChartStatusSelect";
import { DonutChart } from "./charts/DonutChart";
import { ChartLegend } from "./charts/ChartLegend";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  Car, AlertOctagon, CheckCircle2, Wrench, Shield, 
  Key, AlertTriangle, Clock 
} from "lucide-react";

const STATUS_COLORS = {
  accident: "#ea384c",      // Red
  available: "#0FA0CE",     // Bright Blue
  maintenance: "#F97316",   // Orange
  police_station: "#1A1F2C", // Dark Purple
  rented: "#9b87f5",        // Purple
  stolen: "#D946EF",        // Magenta
  reserve: "#8E9196",       // Gray
} as const;

const STATUS_ICONS = {
  accident: AlertOctagon,
  available: CheckCircle2,
  maintenance: Wrench,
  police_station: Shield,
  rented: Key,
  stolen: AlertTriangle,
  reserve: Clock,
} as const;

type VehicleStatus = keyof typeof STATUS_COLORS;

const config = {
  ...Object.entries(STATUS_COLORS).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: {
      color: value,
    },
  }), {}),
  background: {
    theme: {
      light: "#F1F0FB",
      dark: "#1A1F2C",
    }
  }
};

interface VehicleStatusChartProps {
  onStatusChange?: (status: string) => void;
}

export const VehicleStatusChart = ({ onStatusChange }: VehicleStatusChartProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onStatusChange?.(status);
  };

  const { data: vehicleCounts, isLoading, error } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      console.log("Fetching vehicle status counts...");
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch vehicle status data",
          variant: "destructive",
        });
        throw error;
      }

      const counts = vehicles.reduce((acc, vehicle) => {
        const status = vehicle.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const data = Object.entries(counts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
        color: STATUS_COLORS[status as VehicleStatus] || "#CBD5E1",
        Icon: STATUS_ICONS[status as VehicleStatus] || Car
      }));

      console.log("Vehicle counts:", data);
      return data;
    },
    refetchInterval: 30000,
  });

  const filteredData = useMemo(() => {
    if (!vehicleCounts) return [];
    return selectedStatus === "all" 
      ? vehicleCounts 
      : vehicleCounts.filter(item => 
          item.name.toLowerCase() === selectedStatus.toLowerCase()
        );
  }, [vehicleCounts, selectedStatus]);

  const totalVehicles = useMemo(() => 
    vehicleCounts?.reduce((sum, item) => sum + item.value, 0) || 0,
    [vehicleCounts]
  );

  if (isLoading) {
    return (
      <Card className={cn(
        "bg-gradient-to-br from-white/50 to-white/30",
        "backdrop-blur-sm border border-gray-200/50",
        "hover:border-gray-300 transition-all duration-300"
      )}>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full max-w-md">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
              <div className="h-64 bg-gray-200 rounded-full w-64 mx-auto" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(
        "bg-gradient-to-br from-rose-50 to-rose-100/30",
        "backdrop-blur-sm border border-rose-200/50"
      )}>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-rose-500 flex flex-col items-center gap-4">
            <AlertOctagon className="w-12 h-12" />
            <div>Failed to load vehicle status data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-gradient-to-br from-white/50 to-white/30",
      "backdrop-blur-sm border border-gray-200/50",
      "hover:border-gray-300 transition-all duration-300",
      "hover:shadow-lg"
    )}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Vehicle Status</h3>
          </div>
          <ChartStatusSelect
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            statusData={vehicleCounts || []}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-2/3 flex justify-center">
            <DonutChart
              data={filteredData}
              config={config}
              primaryValue={selectedStatus === "all" ? totalVehicles : filteredData[0]?.value || 0}
              primaryLabel={selectedStatus === "all" ? "Total Vehicles" : selectedStatus}
            />
          </div>
          <div className="w-full md:w-1/3">
            <ChartLegend
              data={vehicleCounts || []}
              onStatusSelect={setSelectedStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
