
import { Agreement } from "@/types/agreement.types";
import { LucideIcon } from "lucide-react";

export type ViewMode = "grid" | "list";

export interface StatusConfig {
  color: string;
  icon: LucideIcon;
  label: string;
  gradient: string;
  description: string;
}

export interface PaymentConfig {
  color: string;
  icon: LucideIcon;
  badge: string;
  description: string;
}

export interface EnhancedAgreementListV2Props {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
  viewMode?: ViewMode;
  showLoadingState?: boolean;
}

export interface AgreementCardProps {
  agreement: Agreement;
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
}
