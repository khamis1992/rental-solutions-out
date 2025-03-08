
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
  "rounded-full p-2.5 transition-all duration-300 group-hover:scale-110",
  {
    variants: {
      variant: {
        blue: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-md shadow-blue-500/10",
        purple: "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-md shadow-purple-500/10",
        green: "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-md shadow-green-500/10",
        orange: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-md shadow-orange-500/10",
        red: "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-md shadow-red-500/10",
        indigo: "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-md shadow-indigo-500/10"
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
      "overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer p-3",
      "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-800/30",
      "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
      "hover:border-gray-300 dark:hover:border-gray-600",
      "hover:translate-y-[-2px]",
      "animate-fade-in",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn(
          iconStyles({ variant: iconClassName as any }),
          "animate-fade-in shadow-sm group-hover:shadow-md",
          "ring-1 ring-gray-200/50 dark:ring-gray-700/50"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight break-words animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 animate-fade-in group-hover:text-foreground/80 transition-colors">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
