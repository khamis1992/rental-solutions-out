
import { Agreement } from "../hooks/useAgreements";

export interface EnhancedAgreementListV2Props {
  agreements: Agreement[];
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  viewMode?: "grid" | "list";
  showLoadingState?: boolean;
  onViewModeChange?: (mode: "grid" | "list") => void;
}
