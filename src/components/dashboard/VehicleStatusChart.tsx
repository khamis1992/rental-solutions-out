
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

interface VehicleStatusCount {
  status: VehicleStatus;
  count: number;
}

const COLORS: Record<VehicleStatus, string> = {
  available: "#22c55e", // green-500
  rented: "#3b82f6",   // blue-500
  maintenance: "#f59e0b", // amber-500
  retired: "#ef4444",  // red-500
  police_station: "#6366f1", // indigo-500
  accident: "#dc2626", // red-600
  reserve: "#8b5cf6", // violet-500
  stolen: "#1e293b",  // slate-800
};

export const VehicleStatusChart = () => {
  const { data: statusCounts } = useQuery<VehicleStatusCount[]>({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status")
        .not("status", "is", null);

      if (error) throw error;

      const counts = data.reduce((acc, { status }) => {
        if (status) {
          acc[status as VehicleStatus] = (acc[status as VehicleStatus] || 0) + 1;
        }
        return acc;
      }, {} as Record<VehicleStatus, number>);

      return Object.entries(counts).map(([status, count]) => ({
        status: status as VehicleStatus,
        count
      }));
    },
    meta: {
      onError: (err: Error) => {
        toast.error("Failed to load vehicle status data: " + err.message);
      }
    }
  });

  if (!statusCounts?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status Distribution</CardTitle>
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
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {statusCounts.map((entry) => (
                  <Cell 
                    key={entry.status} 
                    fill={COLORS[entry.status] || "#cbd5e1"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {statusCounts.map((entry) => (
            <div key={entry.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[entry.status] }}
              />
              <span className="text-sm capitalize">
                {entry.status.replace('_', ' ')}: {entry.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
