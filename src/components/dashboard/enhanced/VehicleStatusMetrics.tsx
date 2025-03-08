
import { Car, AlertTriangle, RefreshCw } from "lucide-react";

interface VehicleStatusMetricsProps {
  totalVehicles: number;
  criticalCount: number;
  isLoading: boolean;
}

export const VehicleStatusMetrics = ({ 
  totalVehicles, 
  criticalCount, 
  isLoading 
}: VehicleStatusMetricsProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-sm text-muted-foreground">Total Vehicles</span>
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{totalVehicles}</span>
        </div>
      </div>
      
      {criticalCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{criticalCount} critical</span>
        </div>
      )}
      
      {isLoading && (
        <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
      )}
    </div>
  );
};
