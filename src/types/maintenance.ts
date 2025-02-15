
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent" | "accident";

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: MaintenanceStatus;
  cost?: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  maintenance_type?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  vehicles?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
