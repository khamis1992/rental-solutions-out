
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
