
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { MaintenanceTimeline } from "./MaintenanceTimeline";
import { MaintenanceStats } from "./MaintenanceStats";
import { UpcomingMaintenance } from "./UpcomingMaintenance";

interface MaintenanceTrackerProps {
  vehicleId: string;
}

export const MaintenanceTracker = ({ vehicleId }: MaintenanceTrackerProps) => {
  const { data: maintenanceHistory, isLoading } = useQuery({
    queryKey: ["maintenance-history", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          maintenance_categories (name),
          vehicle_parts (
            part_name,
            part_number,
            quantity,
            unit_cost
          )
        `)
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <MaintenanceStats maintenanceData={maintenanceHistory || []} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <MaintenanceTimeline 
              maintenanceHistory={maintenanceHistory || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <UpcomingMaintenance vehicleId={vehicleId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
