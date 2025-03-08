
import { StatsCardProps } from "@/types/dashboard.types";
import { Card, CardContent } from "@/components/ui/card";
import { Battery, Car, DollarSign, Gauge, Percent, TrendingUp, User, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface KeyMetricsCardsProps {
  metrics?: any;
  isLoading?: boolean;
}

export const KeyMetricsCards = ({ metrics, isLoading = false }: KeyMetricsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  const cards: StatsCardProps[] = [
    {
      title: "Fleet Utilization",
      value: formatPercentage((metrics?.rentedCount || 0) / (metrics?.totalVehicles || 1) * 100),
      icon: Gauge,
      description: "Vehicles currently in use",
      trend: "up",
      trendLabel: "5.2% higher"
    },
    {
      title: "Available Vehicles",
      value: metrics?.availableCount || 0,
      icon: Car,
      description: "Ready for rental",
      trend: "neutral"
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(metrics?.maintenanceCosts?.total || 0),
      icon: DollarSign,
      description: "This month",
      trend: "up",
      trendLabel: "8.1% increase"
    },
    {
      title: "Fleet Efficiency",
      value: formatPercentage((metrics?.utilization || 0) * 100),
      icon: Percent,
      description: "Current rental ratio",
      trend: "up",
      trendLabel: "3.5% improved"
    }
  ];
  
  const gradients = [
    "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
    "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
  ];
  
  const iconColors = [
    "text-blue-500 dark:text-blue-400", 
    "text-green-500 dark:text-green-400",
    "text-violet-500 dark:text-violet-400",
    "text-amber-500 dark:text-amber-400"
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon || TrendingUp;
        
        return (
          <Card key={index} className="border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-50`} />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium leading-none tracking-tight">
                  {card.title}
                </h3>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 ${iconColors[index % iconColors.length]} transition-transform group-hover:scale-110 shadow-sm`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">{card.description}</p>
                {card.trend && (
                  <div className={`flex items-center gap-1 text-xs ${
                    card.trend === "up" ? "text-green-500" : 
                    card.trend === "down" ? "text-red-500" : "text-gray-500"
                  }`}>
                    {card.trend === "up" && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                    {card.trend === "down" && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    <span>{card.trendLabel}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
