
import { ReactNode } from "react";
import { VehicleStatus } from "./vehicle";

// Chart data point type
export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

// Status group for vehicle grouping
export interface StatusGroup {
  name: string;
  items: { status: VehicleStatus; count: number }[];
  icon: ReactNode;
}

// Dashboard configuration options
export interface DashboardConfig {
  refreshInterval: number;
  showAvailableVehicles: boolean;
  showRentedVehicles: boolean;
  showMaintenanceVehicles: boolean;
  showTotalCustomers: boolean;
  showActiveRentals: boolean;
  showMonthlyRevenue: boolean;
}

// Status configuration for vehicle statuses
export interface StatusConfig {
  color: string;
  label: string;
  bgColor: string;
  icon: ReactNode;
}

export interface StatusConfigMap {
  [key: string]: StatusConfig;
}

// Dashboard statistics
export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

// Alert types
export interface CustomerDetails {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

export interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

export interface AlertDetails {
  id: string;
  type: 'vehicle' | 'customer' | 'payment' | 'maintenance' | 'contract';
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  date?: string;
  customer?: CustomerDetails;
  vehicle?: VehicleDetails;
  status?: string;
}

// Schedule types
export interface Schedule {
  id: string;
  customer_id: string;
  vehicle_id: string;
  scheduled_time: string;
  end_time?: string;
  location_address: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  schedule_type: 'pickup' | 'dropoff' | 'service' | 'chauffeur';
  profiles: {
    full_name: string;
    phone_number: string;
  };
  vehicles: {
    make: string;
    model: string;
    license_plate: string;
  };
}

// Tour step type
export interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'left' | 'right' | 'top' | 'bottom';
}
