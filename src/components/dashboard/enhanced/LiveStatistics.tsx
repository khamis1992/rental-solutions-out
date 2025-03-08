
import { useEffect, useState } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRealTimeVehicleUpdates } from "@/hooks/useRealTimeVehicleUpdates";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Car, Users, Wallet, Clock, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RealTimeIndicator } from "./RealTimeIndicator";

export const LiveStatistics = () => {
  const { stats, isLoading } = useDashboardStats();
  const { lastUpdate, connectedStatus, recentStatusChanges } = useRealTimeVehicleUpdates({
    notifyOnStatusChange: true,
    historyLimit: 5
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  // When new data arrives, briefly show the "Updates Available" indicator
  useEffect(() => {
    if (lastUpdate) {
      setHasChanges(true);
      const timer = setTimeout(() => setHasChanges(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  if (isLoading || !stats) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>;
  }

  // Calculate trend indicators for stats cards
  const getAvailableTrend = () => {
    const newAvailable = recentStatusChanges.filter(c => c.newStatus === 'available').length;
    return newAvailable > 0 ? "up" : "neutral";
  };
  
  const getRentedTrend = () => {
    const newRented = recentStatusChanges.filter(c => c.newStatus === 'rented').length;
    return newRented > 0 ? "up" : "neutral";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Live Statistics</h2>
        <RealTimeIndicator 
          hasChanges={hasChanges} 
          lastUpdate={lastUpdate} 
          status={connectedStatus} 
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Available Vehicles"
          value={stats.available_vehicles}
          icon={Car}
          description="Ready for rent"
          trend={getAvailableTrend()}
          trendLabel={recentStatusChanges.filter(c => c.newStatus === 'available').length > 0 
            ? `+${recentStatusChanges.filter(c => c.newStatus === 'available').length} new` 
            : undefined}
        />
        
        <StatsCard
          title="Active Rentals"
          value={stats.active_rentals}
          icon={Clock}
          description="Currently rented"
          trend={getRentedTrend()}
          trendLabel={recentStatusChanges.filter(c => c.newStatus === 'rented').length > 0 
            ? `+${recentStatusChanges.filter(c => c.newStatus === 'rented').length} new` 
            : undefined}
        />
        
        <StatsCard
          title="Total Customers"
          value={stats.total_customers}
          icon={Users}
          description="Registered customers"
        />
        
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthly_revenue)}
          icon={Wallet}
          description="Current month"
        />
      </div>
      
      {recentStatusChanges.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-background">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Activity className="h-4 w-4 mr-1" /> Recent Updates
          </h3>
          <div className="space-y-2 text-sm">
            {recentStatusChanges.slice(0, 3).map((change, index) => (
              <p key={index} className="text-muted-foreground">
                Vehicle {change.vehicle.license_plate} changed from{" "}
                <span className="font-medium">{change.oldStatus}</span> to{" "}
                <span className="font-medium">{change.newStatus}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
