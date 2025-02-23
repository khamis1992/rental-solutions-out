
import { Card } from "@/components/ui/card";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { Car, Wrench, Archive, AlertTriangle, Key, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { VehicleListDialog } from "./VehicleListDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatusGroup {
  name: string;
  items: StatusItem[];
}

interface StatusItem {
  label: string;
  value: number;
  percentage: number;
  status: VehicleStatus;
  icon: typeof Car;
  colorClass: string;
}

export const VehicleStatusChartV3 = () => {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data;
    }
  });

  const total = stats?.total_vehicles || 0;

  const statusGroups: StatusGroup[] = [
    {
      name: "Operational",
      items: [
        {
          label: "Available",
          value: stats?.available_vehicles || 0,
          percentage: total ? ((stats?.available_vehicles || 0) / total) * 100 : 0,
          status: "available",
          icon: CheckCircle2,
          colorClass: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
        },
        {
          label: "Rented",
          value: stats?.rented_vehicles || 0,
          percentage: total ? ((stats?.rented_vehicles || 0) / total) * 100 : 0,
          status: "rented",
          icon: Key,
          colorClass: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25"
        }
      ]
    },
    {
      name: "Needs Attention",
      items: [
        {
          label: "Maintenance",
          value: stats?.maintenance_vehicles || 0,
          percentage: total ? ((stats?.maintenance_vehicles || 0) / total) * 100 : 0,
          status: "maintenance",
          icon: Wrench,
          colorClass: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
        }
      ]
    }
  ];

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Vehicle Status Distribution</h3>
          </div>
          <div className="space-y-8">
            {statusGroups.map((group) => (
              <div key={group.name} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {group.name}
                </div>
                <div className="grid gap-4">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setSelectedStatus(item.status)}
                      className="w-full"
                    >
                      <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${item.colorClass}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-70">
                              {item.percentage.toFixed(1)}% of fleet
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-semibold">{item.value}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <VehicleListDialog 
        isOpen={!!selectedStatus}
        onClose={() => setSelectedStatus(null)}
        status={selectedStatus}
      />
    </>
  );
};
