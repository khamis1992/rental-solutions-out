
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleStatus } from "@/types/vehicle";

export interface StatusGroupV2Props {
  items: { status: VehicleStatus; count: number }[];
  title?: string;
  icon?: React.ReactNode;
}

export const StatusGroupV2 = ({ 
  items, 
  title, 
  icon 
}: StatusGroupV2Props) => {
  // Calculate total count for percentage calculations
  const totalCount = items.reduce((acc, item) => acc + item.count, 0);

  // Status color mapping for the progress bars
  const getStatusColor = (status: VehicleStatus): string => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "rented":
        return "bg-blue-500";
      case "maintenance":
        return "bg-orange-500";
      case "accident":
        return "bg-red-500";
      case "stolen":
        return "bg-purple-500";
      case "retired":
        return "bg-gray-500";
      case "reserve":
        return "bg-indigo-500";
      case "police_station":
        return "bg-yellow-500";
      case "pending_repair":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            {title && <h3 className="font-medium text-lg">{title}</h3>}
          </div>
        )}

        {/* Status Bars */}
        <div className="space-y-4">
          {items.map((item) => {
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
            
            return (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{item.status.replace('_', ' ')}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(item.status)} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
