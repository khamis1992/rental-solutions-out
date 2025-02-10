
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, AlertOctagon, CheckCircle2, Wrench, Shield, Key, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleStatus } from "@/types/vehicle";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleStatusListProps {
  selectedStatus: string;
}

const STATUS_ICONS = {
  accident: AlertOctagon,
  available: CheckCircle2,
  maintenance: Wrench,
  police_station: Shield,
  rented: Key,
  stolen: AlertTriangle,
  reserve: Clock,
} as const;

const STATUS_COLORS = {
  accident: "text-rose-500 bg-rose-500/10",
  available: "text-blue-500 bg-blue-500/10",
  maintenance: "text-orange-500 bg-orange-500/10",
  police_station: "text-slate-700 bg-slate-500/10",
  rented: "text-purple-500 bg-purple-500/10",
  stolen: "text-pink-500 bg-pink-500/10",
  reserve: "text-gray-500 bg-gray-500/10",
} as const;

export const VehicleStatusList = ({ selectedStatus }: VehicleStatusListProps) => {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", selectedStatus],
    queryFn: async () => {
      const query = supabase
        .from("vehicles")
        .select("*");

      if (selectedStatus !== "all") {
        query.eq("status", selectedStatus.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 30000,
  });

  const Icon = STATUS_ICONS[selectedStatus as keyof typeof STATUS_ICONS] || Car;
  const statusColor = STATUS_COLORS[selectedStatus as keyof typeof STATUS_COLORS] || "text-gray-500 bg-gray-500/10";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            Loading Vehicles...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
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
      "hover:shadow-lg group"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300",
            "group-hover:scale-110",
            statusColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
          {selectedStatus === "all" ? "All Vehicles" : (
            `${selectedStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Vehicles`
          )}
          <Badge variant="secondary" className="ml-auto">
            {vehicles.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Car className="h-12 w-12 mb-4" />
            <p>No vehicles found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg",
                  "border border-transparent transition-all duration-300",
                  "hover:border-gray-200 hover:bg-gray-50/50",
                  "animate-fade-in"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center",
                  statusColor
                )}>
                  <Car className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.license_plate}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "whitespace-nowrap",
                    statusColor
                  )}
                >
                  {vehicle.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
