
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  History, RefreshCw, CreditCard, Wallet, CarFront, 
  KeyRound, FileSignature, FileEdit, Calendar, MapPin
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const RecentActivity = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recentActivities, refetch } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      // Fetch recent vehicle additions
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      // Fetch recent agreement updates
      const { data: agreements } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (
            make,
            model
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(1);

      // Fetch recent vehicle returns
      const { data: returns } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (
            make,
            model
          )
        `)
        .eq("status", "closed")
        .order("updated_at", { ascending: false })
        .limit(1);

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("unified_payments")
        .select(`
          *,
          leases (
            agreement_number,
            vehicles (
              make,
              model
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      return {
        vehicleAddition: vehicles?.[0],
        agreementUpdate: agreements?.[0],
        vehicleReturn: returns?.[0],
        recentPayments: payments || []
      };
    },
  });

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPaymentIcon = (payment: any) => {
    return payment.payment_method === 'card' ? CreditCard : Wallet;
  };

  const activities = [
    ...(recentActivities?.recentPayments || []).map(payment => ({
      icon: getPaymentIcon(payment),
      title: "Payment Received",
      description: `${formatCurrency(payment.amount)} - Agreement ${payment.leases?.agreement_number || 'N/A'}`,
      time: getTimeAgo(payment.created_at),
      status: "success",
      details: `Payment method: ${payment.payment_method || 'N/A'}`
    })),
    recentActivities?.vehicleAddition && {
      icon: CarFront,
      title: "New Vehicle Added",
      description: `${recentActivities.vehicleAddition.year} ${recentActivities.vehicleAddition.make} ${recentActivities.vehicleAddition.model}`,
      time: getTimeAgo(recentActivities.vehicleAddition.created_at),
      status: "success",
      details: "Added to fleet"
    },
    recentActivities?.agreementUpdate && {
      icon: FileEdit,
      title: "Rental Agreement Updated",
      description: `Agreement #${recentActivities.agreementUpdate.agreement_number}`,
      time: getTimeAgo(recentActivities.agreementUpdate.updated_at),
      status: "warning",
      details: `${recentActivities.agreementUpdate.vehicles.make} ${recentActivities.agreementUpdate.vehicles.model}`
    },
    recentActivities?.vehicleReturn && {
      icon: KeyRound,
      title: "Vehicle Returned",
      description: `${recentActivities.vehicleReturn.vehicles.make} ${recentActivities.vehicleReturn.vehicles.model}`,
      time: getTimeAgo(recentActivities.vehicleReturn.updated_at),
      status: "info",
      details: "Vehicle inspection completed"
    }
  ].filter(Boolean);

  const getStatusStyles = (status: string) => {
    const baseStyles = "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300";
    switch (status) {
      case 'success':
        return `${baseStyles} bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30`;
      case 'warning':
        return `${baseStyles} bg-amber-50 text-amber-500 dark:bg-amber-900/20 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30`;
      case 'info':
        return `${baseStyles} bg-sky-50 text-sky-500 dark:bg-sky-900/20 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-500 dark:bg-gray-900/20 group-hover:bg-gray-100 dark:group-hover:bg-gray-900/30`;
    }
  };

  const todayActivities = activities.filter(activity => activity?.time.includes('h ago') || activity?.time === 'Just now');

  return (
    <Card className="lg:col-span-4 bg-card/50 backdrop-blur-sm border-gray-200/50 hover:border-gray-300/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <History className="h-5 w-5 text-muted-foreground" />
            {todayActivities.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            {todayActivities.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {todayActivities.length} {todayActivities.length === 1 ? 'activity' : 'activities'} today
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className={cn("transition-all duration-300", isRefreshing && "animate-spin")}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            activity && (
              <Tooltip key={i} content={activity.details}>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group cursor-pointer">
                  <div className={getStatusStyles(activity.status)}>
                    <activity.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap px-2 py-1 rounded-full bg-muted/50">
                    {activity.time}
                  </span>
                </div>
              </Tooltip>
            )
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
