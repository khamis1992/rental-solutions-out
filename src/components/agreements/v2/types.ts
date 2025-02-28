
import { Agreement } from "../hooks/useAgreements";

export interface EnhancedAgreementListV2Props {
  agreements: Agreement[];
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  viewMode?: "grid" | "list" | "compact";
  showLoadingState?: boolean;
  onViewModeChange?: (mode: "grid" | "list" | "compact") => void;
}

export interface AgreementCardProps {
  agreement: Agreement;
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  onSelect?: (agreement: Agreement, selected: boolean) => void;
  isSelected?: boolean;
}

export type SortField = "date" | "amount" | "status" | "customer";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  status?: string[];
  paymentStatus?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  vehicleDetails?: {
    make: string;
    model: string;
    year: string;
  };
}

export interface StatusConfig {
  color: string;
  icon: React.ComponentType;
  label: string;
  gradient: string;
  description: string;
}

export interface PaymentConfig {
  color: string;
  icon: React.ComponentType;
  badge: string;
  description: string;
}
