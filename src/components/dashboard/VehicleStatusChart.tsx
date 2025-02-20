
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
import { 
  Loader2, 
  CarFront, 
  AlertTriangle, 
  Tools, 
  Archive, 
  Building2, 
  Siren, 
  BookMarked,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface VehicleStatusChartProps {
  className?: string;
}

type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

interface VehicleStatusData {
  name: string;
  value: number;
  color: string;
  status: VehicleStatus;
  icon: React.ComponentType<{ className?: string }>;
  group: 'operational' | 'attention' | 'critical';
}

const STATUS_CONFIG: Record<VehicleStatus, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'operational' | 'attention' | 'critical';
}> = {
  available: {
    label: "Available",
    color: "#10b981",
    icon: CarFront,
    group: 'operational'
  },
  rented: {
    label: "Rented Out",
    color: "#3b82f6",
    icon: BookMarked,
    group: 'operational'
  },
  maintenance: {
    label: "In Maintenance",
    color: "#f59e0b",
    icon: Tools,
    group: 'attention'
  },
  retired: {
    label: "Retired",
    color: "#ef4444",
    icon: Archive,
    group: 'attention'
  },
  police_station: {
    label: "At Police Station",
    color: "#6366f1",
    icon: Building2,
    group: 'attention'
  },
  accident: {
    label: "In Accident",
    color: "#dc2626",
    icon: AlertTriangle,
    group: 'critical'
  },
  reserve: {
    label: "In Reserve",
    color: "#8b5cf6",
    icon: CarFront,
    group: 'operational'
  },
  stolen: {
    label: "Reported Stolen",
    color: "#1e293b",
    icon: ShieldAlert,
    group: 'critical'
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as VehicleStatusData;
    const Icon = data.icon;
    
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 p-4 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5" style={{ color: data.color }} />
          <p className="font-medium text-sm">{data.name}</p>
        </div>
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

const StatusGroup = ({ 
  title, 
  items, 
  className 
}: { 
  title: string; 
  items: VehicleStatusData[]; 
  className?: string; 
}) => {
  const totalInGroup = items.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{totalInGroup} vehicles</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div 
            key={item.status}
            className="flex items-center justify-between group cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full transition-transform duration-200 group-hover:scale-110" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.name}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  if (!payload?.length) return null;

  const data = payload.map((entry: any) => entry.payload) as VehicleStatusData[];
  
  const groupedData = {
    operational: data.filter(item => item.group === 'operational'),
    attention: data.filter(item => item.group === 'attention'),
    critical: data.filter(item => item.group === 'critical')
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <StatusGroup 
        title="Operational" 
        items={groupedData.operational}
        className="border-r border-gray-200 dark:border-gray-700 pr-4"
      />
      <StatusGroup 
        title="Needs Attention" 
        items={groupedData.attention}
        className="border-r border-gray-200 dark:border-gray-700 pr-4"
      />
      <StatusGroup 
        title="Critical" 
        items={groupedData.critical}
      />
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
        name: STATUS_CONFIG[status as VehicleStatus].label,
        value,
        color: STATUS_CONFIG[status as VehicleStatus].color,
        status: status as VehicleStatus,
        icon: STATUS_CONFIG[status as VehicleStatus].icon,
        group: STATUS_CONFIG[status as VehicleStatus].group,
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
        <CardContent className="h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!vehicles?.length) {
    return null;
  }

  const totalVehicles = vehicles.reduce((sum, item) => sum + item.value, 0);
  const criticalStatuses = vehicles.filter(v => v.group === 'critical');
  const hasCriticalStatus = criticalStatuses.length > 0;

  return (
    <Card className={cn(
      "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Vehicle Status Distribution</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Vehicles</p>
              <p className="text-2xl font-bold">{totalVehicles}</p>
            </div>
            {hasCriticalStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {criticalStatuses.reduce((sum, item) => sum + item.value, 0)} critical
                </span>
              </div>
            )}
          </div>
        </div>
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
                    className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                    style={{
                      filter: entry.group === 'critical' ? 'url(#shadow)' : undefined
                    }}
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
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.3"/>
                </filter>
              </defs>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
