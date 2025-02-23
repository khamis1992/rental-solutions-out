
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG_V3 } from "./VehicleStatusChartV3";
import { cn } from "@/lib/utils";

interface StatusGroupV3Props {
  title: string;
  subtitle?: string;
  items: Array<{
    status: VehicleStatus;
    count: number;
  }>;
  onStatusClick: (status: VehicleStatus) => void;
}

export const StatusGroupV3 = ({ title, subtitle, items, onStatusClick }: StatusGroupV3Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="space-y-2">
        {items.map(({ status, count }) => {
          const config = STATUS_CONFIG_V3[status];
          const isCritical = config?.group === "critical";
          
          return (
            <button
              key={status}
              onClick={() => onStatusClick(status)}
              className={cn(
                "w-full flex items-center justify-between",
                "p-3 rounded-lg",
                "transition-all duration-200",
                "hover:bg-muted/50 active:bg-muted",
                "hover:scale-[1.02]",
                "border border-transparent hover:border-border",
                isCritical && "hover:bg-red-500/10 dark:hover:bg-red-500/20"
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
