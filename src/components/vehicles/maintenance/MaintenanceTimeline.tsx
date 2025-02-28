
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceTimelineProps {
  maintenanceHistory: any[];
  isLoading: boolean;
}

export const MaintenanceTimeline = ({ maintenanceHistory, isLoading }: MaintenanceTimelineProps) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (maintenanceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-center">
        No maintenance history available for this vehicle
      </div>
    );
  }

  return (
    <div className="space-y-4 relative before:absolute before:left-[22px] before:top-0 before:h-full before:w-[2px] before:bg-muted">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-5 bg-primary rounded-sm mr-1"></span>
        Maintenance Timeline
      </h3>
      {maintenanceHistory.map((record, index) => (
        <div key={record.id} className="flex items-start gap-4 ml-2">
          <div className="flex-shrink-0 z-10 p-1 rounded-full bg-background border border-border">
            {getStatusIcon(record.status)}
          </div>
          <div className="flex-1 space-y-1 bg-muted/20 rounded-lg p-4 hover:bg-muted/30 transition-colors border border-border/40 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-medium text-foreground">{record.service_type}</p>
              <Badge 
                variant="outline"
                className={`${
                  record.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : record.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : record.status === 'urgent'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {record.maintenance_categories?.name || record.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateToDisplay(new Date(record.scheduled_date))}
            </p>
            {record.cost && (
              <p className="text-sm font-medium bg-muted/30 px-2 py-1 rounded inline-block">
                Cost: {formatCurrency(record.cost)}
              </p>
            )}
            {record.description && (
              <p className="text-sm text-muted-foreground border-t border-border/30 pt-2 mt-2">
                {record.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
