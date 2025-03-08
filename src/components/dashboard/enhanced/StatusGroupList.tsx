
import { StatusGroup, VehicleStatus } from "@/types/dashboard.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatusGroupListProps {
  groups: StatusGroup[];
  onStatusClick: (status: VehicleStatus) => void;
  statusConfigs: Record<string, any>;
}

export const StatusGroupList = ({ groups, onStatusClick, statusConfigs }: StatusGroupListProps) => {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.name} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {group.icon}
              <h3 className="text-sm text-muted-foreground font-medium capitalize">
                {group.name}
              </h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {group.items.reduce((sum, item) => sum + item.count, 0)} vehicles
            </span>
          </div>
          <div className="space-y-1.5">
            {group.items.map(({ status, count }) => {
              const config = statusConfigs[status];
              return (
                <TooltipProvider key={status}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStatusClick(status)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg",
                          "transition-all duration-200",
                          "hover:bg-muted/50 active:bg-muted",
                          "hover:scale-[1.02]",
                          "border border-transparent hover:border-border",
                          group.name === "critical" && "hover:bg-red-500/10 dark:hover:bg-red-500/20"
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{config?.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
