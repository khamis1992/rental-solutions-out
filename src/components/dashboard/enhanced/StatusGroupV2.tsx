
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { cn } from "@/lib/utils";

interface StatusGroupV2Props {
  title: string;
  items: Array<{
    status: VehicleStatus;
    count: number;
  }>;
  onStatusClick: (status: VehicleStatus) => void;
}

export const StatusGroupV2 = ({ title, items, onStatusClick }: StatusGroupV2Props) => {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
      <div className="space-y-2">
        {items.map(({ status, count }) => {
          const config = STATUS_CONFIG[status];
          const percentage = ((count / total) * 100).toFixed(1);
          
          return (
            <button
              key={status}
              onClick={() => onStatusClick(status)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg",
                "transition-all duration-200",
                "hover:bg-muted/50 active:bg-muted",
                "hover:scale-[1.02]",
                "border border-transparent hover:border-border"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config?.color }}
                />
                <span className="text-sm font-medium">{config?.label || status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{count}</span>
                <span className="text-xs text-muted-foreground">({percentage}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
