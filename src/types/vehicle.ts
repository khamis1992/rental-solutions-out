
// Vehicle type definition
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  color?: string;
  mileage: number;
  status: VehicleStatus;
  image_url?: string;
  location?: string;
  insurance_company?: string;
  last_maintenance_date?: string;
  next_service_date?: string;
  documents?: VehicleDocument[];
  created_at?: string;
  updated_at?: string;
}

// Vehicle status type
export type VehicleStatus = 
  | 'available' 
  | 'rented' 
  | 'maintenance' 
  | 'pending_repair' 
  | 'retired'
  | 'accident'
  | 'stolen'
  | 'reserve'
  | 'police_station';

// Vehicle document type
export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: VehicleDocumentType;
  file_url: string;
  expiry_date?: string;
  issue_date?: string;
  document_number?: string;
  status: 'valid' | 'expired' | 'pending';
  created_at: string;
  updated_at: string;
}

// Vehicle document types
export type VehicleDocumentType = 
  | 'registration'
  | 'insurance'
  | 'inspection'
  | 'service_record'
  | 'purchase_invoice'
  | 'other';

// Maintenance record
export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Damage record
export interface DamageRecord {
  id: string;
  vehicle_id: string;
  lease_id?: string;
  damage_type: string;
  description: string;
  status: 'reported' | 'assessed' | 'repaired' | 'waived';
  repair_cost?: number;
  reported_date: string;
  repaired_date?: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Vehicle filter options
export interface VehicleFilters {
  status?: VehicleStatus[];
  make?: string[];
  model?: string[];
  year?: number[];
  location?: string[];
  minMileage?: number;
  maxMileage?: number;
}

// Vehicle stats summary
export interface VehicleStatsSummary {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  needsAttention: number;
  utilizationRate: number;
  maintenanceCosts: number;
  averageMileage: number;
}
