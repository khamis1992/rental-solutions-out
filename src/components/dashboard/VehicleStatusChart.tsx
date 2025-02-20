
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface VehicleStatusChartProps {
  className?: string;
}

type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

interface VehicleStatusData {
  name: string;
  value: number;
  color: string;
  status: VehicleStatus;
}

const COLORS: Record<VehicleStatus, string> = {
  available: "#10b981", // Emerald
  rented: "#3b82f6",   // Blue
  maintenance: "#f59e0b", // Amber
  retired: "#ef4444",   // Red
  police_station: "#6366f1", // Indigo
  accident: "#dc2626",  // Red
  reserve: "#8b5cf6",  // Purple
  stolen: "#1e293b"    // Slate
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  rented: "Rented Out",
  maintenance: "In Maintenance",
  retired: "Retired",
  police_station: "At Police Station",
  accident: "In Accident",
  reserve: "In Reserve",
  stolen: "Reported Stolen"
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as VehicleStatusData;
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 p-4 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
        <p className="font-medium text-sm mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Percentage: <span className="font-semibold">
              {((data.value / payload[0].payload.total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  
  return (
    <div className="grid grid-cols-2 gap-3 mt-6">
      {payload.map((entry: any) => (
        <div 
          key={entry.value}
          className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:opacity-80"
        >
          <div 
            className="w-3 h-3 rounded-full transition-transform duration-200 group-hover:scale-110" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {entry.value} ({entry.payload.value})
          </span>
        </div>
      ))}
    </div>
  );
};

export const VehicleStatusChart = ({ className }: VehicleStatusChartProps) => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        toast.error("Failed to load vehicle status data");
        throw error;
      }

      const counts: Record<VehicleStatus, number> = {
        available: 0,
        rented: 0,
        maintenance: 0,
        retired: 0,
        police_station: 0,
        accident: 0,
        reserve: 0,
        stolen: 0
      };

      data.forEach(({ status }) => {
        if (status && status in counts) {
          counts[status as VehicleStatus]++;
        }
      });

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      return Object.entries(counts).map(([status, value]) => ({
        name: STATUS_LABELS[status as VehicleStatus],
        value,
        color: COLORS[status as VehicleStatus],
        status: status as VehicleStatus,
        total
      })).filter(item => item.value > 0);
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Vehicle Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!vehicles?.length) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vehicle Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicles}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={85}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {vehicles.map((entry) => (
                  <Cell 
                    key={`cell-${entry.status}`} 
                    fill={entry.color}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                cursor={false}
              />
              <Legend 
                content={<CustomLegend />}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
