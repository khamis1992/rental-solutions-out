
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

// Enum definitions for database alignment
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'pending_repair' | 'retired';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'partially_paid' | 'overdue';
export type AgreementStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'overdue';
export type CustomerStatus = 'active' | 'inactive' | 'pending_review' | 'blacklisted';

// Rich status type with metadata
export interface StatusWithMetadata<T extends string> {
  status: T;
  lastUpdated: Date;
  updatedBy?: string;
  notes?: string;
}

// Database aligned composite types
export interface DashboardStatsWithTrends extends DashboardStats {
  trends: {
    vehicles: StatsChangeIndicator;
    customers: StatsChangeIndicator;
    revenue: StatsChangeIndicator;
    rentals: StatsChangeIndicator;
  };
  lastUpdated: Date;
}

// JSON schema for dashboard configuration
export interface DashboardConfig {
  refreshInterval: number;
  defaultDateRange: 'day' | 'week' | 'month' | 'year';
  visibleStats: (keyof DashboardStats)[];
  layout: {
    columns: 1 | 2 | 3 | 4;
    showCharts: boolean;
    compactView: boolean;
  };
}
