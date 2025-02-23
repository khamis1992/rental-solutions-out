
import { Agreement } from "@/types/agreement.types";
import { CustomAgreementList } from "./CustomAgreementList";

interface AgreementListContentProps {
  agreements: Agreement[];
  isLoading?: boolean;
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
}

export function AgreementListContent({
  agreements,
  isLoading,
  onViewDetails,
  onDelete,
}: AgreementListContentProps) {
  return (
    <CustomAgreementList
      agreements={agreements}
      onViewDetails={onViewDetails}
      onDelete={onDelete}
      viewMode="grid"
    />
  );
}
