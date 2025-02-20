
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

interface VehicleStatusCount {
  status: VehicleStatus;
  count: number;
}

const COLORS: Record<VehicleStatus, string> = {
  available: "#22c55e",  // Emerald green
  rented: "#3b82f6",     // Blue
  maintenance: "#f59e0b", // Amber
  retired: "#ef4444",    // Red
  police_station: "#6366f1", // Indigo
  accident: "#dc2626",   // Red
  reserve: "#8b5cf6",    // Purple
  stolen: "#1e293b"      // Slate
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
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <p className="font-medium text-sm">{STATUS_LABELS[data.status]}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Count: <span className="font-semibold">{data.count}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Percentage: <span className="font-semibold">{((data.count / data.total) * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {STATUS_LABELS[entry.value]} ({entry.payload.count})
          </span>
        </div>
      ))}
    </div>
  );
};

export const VehicleStatusChart = () => {
  const { data: statusCounts, isLoading } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        toast.error("Failed to load vehicle status data");
        throw error;
      }

      const counts = data.reduce((acc: Record<VehicleStatus, number>, { status }) => {
        if (status) {
          acc[status as VehicleStatus] = (acc[status as VehicleStatus] || 0) + 1;
        }
        return acc;
      }, {} as Record<VehicleStatus, number>);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      return Object.entries(counts).map(([status, count]) => ({
        status: status as VehicleStatus,
        count,
        total
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Vehicle Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!statusCounts?.length) {
    return null;
  }

  return (
    <Card className="col-span-full md:col-span-2 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vehicle Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {statusCounts.map((entry) => (
                  <Cell 
                    key={entry.status} 
                    fill={COLORS[entry.status]} 
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
