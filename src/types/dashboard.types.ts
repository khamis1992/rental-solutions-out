
/**
 * Dashboard statistics type definitions
 */
export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

export interface StatsChangeIndicator {
  value: number;
  trend: 'up' | 'down' | 'neutral';
  label: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  previousValue?: number;
  changePercentage?: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  description?: React.ReactNode;
}
