
import { Card, CardContent } from "@/components/ui/card";
import { Car, Wrench, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  status: string;
}

interface VehicleStatsProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleStats = ({ vehicles, isLoading }: VehicleStatsProps) => {
  const { data: vehicleCounts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["vehicle-counts"],
    queryFn: async () => {
      console.log("Fetching vehicle counts...");
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      console.log("Retrieved vehicles:", vehicles);

      const counts = {
        available: vehicles.filter(v => v.status === 'available').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        needsAttention: vehicles.filter(v => ['accident', 'police_station'].includes(v.status)).length,
      };

      console.log("Calculated counts:", counts);
      return counts;
    },
  });

  const mainStats = [
    {
      title: "Available Vehicles",
      value: vehicleCounts?.available || 0,
      icon: Car,
      color: "text-[#9b87f5]",
      bgColor: "bg-[#9b87f5]/10",
      ringColor: "ring-[#9b87f5]/20",
    },
    {
      title: "In Maintenance",
      value: vehicleCounts?.maintenance || 0,
      icon: Wrench,
      color: "text-[#F97316]",
      bgColor: "bg-[#F97316]/10",
      ringColor: "ring-[#F97316]/20",
    },
    {
      title: "Needs Attention",
      value: vehicleCounts?.needsAttention || 0,
      icon: AlertTriangle,
      color: "text-[#ea384c]",
      bgColor: "bg-[#ea384c]/10",
      ringColor: "ring-[#ea384c]/20",
    },
  ];

  if (isLoadingCounts) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2 mx-auto" />
              <Skeleton className="h-8 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {mainStats.map((stat) => (
        <Card 
          key={stat.title}
          className={cn(
            "group hover:shadow-lg transition-all duration-300",
            "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30",
            "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
            "hover:border-gray-300 dark:hover:border-gray-600",
            "hover:translate-y-[-2px]"
          )}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-between animate-fade-in">
              <p className="text-sm font-medium text-muted-foreground mb-4 text-center group-hover:text-foreground transition-colors">
                {stat.title}
              </p>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <div className={cn(
                  "p-3 rounded-full transition-all duration-300 group-hover:scale-110",
                  stat.bgColor,
                  stat.ringColor,
                  "ring-1 shadow-sm group-hover:shadow-md"
                )}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
