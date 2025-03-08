
import { Vehicle, VehicleStatus } from './vehicle';
import { Agreement } from '@/components/agreements/hooks/useAgreements';

// Vehicle Table Components Types
export interface VehicleTableContentProps {
  vehicles: Vehicle[];
  selectedVehicles?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export interface VehicleTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  error?: Error | null;
  className?: string;
}

export interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
  className?: string;
  onStatusChange?: (status: VehicleStatus) => void;
}

export interface VehicleLocationCellProps {
  vehicleId: string;
  location: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}

export interface VehicleInsuranceCellProps {
  vehicleId: string;
  insurance: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}

export interface VehicleStatusDropdownProps {
  currentStatus: VehicleStatus;
  availableStatuses: Array<{id: string, name: VehicleStatus}>;
  onStatusChange: (status: VehicleStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

// Vehicle Filter Dialog Types
export interface VehicleFilterDialogProps {
  activeFilters: any;
  onFilterChange: (filters: any) => void;
  totalFilters: number;
  className?: string;
}

// Vehicle Form Field Types
export interface VehicleFormFieldsProps {
  form: any; // Replace with specific form type
  className?: string;
}

// Vehicle Details Dialog Types
export interface VehicleDetailsDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

// Vehicle Details Component Types
export interface VehicleDetailsProps {
  vehicleId?: string;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
}

// Vehicle Maintenance Types
export interface MaintenanceTrackerProps {
  vehicleId: string;
  className?: string;
  isLoading?: boolean;
}

// Vehicle Profile Components
export interface VehicleOverviewProps {
  vehicleId: string;
  className?: string;
  isLoading?: boolean;
}

export interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: VehicleStatus;
  className?: string;
  onStatusChange?: (status: VehicleStatus) => void;
}

export interface VehicleDocumentsProps {
  vehicleId: string;
  className?: string;
  isLoading?: boolean;
}

// Dashboard Status Dialog Types
export interface VehicleStatusDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
  className?: string;
}

export interface VehicleStatusDialogV2Props {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
  className?: string;
  onVehicleClick?: (vehicleId: string) => void;
  onStatusChange?: (vehicleId: string, newStatus: VehicleStatus) => void;
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

// ViewToggle Types
export interface ViewToggleProps {
  activeView: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
  className?: string;
}

// New type definitions based on the plan
export interface AgreementCardProps {
  agreement: Agreement;
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  onSelect?: (agreement: Agreement, selected: boolean) => void;
  isSelected?: boolean;
  className?: string;
}

export interface ProfileManagementProps {
  customerId: string;
  profile?: any; // Updated to include the profile object
  className?: string;
  isLoading?: boolean;
}

export interface ViewToggleV2Props {
  viewMode: "grid" | "list" | "compact";
  onChange: (mode: "grid" | "list" | "compact") => void;
  className?: string;
}

// Stats Display Props
export interface StatsDisplayProps {
  paymentCount: number;
  unassignedCount: number;
  totalAmount: number;
  unassignedAmount: number;
  onReconcile: () => void;
  isReconciling: boolean;
  isLoading?: boolean;
  className?: string;
}

// Traffic Fine Stats Props
export interface TrafficFineStatsProps {
  agreementId?: string;
  paymentCount: number;
  className?: string;
}
