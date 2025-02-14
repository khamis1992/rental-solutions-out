
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: MaintenanceStatus;
  cost?: number;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  };
}
