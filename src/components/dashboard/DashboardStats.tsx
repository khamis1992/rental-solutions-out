
import { Car, Key, Wrench, Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { formatNumber } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardStatsProps {
  stats?: DashboardStatsType;
  isLoading?: boolean;
  error?: Error | null;
}

export const DashboardStats = ({ stats, isLoading, error }: DashboardStatsProps) => {
  const fleetUtilization = useMemo(() => {
    if (!stats || !stats.total_vehicles) return '0';
    return ((stats.rented_vehicles / stats.total_vehicles) * 100).toFixed(1);
  }, [stats]);

  const isGoodUtilization = useMemo(() => {
    return Number(fleetUtilization) > 70;
  }, [fleetUtilization]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[160px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          <p>Error loading dashboard stats: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg">
          <p>No stats data available</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <StatsCard
                    title="Fleet Utilization"
                    value={`${fleetUtilization}%`}
                    icon={Car}
                    iconClassName="indigo"
                    description={
                      <span className={cn(
                        "text-xs flex items-center gap-1",
                        isGoodUtilization ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      )}>
                        {isGoodUtilization ? 
                          <ArrowUp className="h-3 w-3" /> : 
                          <ArrowDown className="h-3 w-3" />
                        }
                        <span>
                          {isGoodUtilization ? "Good utilization" : "Room for improvement"}
                        </span>
                      </span>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of vehicles currently rented out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <StatsCard
                    title="Active Rentals"
                    value={formatNumber(stats.active_rentals || 0)}
                    icon={Key}
                    iconClassName="purple"
                    description={
                      <span className="text-amber-600 dark:text-amber-400 text-xs flex items-center">
                        <Wrench className="mr-1 h-3.5 w-3.5" />
                        {stats.maintenance_vehicles || 0} in maintenance
                      </span>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of active rental agreements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthly_revenue || 0)}
                    icon={TrendingUp}
                    iconClassName="green"
                    description={
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{formatNumber(stats.total_customers || 0)} total customers</span>
                      </span>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Revenue generated in the current month</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
};
