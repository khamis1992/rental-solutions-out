
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
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useRef } from "react";

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
          containerClass: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 shadow-sm hover:shadow-md transition-all duration-200",
          iconClass: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          progressClass: "bg-red-200"
        };
      case "medium":
        return {
          containerClass: "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200",
          iconClass: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          progressClass: "bg-yellow-200"
        };
      default:
        return {
          containerClass: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200",
          iconClass: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          progressClass: "bg-blue-200"
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "upcoming_payment":
        return Clock;
      case "threshold_breach":
        return AlertTriangle;
      case "notification":
        return BellRing;
      default:
        return DollarSign;
    }
  };

  const renderProgressBar = (current: number, expected: number, className: string) => {
    const percentage = Math.min((current / expected) * 100, 100);
    return (
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full ${className} transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-2">
          <CardTitle>Cash Flow Alerts</CardTitle>
          <Badge variant="outline" className="ml-2">
            {alerts?.length || 0} Active
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Filter className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollRef}
          className="h-[calc(100vh-12rem)] md:h-[500px]"
        >
          <div className="space-y-2 p-6">
            {alerts?.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const AlertIcon = getAlertIcon(alert.alert_type);
              const hasPaid = alert.current_amount > 0;

              return (
                <Alert
                  key={alert.id}
                  className={`group relative overflow-hidden ${styles.containerClass}`}
                >
                  <div className="flex items-start gap-4">
                    <AlertIcon className={`h-5 w-5 mt-0.5 ${styles.iconClass}`} />
                    <div className="flex-1 space-y-2">
                      <AlertTitle className="flex flex-wrap items-center gap-2 pr-6">
                        <span className="font-semibold">
                          {alert.alert_type === "upcoming_payment" ? "Upcoming Payment Due" : "Cash Flow Alert"}
                        </span>
                        <Badge variant="outline" className={styles.badge}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="grid gap-1">
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          {alert.expected_amount > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
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
