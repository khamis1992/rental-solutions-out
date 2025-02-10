
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Users, Car, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const BusinessHealth = () => {
  const { data: stats } = useQuery({
    queryKey: ["business-health"],
    queryFn: async () => {
      const [revenueResponse, customersResponse, vehiclesResponse] = await Promise.all([
        supabase
          .from("unified_payments")
          .select("amount")
          .gte("created_at", new Date(new Date().setDate(1)).toISOString()),
        supabase
          .from("profiles")
          .select("id", { count: 'exact' })
          .eq("role", "customer"),
        supabase
          .from("vehicles")
          .select("status")
      ]);

      const monthlyRevenue = revenueResponse.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      const activeVehicles = vehiclesResponse.data?.filter(v => 
        v.status === "rented" || v.status === "available").length || 0;

      return {
        monthlyRevenue,
        customerCount: customersResponse.count || 0,
        fleetUtilization: vehiclesResponse.data ? 
          (activeVehicles / vehiclesResponse.data.length) * 100 : 0
      };
    }
  });

  const metrics = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.monthlyRevenue || 0),
      change: "+12.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Total Customers",
      value: stats?.customerCount || 0,
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Fleet Utilization",
      value: `${Math.round(stats?.fleetUtilization || 0)}%`,
      change: "-2.1%",
      trend: "down",
      icon: Car,
      color: "text-orange-500"
    }
  ];

  return (
    <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Business Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full bg-white ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${
                metric.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
