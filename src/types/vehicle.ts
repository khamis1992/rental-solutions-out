
/**
 * Vehicle status types
 */
export type VehicleStatus = 
  | 'available'
  | 'rented'
  | 'maintenance'
  | 'retired'
  | 'accident'
  | 'stolen'
  | 'reserve'
  | 'police_station'
  | 'pending_repair';

/**
 * Vehicle interface
 */
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color?: string | null;
  vin?: string | null;
  status: VehicleStatus;
  mileage?: number;
  location?: string | null;
  daily_rate?: number | null;
  monthly_rate?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Vehicle document interface
 */
export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_url: string;
  document_name?: string;
  expiry_date?: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Vehicle maintenance record
 */
export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'urgent';
  cost?: number;
  scheduled_date: string;
  completed_date?: string | null;
  notes?: string;
  category_id?: string;
}

/**
 * Location record for tracking vehicles or users
 */
export interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  user_id?: string;
  vehicle_id?: string;
  accuracy?: number;
  address?: string;
  connection_status?: string;
  device_info?: string;
}
