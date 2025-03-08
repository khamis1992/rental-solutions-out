
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

// Event handler types
export interface DashboardEventHandlers {
  onRefresh?: () => void;
  onStatCardClick?: (statKey: keyof DashboardStats) => void;
  onDateRangeChange?: (range: DashboardConfig['defaultDateRange']) => void;
  onConfigChange?: (config: Partial<DashboardConfig>) => void;
}

// State management types
export interface DashboardState {
  isLoading: boolean;
  error: Error | null;
  stats: DashboardStats | null;
  config: DashboardConfig;
  lastUpdated: Date | null;
}

// API Response types
export interface DashboardApiResponse {
  data: DashboardStats | null;
  error: string | null;
  timestamp: string;
}

// Fleet status summary type
export interface FleetStatusSummary {
  status: VehicleStatus;
  count: number;
  percentage: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

// Vehicle sensor data types
export interface VehicleSensorData {
  vehicleId: string;
  timestamp: Date;
  mileage: number;
  fuelLevel: number;
  engineHealth: number;
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  batteryLevel: number;
  locationData?: {
    latitude: number;
    longitude: number;
    speed: number;
  };
}

// Notification types for dashboard
export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  entityId?: string;
  entityType?: 'vehicle' | 'customer' | 'agreement' | 'payment';
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  category?: string;
}

// Dashboard component props
export interface DashboardPageProps {
  initialStats?: DashboardStats;
  config?: Partial<DashboardConfig>;
  eventHandlers?: DashboardEventHandlers;
}

// Dashboard stats component props
export interface DashboardStatsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
  error?: Error | null;
  onStatClick?: (statKey: keyof DashboardStats) => void;
}

// Theme and styling types
export interface DashboardThemeConfig {
  cardVariant: 'default' | 'filled' | 'outlined' | 'elevated';
  colorScheme: 'primary' | 'neutral' | 'vibrant';
  animationsEnabled: boolean;
  compactMode: boolean;
  borderRadius: 'square' | 'rounded' | 'pill';
}
