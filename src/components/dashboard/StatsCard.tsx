
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

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
        blue: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        purple: "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        green: "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        orange: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        red: "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        indigo: "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        teal: "bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        amber: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        cyan: "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
        pink: "bg-pink-100/80 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
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
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const trendClasses = {
      up: "text-green-600",
      down: "text-red-600",
      neutral: "text-gray-600"
    };
    
    const trendIcons = {
      up: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      down: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 7L7 17M7 17H16M7 17V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      neutral: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    };
    
    return <span className={cn("flex items-center", trendClasses[trend])}>{trendIcons[trend]}</span>;
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer p-3",
      "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30",
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
          <div className="text-xl font-bold tracking-tight break-words animate-fade-in">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 animate-fade-in group-hover:text-foreground/80 transition-colors">
              {getTrendIcon()}
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
