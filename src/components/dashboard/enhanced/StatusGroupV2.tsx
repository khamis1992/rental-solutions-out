
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { cn } from "@/lib/utils";

interface StatusGroupV2Props {
  title: string;
  subtitle?: string;
  items: Array<{
    status: VehicleStatus;
    count: number;
  }>;
  onStatusClick: (status: VehicleStatus) => void;
}

export const StatusGroupV2 = ({ title, subtitle, items, onStatusClick }: StatusGroupV2Props) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map(({ status, count }) => {
          const config = STATUS_CONFIG[status];
          const isCritical = config?.group === "critical";
          
          return (
            <button
              key={status}
              onClick={() => onStatusClick(status)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg",
                "transition-all duration-200",
                "hover:bg-muted/50 active:bg-muted",
                "hover:scale-[1.02]",
                "border border-transparent hover:border-border",
                isCritical && "hover:bg-red-500/10 dark:hover:bg-red-500/20"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{config?.icon}</span>
                <span className="text-sm font-medium text-muted-foreground">
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
