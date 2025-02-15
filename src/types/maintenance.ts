
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
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
