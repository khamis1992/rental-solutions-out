
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface RealTimeIndicatorProps {
  hasChanges: boolean;
  lastUpdate: Date | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const RealTimeIndicator = ({ 
  hasChanges, 
  lastUpdate, 
  status = 'disconnected' 
}: RealTimeIndicatorProps) => {
  const [blink, setBlink] = useState(false);
  
  // Create a blinking effect when changes are detected
  useEffect(() => {
    if (hasChanges) {
      setBlink(true);
      const timer = setTimeout(() => setBlink(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, lastUpdate]);
  
  let statusIcon;
  let statusColor;
  let statusText;
  
  switch (status) {
    case 'connected':
      statusIcon = <Wifi className="h-3 w-3" />;
      statusColor = hasChanges 
        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border-green-500/50" 
        : "bg-green-100/50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-500/30";
      statusText = "Connected";
      break;
    case 'connecting':
      statusIcon = <Wifi className="h-3 w-3 animate-pulse" />;
      statusColor = "bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/30";
      statusText = "Connecting";
      break;
    case 'error':
      statusIcon = <AlertCircle className="h-3 w-3" />;
      statusColor = "bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-500/30";
      statusText = "Error";
      break;
    default:
      statusIcon = <WifiOff className="h-3 w-3" />;
      statusColor = "bg-gray-100/50 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-500/30";
      statusText = "Disconnected";
  }
  
  const formattedTime = lastUpdate 
    ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'Never';
    
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${statusColor} ${blink ? 'animate-pulse' : ''} py-0 px-2 h-5 transition-colors duration-200 cursor-help`}
          >
            <span className="flex items-center gap-1 text-xs">
              {statusIcon}
              <span className="hidden sm:inline">{statusText}</span>
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <p className="font-medium">Real-time Updates: {statusText}</p>
            <p>Last update: {formattedTime}</p>
            {status === 'error' && (
              <p className="text-red-500 mt-1">Connection failed. Please refresh.</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
