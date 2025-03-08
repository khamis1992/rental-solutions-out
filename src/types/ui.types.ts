
import { Vehicle, VehicleStatus } from './vehicle';

// Vehicle Table Components Types
export interface VehicleTableContentProps {
  vehicles: Vehicle[];
  selectedVehicles?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface VehicleTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
}

export interface VehicleLocationCellProps {
  vehicleId: string;
  location: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export interface VehicleInsuranceCellProps {
  vehicleId: string;
  insurance: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export interface VehicleStatusDropdownProps {
  currentStatus: VehicleStatus;
  availableStatuses: Array<{id: string, name: VehicleStatus}>;
  onStatusChange: (status: VehicleStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Vehicle Filter Dialog Types
export interface VehicleFilterDialogProps {
  activeFilters: any;
  onFilterChange: (filters: any) => void;
  totalFilters: number;
}

// Vehicle Form Field Types
export interface VehicleFormFieldsProps {
  form: any; // Replace with specific form type
}

// Vehicle Details Dialog Types
export interface VehicleDetailsDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Vehicle Details Component Types
export interface VehicleDetailsProps {
  vehicleId?: string;
}

// Vehicle Maintenance Types
export interface MaintenanceTrackerProps {
  vehicleId: string;
}

// Vehicle Profile Components
export interface VehicleOverviewProps {
  vehicleId: string;
}

export interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: VehicleStatus;
}

export interface VehicleDocumentsProps {
  vehicleId: string;
}

// Dashboard Status Dialog Types
export interface VehicleStatusDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
}

export interface VehicleStatusDialogV2Props {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
}

// Toast notification types
export interface ToastOptions {
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  dismissible?: boolean;
}

// Tab Types
export interface TabData {
  value: string;
  label: string;
  content: React.ReactNode;
}
