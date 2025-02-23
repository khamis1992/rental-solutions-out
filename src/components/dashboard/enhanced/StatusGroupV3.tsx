
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG_V3 } from "./VehicleStatusChartV3";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatusGroupV3Props {
  title: string;
  total: number;
  items: Array<{
    status: VehicleStatus;
    count: number;
  }>;
  onStatusClick: (status: VehicleStatus) => void;
  icon?: ReactNode;
}

export const StatusGroupV3 = ({ title, total, items, onStatusClick, icon }: StatusGroupV3Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="text-sm font-semibold">
          {total} vehicles
        </div>
      </div>
      <div className="space-y-2.5">
        {items.map(({ status, count }) => {
          const config = STATUS_CONFIG_V3[status];
          return (
            <button
              key={status}
              onClick={() => onStatusClick(status)}
              className={cn(
                "w-full flex items-center justify-between",
                "p-2.5 rounded-lg",
                "transition-all duration-200",
                "hover:bg-background/80 active:bg-background",
                "hover:scale-[1.02]",
                "border border-transparent hover:border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {config?.icon}
                </div>
                <span className="text-sm font-medium">
                  {config?.label || status}
                </span>
              </div>
              <div className="text-sm font-bold">{count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
