
import { useState, useEffect } from "react";
import { EnhancedAgreementListV2 } from "../v2/EnhancedAgreementListV2";
import { Agreement } from "../hooks/useAgreements";
import { CustomFilters } from "./CustomFilters";
import { CustomBulkOperations } from "./CustomBulkOperations";
import { CustomAgreementSummary } from "./CustomAgreementSummary";
import { FilterConfig } from "../v2/types";
import { toast } from "sonner";

interface EnhancedAgreementListApplicationProps {
  agreements: Agreement[];
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  showLoadingState?: boolean;
  searchQuery?: string;
}

/**
 * A complete application component that uses the protected EnhancedAgreementListV2
 * but adds our custom enhanced functionality.
 */
export const EnhancedAgreementListApplication = ({
  agreements,
  onViewDetails,
  onDelete,
  showLoadingState = false,
  searchQuery = ""
}: EnhancedAgreementListApplicationProps) => {
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>(agreements);
  const [selectedAgreements, setSelectedAgreements] = useState<Agreement[]>([]);
  const [showSummary, setShowSummary] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  
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

  const handleFilterChange = (filters: FilterConfig) => {
    // Filter agreements based on the provided filters
    const filtered = agreements.filter(agreement => {
      // Apply search query first
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const agreementNumber = agreement.agreement_number?.toLowerCase() || "";
        const customerName = agreement.customer?.full_name?.toLowerCase() || "";
        const licensePlate = agreement.vehicle?.license_plate?.toLowerCase() || "";
        const vehicleInfo = `${agreement.vehicle?.make} ${agreement.vehicle?.model}`.toLowerCase();
        
        if (!(agreementNumber.includes(query) || 
              customerName.includes(query) || 
              licensePlate.includes(query) ||
              vehicleInfo.includes(query))) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(agreement.status)) {
          return false;
        }
      }
      
      // Payment status filter
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        if (!filters.paymentStatus.includes(agreement.payment_status || "")) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange) {
        const startDate = agreement.start_date ? new Date(agreement.start_date) : null;
        
        if (filters.dateRange.start && startDate) {
          if (startDate < filters.dateRange.start) {
            return false;
          }
        }
        
        if (filters.dateRange.end && startDate) {
          if (startDate > filters.dateRange.end) {
            return false;
          }
        }
      }
      
      // Amount range filter
      if (filters.amountRange) {
        const amount = agreement.total_amount;
        
        if (amount < filters.amountRange.min || amount > filters.amountRange.max) {
          return false;
        }
      }
      
      // Vehicle details filter
      if (filters.vehicleDetails) {
        if (filters.vehicleDetails.make && 
            agreement.vehicle?.make && 
            !agreement.vehicle.make.toLowerCase().includes(filters.vehicleDetails.make.toLowerCase())) {
          return false;
        }
        
        if (filters.vehicleDetails.model && 
            agreement.vehicle?.model && 
            !agreement.vehicle.model.toLowerCase().includes(filters.vehicleDetails.model.toLowerCase())) {
          return false;
        }
        
        if (filters.vehicleDetails.year && 
            agreement.vehicle?.year && 
            agreement.vehicle.year.toString() !== filters.vehicleDetails.year) {
          return false;
        }
      }
      
      return true;
    });

    setFilteredAgreements(filtered);
  };

  const handleSelectAll = () => {
    if (selectedAgreements.length === filteredAgreements.length) {
      setSelectedAgreements([]);
    } else {
      setSelectedAgreements([...filteredAgreements]);
    }
  };

  const handleSelectAgreement = (agreement: Agreement, selected: boolean) => {
    if (selected) {
      setSelectedAgreements(prev => [...prev, agreement]);
    } else {
      setSelectedAgreements(prev => prev.filter(a => a.id !== agreement.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedAgreements([]);
  };

  const handleDeleteSelected = (agreements: Agreement[]) => {
    if (onDelete) {
      // In a real implementation, we would use a batch delete API
      // For now, we'll just call onDelete for each agreement
      agreements.forEach(agreement => onDelete(agreement));
      setSelectedAgreements([]);
      toast.success(`${agreements.length} agreements deleted`);
    }
  };

  const handleExportSelected = (agreements: Agreement[], format: string) => {
    // Implementation for exporting would go here
    toast.success(`Exporting ${agreements.length} agreements as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-4">
      {/* Custom Filters */}
      <CustomFilters onFilterChange={handleFilterChange} />
      
      {/* Custom Bulk Operations */}
      <CustomBulkOperations 
        selectedAgreements={selectedAgreements}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        onExportSelected={handleExportSelected}
      />
      
      {/* Custom Summary Section */}
      {showSummary && filteredAgreements.length > 0 && (
        <CustomAgreementSummary agreements={filteredAgreements} />
      )}
      
      {/* Main Agreement List Component */}
      <EnhancedAgreementListV2
        agreements={filteredAgreements}
        onViewDetails={onViewDetails}
        onDelete={onDelete}
        viewMode={viewMode}
        showLoadingState={showLoadingState}
        onViewModeChange={setViewMode}
      />
    </div>
  );
};
