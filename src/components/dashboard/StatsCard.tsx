
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  trend?: "up" | "down" | "neutral";
}

const iconStyles = cva(
  "rounded-full p-2 transition-all duration-300 group-hover:scale-110",
  {
    variants: {
      variant: {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
        green: "bg-green-100 text-green-700 dark:bg-green-900/30",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
      }
    },
    defaultVariants: {
      variant: "blue"
    }
  }
);

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
  trend
}: StatsCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg group bg-white dark:bg-gray-800/50 backdrop-blur-sm",
      "border border-gray-200/50 dark:border-gray-700/50",
      "hover:border-gray-300 dark:hover:border-gray-600",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(iconStyles({ variant: iconClassName as any }))}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight break-words">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
