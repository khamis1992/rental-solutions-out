
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Calendar } from "lucide-react";
import { MaintenanceStatus } from "@/types/maintenance";

interface UpcomingMaintenanceProps {
  vehicleId: string;
}

export const UpcomingMaintenance = ({ vehicleId }: UpcomingMaintenanceProps) => {
  const { data: upcomingMaintenance, isLoading } = useQuery({
    queryKey: ["upcoming-maintenance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .in("status", ["scheduled", "urgent" as MaintenanceStatus])
        .gte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!upcomingMaintenance?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Calendar className="h-10 w-10 mb-3 text-muted-foreground/60" />
        <p>No upcoming maintenance scheduled</p>
        <p className="text-sm mt-1">All maintenance is either completed or in progress</p>
      </div>
    );
  }

  // Calculate days from now
  const calculateDaysFromNow = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-5 bg-amber-500 rounded-sm mr-1"></span>
        Upcoming Maintenance
      </h3>
      {upcomingMaintenance.map((item) => {
        const daysFromNow = calculateDaysFromNow(item.scheduled_date);
        const isUrgent = item.status === "urgent" || daysFromNow <= 3;
        
        return (
          <div 
            key={item.id} 
            className={`
              relative p-4 rounded-lg border border-border/40 
              ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-muted/20'}
              hover:shadow-md transition-shadow duration-200
            `}
          >
            {isUrgent && (
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-medium">{item.service_type}</h4>
              <Badge 
                variant={isUrgent ? "destructive" : "outline"}
                className={isUrgent ? "" : "bg-blue-100 text-blue-800 border-blue-300"}
              >
                {isUrgent ? "Urgent" : "Scheduled"}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>
                {formatDateToDisplay(new Date(item.scheduled_date))}
                {daysFromNow > 0 ? 
                  ` (in ${daysFromNow} day${daysFromNow === 1 ? '' : 's'})` : 
                  daysFromNow === 0 ? ' (today)' : ' (overdue)'}
              </span>
            </div>
            {item.description && (
              <p className="text-sm mt-2 text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
