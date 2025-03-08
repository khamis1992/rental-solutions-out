
import { Card, CardContent } from "@/components/ui/card";
import { StatusGroupListProps, VehicleStatus } from "@/types/dashboard.types";
import { Badge } from "@/components/ui/badge";

export const StatusGroupList = ({
  statuses,
  statusConfigs,
  onStatusClick
}: StatusGroupListProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {statuses.map((statusItem) => {
            const status = statusItem.status;
            const config = statusConfigs[status];
            
            if (!config) {
              console.warn(`No configuration found for status: ${status}`);
              return null;
            }
            
            return (
              <div 
                key={status}
                className="flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
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
