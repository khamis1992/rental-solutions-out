
import { ReactNode } from 'react';
import { VehicleStatus } from '@/types/vehicle';

export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

export interface StatCardData {
  title: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  onClick?: () => void;
}

export interface StatusItem {
  status: VehicleStatus;
  count: number;
}

export interface StatusGroup {
  name: string;
  icon: ReactNode;
  items: StatusItem[];
}

export interface RealTimeStatusChange {
  oldStatus: VehicleStatus;
  newStatus: VehicleStatus;
  timestamp: Date;
  vehicle: {
    id: string;
    license_plate: string;
    make: string;
    model: string;
  };
}

export interface VehicleMetrics {
  availableCount: number;
  rentedCount: number;
  maintenanceCount: number;
  totalVehicles: number;
  byMake: Record<string, number>;
  byYear: Record<string, number>;
  utilization: number;
  maintenanceCosts: {
    total: number;
    average: number;
    byType: Record<string, number>;
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface StatusConfigMap {
  [key: string]: {
    color: string;
    label: string;
    icon: ReactNode;
    description: string;
    gradient: string;
    bgColor?: string; // Optional background color
  };
}

export interface AlertDetails {
  id: string;
  type: 'vehicle' | 'payment' | 'customer' | 'maintenance';
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  date?: Date;
  status?: 'new' | 'viewed' | 'resolved';
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  customer?: CustomerDetails;
}

export interface CustomerDetails {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

export interface StatusGroupListProps {
  statuses: StatusItem[];
  statusConfigs: StatusConfigMap;
  onStatusClick: (status: VehicleStatus) => void;
}

export interface DashboardStatsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  layout: Record<string, any>;
  widgets: Widget[];
  user_id?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  settings: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
}
