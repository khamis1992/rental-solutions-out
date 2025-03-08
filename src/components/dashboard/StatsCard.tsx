
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardData } from "@/types/dashboard.types";

// Extend the StatCardData interface, making description accept ReactNode
export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: ReactNode;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  className,
}: StatsCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium leading-none tracking-tight">
            {title}
          </h3>
          {Icon && (
            <div className="h-4 w-4 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === "up" ? "text-green-500" : 
              trend === "down" ? "text-red-500" : "text-gray-500"
            }`}>
              {trend === "up" && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
              {trend === "down" && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
