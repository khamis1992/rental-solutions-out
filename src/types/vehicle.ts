
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

// Vehicle Filter Params for UI filtering
export interface VehicleFilterParams {
  status?: VehicleStatus;
  make?: string;
  model?: string;
  year?: number;
  location?: string;
  minMileage?: number;
  maxMileage?: number;
}

// Vehicle Table Props
export interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  selectedVehicles?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Vehicle Grid Props
export interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

// Delete Dialog Props
export interface DeleteVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  count: number;
}

// Bulk Actions Props
export interface BulkActionsMenuProps {
  selectedCount: number;
  onDelete: () => void;
}

// Vehicle List Props
export interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  viewMode?: "list" | "grid";
}

// Insurance Form Data
export interface InsuranceFormData {
  id?: string;
  vehicle_id: string;
  policy_number: string;
  provider: string;
  coverage_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  status?: string;
}

// Vehicle form data
export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  color: string;
  license_plate: string;
  vin: string;
  mileage: string;
  description: string;
}

// Vehicle Status Dropdown Props
export interface VehicleStatusDropdownProps {
  currentStatus: VehicleStatus;
  availableStatuses: Array<{ id: string; name: VehicleStatus }>;
  onStatusChange: (status: VehicleStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}
