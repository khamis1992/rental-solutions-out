
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Clock,
  BellRing,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  AlertCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface CashFlowAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: string;
  threshold_amount: number;
  current_amount: number;
  payment_id: string | null;
  expected_amount: number;
  status: string;
  created_at: string;
}

export const CashFlowMonitoring = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useTouchGestures(scrollRef, {
    onSwipeDown: () => {
      refetch();
    }
  });

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ["cash-flow-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_flow_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashFlowAlert[];
    },
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          containerClass: "bg-gradient-to-r from-red-50/90 to-red-100/90 dark:from-red-900/20 dark:to-red-800/20 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
          iconClass: "text-red-600 dark:text-red-400",
          badge: "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300 backdrop-blur-sm",
          progressClass: "bg-red-200/80 backdrop-blur-sm"
        };
      case "medium":
        return {
          containerClass: "bg-gradient-to-r from-yellow-50/90 to-yellow-100/90 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
          iconClass: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 backdrop-blur-sm",
          progressClass: "bg-yellow-200/80 backdrop-blur-sm"
        };
      default:
        return {
          containerClass: "bg-gradient-to-r from-blue-50/90 to-blue-100/90 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
          iconClass: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 backdrop-blur-sm",
          progressClass: "bg-blue-200/80 backdrop-blur-sm"
        };
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case "upcoming_payment":
        return severity === "high" ? Timer : CalendarClock;
      case "threshold_breach":
        return severity === "high" ? AlertCircle : AlertTriangle;
      case "notification":
        return BellRing;
      default:
        return DollarSign;
    }
  };

  const renderProgressBar = (current: number, expected: number, className: string) => {
    const percentage = Math.min((current / expected) * 100, 100);
    return (
      <div className="relative w-full">
        <div className="flex items-center justify-between mb-1 text-xs font-medium">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className={`h-full ${className} transition-all duration-500 ease-in-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cash Flow Alerts</span>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-card/80 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <CardTitle>Cash Flow Alerts</CardTitle>
          <Badge 
            variant="outline" 
            className="ml-2 bg-primary/10 border-primary/20"
          >
            {alerts?.length || 0} Active
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollRef}
          className="h-[calc(100vh-12rem)] md:h-[500px]"
        >
          <div className="space-y-2 p-6">
            {alerts?.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const AlertIcon = getAlertIcon(alert.alert_type, alert.severity);
              const hasPaid = alert.current_amount > 0;
              const isOverdue = new Date(alert.created_at) < new Date();

              return (
                <Alert
                  key={alert.id}
                  className={cn(
                    "group relative overflow-hidden hover:scale-[1.02]",
                    styles.containerClass,
                    "transition-all duration-300 ease-in-out"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "rounded-full p-2",
                      "bg-background/50 backdrop-blur-sm",
                      styles.iconClass
                    )}>
                      <AlertIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <AlertTitle className="flex flex-wrap items-center gap-2 pr-6">
                        <span className="font-semibold">
                          {alert.alert_type === "upcoming_payment" ? "Upcoming Payment Due" : "Cash Flow Alert"}
                        </span>
                        <Badge variant="outline" className={cn(
                          styles.badge,
                          "animate-fade-in"
                        )}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            OVERDUE
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="grid gap-3">
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          {alert.expected_amount > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Expected: {formatCurrency(alert.expected_amount)}
                                </span>
                                {hasPaid && (
                                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    Paid: {formatCurrency(alert.current_amount)}
                                  </span>
                                )}
                              </div>
                              {renderProgressBar(
                                alert.current_amount,
                                alert.expected_amount,
                                styles.progressClass
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(alert.created_at)}
                            </span>
                            {alert.threshold_amount > 0 && (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Threshold: {formatCurrency(alert.threshold_amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </div>
                </Alert>
              );
            })}
            {!alerts?.length && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                <p className="text-lg font-medium">No Active Alerts</p>
                <p className="text-sm">Your cash flow is looking healthy!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
