
import { ReactNode } from "react";
import { VehicleStatus } from "@/types/vehicle";
import { StatusGroup } from "@/types/dashboard.types";
import { StatusGroupV2 } from "./StatusGroupV2";
import { Card, CardContent } from "@/components/ui/card";

export interface StatusGroupListProps {
  groupedStatuses: StatusGroup[];
  isLoading: boolean;
}

export const StatusGroupList = ({ 
  groupedStatuses, 
  isLoading 
}: StatusGroupListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-48" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {groupedStatuses.map((group) => (
        <StatusGroupV2
          key={group.name}
          name={group.name}
          icon={group.icon as ReactNode}
          items={group.items}
        />
      ))}
    </div>
  );
};
