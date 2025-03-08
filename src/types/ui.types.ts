
import { VehicleStatus } from "./vehicle";

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
