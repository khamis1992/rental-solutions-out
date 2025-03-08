
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  Car, Users, Key, Wrench, Calculator, Calendar, TrendingUp,
  ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardStatsProps } from "@/types/dashboard.types";

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statsItems = [
    {
      title: "Total Vehicles",
      value: stats.total_vehicles,
      icon: Car,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      description: "Fleet size",
    },
    {
      title: "Available Vehicles",
      value: stats.available_vehicles,
      icon: Key,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      description: "Ready for rent",
      trend: stats.available_vehicles > (stats.total_vehicles * 0.3) ? "up" : "down",
    },
    {
      title: "Rented Vehicles",
      value: stats.rented_vehicles,
      icon: Calendar,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      description: "Currently rented",
    },
    {
      title: "Maintenance Vehicles",
      value: stats.maintenance_vehicles,
      icon: Wrench,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      description: "Needs attention",
      trend: stats.maintenance_vehicles > (stats.total_vehicles * 0.1) ? "down" : "up",
    },
    {
      title: "Total Customers",
      value: stats.total_customers,
      icon: Users,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      description: "Registered clients",
    },
    {
      title: "Active Rentals",
      value: stats.active_rentals,
      icon: Calculator,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      description: "Ongoing contracts",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthly_revenue),
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10", 
      iconColor: "text-emerald-500",
      description: "Current month",
      isRevenue: true,
      trend: stats.monthly_revenue > 50000 ? "up" : "down",
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {statsItems.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className="overflow-hidden border border-muted hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <div className="flex items-center">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
