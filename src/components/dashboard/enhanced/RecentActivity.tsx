
import { ActivityItem } from "@/types/dashboard.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, CheckCircle, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  activities: any[];
  isLoading?: boolean;
  limit?: number;
}

export const RecentActivity = ({ activities = [], isLoading = false, limit = 5 }: RecentActivityProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
        <p>No recent activity to display</p>
        <p className="text-sm">Activity will appear here as it happens</p>
      </div>
    );
  }
  
  const displayActivities = activities.slice(0, limit);
  
  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => {
        let statusIcon;
        let statusColor;
        
        switch(activity.newStatus) {
          case 'available':
            statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
            statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            break;
          case 'rented':
            statusIcon = <Car className="h-4 w-4 text-blue-500" />;
            statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            break;
          case 'maintenance':
            statusIcon = <Wrench className="h-4 w-4 text-amber-500" />;
            statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            break;
          default:
            statusIcon = <Clock className="h-4 w-4 text-gray-500" />;
            statusColor = 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
        }
        
        return (
          <div key={index} className="flex items-start p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
            <div className="mr-3 mt-1">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-card shadow-sm ${
                activity.newStatus === 'available' ? 'text-green-500' :
                activity.newStatus === 'rented' ? 'text-blue-500' :
                activity.newStatus === 'maintenance' ? 'text-amber-500' : 'text-gray-500'
              }`}>
                {statusIcon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{activity.vehicle.make} {activity.vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">
                    Status changed from <span className="font-medium">{activity.oldStatus}</span> to{" "}
                    <span className={`font-medium px-1.5 py-0.5 rounded-full text-xs ${statusColor}`}>
                      {activity.newStatus}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeof activity.timestamp === 'object' && activity.timestamp.toLocaleTimeString 
                    ? activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      
      {activities.length > limit && (
        <Button variant="outline" size="sm" className="w-full">
          View All Activity
        </Button>
      )}
    </div>
  );
};
