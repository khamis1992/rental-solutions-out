
import { VehicleStatus } from "./vehicle";
import { Agreement } from "../components/agreements/hooks/useAgreements";

/**
 * Props for the VehicleStatusCell component
 */
export interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
}

/**
 * Props for the VehicleStatusDropdown component
 */
export interface VehicleStatusDropdownProps {
  currentStatus: VehicleStatus;
  availableStatuses: Array<{ id: string; name: VehicleStatus }>;
  onStatusChange: (status: VehicleStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Props for the VehicleStatus component
 */
export interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: VehicleStatus;
}

/**
 * Base component props with common properties
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

/**
 * Enhanced component props with additional properties
 */
export interface EnhancedComponentProps extends BaseComponentProps {
  style?: React.CSSProperties;
  testId?: string;
}

/**
 * Props for the VehicleListView component
 */
export interface VehicleListViewProps extends BaseComponentProps {
  vehicles: any[];
  isLoading?: boolean;
  onEdit?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onStatusChange?: (vehicleId: string, newStatus: VehicleStatus) => void;
}

/**
 * Props for the VehicleTableContent component
 */
export interface VehicleTableContentProps extends BaseComponentProps {
  vehicles: any[];
  isLoading?: boolean;
  onEdit?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onStatusChange?: (vehicleId: string, newStatus: VehicleStatus) => void;
}

/**
 * Props for VehicleFormFields component
 */
export interface VehicleFormFieldsProps {
  form: any;
  vehicleId?: string;
}

/**
 * Props for the AgreementCard component
 */
export interface AgreementCardProps {
  agreement: Agreement;
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  onSelect?: (agreement: Agreement, selected: boolean) => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * Props for the ViewToggle component
 */
export interface ViewToggleV2Props {
  viewMode: "grid" | "list" | "compact";
  onViewModeChange: (mode: "grid" | "list" | "compact") => void;
  className?: string;
}

/**
 * Payment method types
 */
export type PaymentMethodType = 
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'cheque'
  | 'other'
  | 'deposit'
  | 'late_fee'
  | 'penalty';
