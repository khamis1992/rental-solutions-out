
import { useState, useEffect } from "react";
import { EnhancedAgreementListV2 } from "../v2/EnhancedAgreementListV2";
import { EnhancedAgreementListV2Wrapper } from "../v2/EnhancedAgreementListV2Wrapper";
import { Agreement } from "../hooks/useAgreements";
import { AdvancedFilters } from "../v2/AdvancedFilters";
import { BulkOperations } from "../v2/BulkOperations";
import { AgreementSummary } from "../v2/AgreementSummary";
import { FilterConfig } from "../v2/types";
import { toast } from "sonner";

interface ExtendedAgreementListWrapperProps {
  agreements: Agreement[];
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  showLoadingState?: boolean;
  searchQuery?: string;
}

/**
 * A wrapper component that extends the functionality of the EnhancedAgreementListV2Wrapper
 * without modifying the protected files.
 */
export const ExtendedAgreementListWrapper = ({
  agreements,
  onViewDetails,
  onDelete,
  showLoadingState = false,
  searchQuery = ""
}: ExtendedAgreementListWrapperProps) => {
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>(agreements);

  // Update filtered agreements when agreements or search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAgreements(agreements);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = agreements.filter(agreement => {
        const agreementNumber = agreement.agreement_number?.toLowerCase() || "";
        const customerName = agreement.customer?.full_name?.toLowerCase() || "";
        const licensePlate = agreement.vehicle?.license_plate?.toLowerCase() || "";
        const vehicleInfo = `${agreement.vehicle?.make} ${agreement.vehicle?.model}`.toLowerCase();
        
        return (
          agreementNumber.includes(query) || 
          customerName.includes(query) || 
          licensePlate.includes(query) ||
          vehicleInfo.includes(query)
        );
      });
      
      setFilteredAgreements(filtered);
    }
  }, [agreements, searchQuery]);

  // Use the protected components but with our filtered agreements
  return (
    <EnhancedAgreementListV2Wrapper
      agreements={filteredAgreements}
      onViewDetails={onViewDetails}
      onDelete={onDelete}
      showLoadingState={showLoadingState}
    />
  );
};
