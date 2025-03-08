
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface RealTimeIndicatorProps {
  hasChanges: boolean;
  lastUpdate: Date | null;
  status?: 'connected' | 'disconnected';
}

export const RealTimeIndicator = ({ 
  hasChanges, 
  lastUpdate, 
  status = 'connected' 
}: RealTimeIndicatorProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-all duration-300 ${
              hasChanges ? "bg-green-500/10 border-green-500/30 text-green-500" : 
              status === 'connected' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : 
              "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
          >
            {status === 'connected' ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-medium">
              {hasChanges ? "Updates Available" : "Real-Time"}
            </span>
            {hasChanges && (
              <RefreshCw className="h-3 w-3 animate-spin" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {status === 'connected' 
              ? "Real-time data feed is active" 
              : "Real-time data feed is disconnected"}
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
