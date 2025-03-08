
import { Card, CardContent } from "@/components/ui/card";
import { StatusConfigMap, StatusGroupListProps, StatusItem, VehicleStatus } from "@/types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const StatusGroupList = ({
  statuses,
  statusConfigs,
  onStatusClick,
  isLoading = false
}: StatusGroupListProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center p-2">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {statuses.map((statusItem: StatusItem) => {
            const status = statusItem.status as VehicleStatus;
            const config = statusConfigs[status];
            
            if (!config) {
              console.warn(`No configuration found for status: ${status}`);
              return null;
            }
            
            return (
              <div 
                key={status}
                className="flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onStatusClick(status)}
                role="button"
                aria-label={`View ${config.label} vehicles`}
              >
                <div 
                  className="p-2 rounded-full mb-2"
                  style={{ backgroundColor: config.bgColor || `${config.color}20` }}
                >
                  {config.icon}
                </div>
                <span className="text-sm font-medium">{config.label}</span>
                <Badge 
                  variant="outline" 
                  className="mt-1"
                  style={{ 
                    color: config.color,
                    borderColor: config.color
                  }}
                >
                  {statusItem.count}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
