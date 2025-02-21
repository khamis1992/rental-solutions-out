import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  BellRing, Clock, AlertCircle, CheckCircle2, 
  Timer, ArrowRight, MoreHorizontal, X, 
  Filter, Settings2, Banknote, Shield, Car,
  Bell, type LucideIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Notification {
  id: number;
  type: "maintenance" | "payment" | "insurance" | "system";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: LucideIcon;
  timestamp: string;
  read: boolean;
}

export const SmartNotifications = () => {
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["smart-notifications"],
    queryFn: async () => {
      return [
        {
          id: 1,
          type: "maintenance",
          title: "Maintenance Due",
          description: "3 vehicles require maintenance this week",
          priority: "high",
          icon: Car,
          timestamp: "2h ago",
          read: false
        },
        {
          id: 2,
          type: "payment",
          title: "Pending Payments",
          description: "5 payments are due in the next 48 hours",
          priority: "medium",
          icon: Banknote,
          timestamp: "4h ago",
          read: false
        },
        {
          id: 3,
          type: "insurance",
          title: "Insurance Renewal",
          description: "Insurance expires for 2 vehicles next month",
          priority: "low",
          icon: Shield,
          timestamp: "1d ago",
          read: true
        }
      ] as Notification[];
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityStyles = (priority: string) => {
    const baseStyles = "relative rounded-lg transition-all duration-300";
    const glowStyles = "before:absolute before:inset-0 before:rounded-lg before:opacity-50";
    
    switch (priority) {
      case "high":
        return `${baseStyles} ${glowStyles} before:bg-red-500/10 bg-gradient-to-r from-red-50/80 to-red-50/40 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50 hover:border-red-300/50`;
      case "medium":
        return `${baseStyles} ${glowStyles} before:bg-amber-500/10 bg-gradient-to-r from-amber-50/80 to-amber-50/40 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50 hover:border-amber-300/50`;
      case "low":
        return `${baseStyles} ${glowStyles} before:bg-blue-500/10 bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 hover:border-blue-300/50`;
      default:
        return baseStyles;
    }
  };

  const getIconStyles = (priority: string) => {
    const baseStyles = "relative h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300";
    const pulseStyles = "before:absolute before:inset-0 before:rounded-full before:animate-pulse before:opacity-50";
    
    switch (priority) {
      case "high":
        return `${baseStyles} ${pulseStyles} before:bg-red-500/20 bg-red-100 text-red-600 dark:bg-red-900/20`;
      case "medium":
        return `${baseStyles} ${pulseStyles} before:bg-amber-500/20 bg-amber-100 text-amber-600 dark:bg-amber-900/20`;
      case "low":
        return `${baseStyles} ${pulseStyles} before:bg-blue-500/20 bg-blue-100 text-blue-600 dark:bg-blue-900/20`;
      default:
        return baseStyles;
    }
  };

  const filteredNotifications = notifications
    .filter(n => filter === "all" || n.type === filter)
    .slice(0, showAll ? undefined : 3);

  return (
    <TooltipProvider>
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors border-gray-200/50 hover:border-gray-300/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setFilter(filter === "all" ? "maintenance" : "all")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Filter notifications
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toast.info("Notification settings coming soon")}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Notification settings
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Alert 
                key={notification.id}
                className={cn(
                  "border group hover:shadow-sm cursor-pointer transition-all duration-300",
                  getPriorityStyles(notification.priority),
                  !notification.read && "before:animate-pulse"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={getIconStyles(notification.priority)}>
                    <notification.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AlertTitle className="flex items-center gap-2 mb-1">
                      {notification.title}
                      {!notification.read && (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {notification.description}
                    </AlertDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}

            {notifications.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show ${notifications.length - 3} more`}
              </Button>
            )}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
