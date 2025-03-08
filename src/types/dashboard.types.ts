
export interface DashboardConfig {
  refreshInterval: number;
  showVehicleStats: boolean;
  showFinancialStats: boolean;
  showCustomerStats: boolean;
  showRecentActivity: boolean;
  darkMode: boolean;
  layout: 'compact' | 'standard' | 'expanded';
  defaultDateRange: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
  className?: string;
}

export interface StatsSummaryProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface RevenueChartProps {
  data: ChartData[];
  isLoading?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'rental' | 'return' | 'payment' | 'maintenance' | 'customer';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  limit?: number;
}
