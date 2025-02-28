
import { useState, useEffect } from "react";
import { EnhancedAgreementListV2 } from "./EnhancedAgreementListV2";
import { Agreement } from "../hooks/useAgreements";
import { AdvancedFilters } from "./AdvancedFilters";
import { BulkOperations } from "./BulkOperations";
import { AgreementSummary } from "./AgreementSummary";
import { FilterConfig } from "./types";
import { toast } from "sonner";

interface EnhancedAgreementListV2WrapperProps {
  agreements: Agreement[];
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  showLoadingState?: boolean;
}

export const EnhancedAgreementListV2Wrapper = ({
  agreements,
  onViewDetails,
  onDelete,
  showLoadingState = false
}: EnhancedAgreementListV2WrapperProps) => {
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>(agreements);
  const [selectedAgreements, setSelectedAgreements] = useState<Agreement[]>([]);
  const [showSummary, setShowSummary] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  
  // Update filtered agreements when agreements change
  useEffect(() => {
    setFilteredAgreements(agreements);
  }, [agreements]);

  const handleFilterChange = (filters: FilterConfig) => {
    // Filter agreements based on the provided filters
    const filtered = agreements.filter(agreement => {
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

  const handleSelectAgreement = (agreement: Agreement, selected: boolean) => {
    if (selected) {
      setSelectedAgreements(prev => [...prev, agreement]);
    } else {
      setSelectedAgreements(prev => prev.filter(a => a.id !== agreement.id));
    }
  };

  const handleSelectAll = (agreements: Agreement[]) => {
    setSelectedAgreements(agreements);
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
      {/* Advanced Filters */}
      <AdvancedFilters onFilterChange={handleFilterChange} />
      
      {/* Bulk Operations */}
      <BulkOperations 
        selectedAgreements={selectedAgreements}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        onExportSelected={handleExportSelected}
      />
      
      {/* Summary Section */}
      {showSummary && filteredAgreements.length > 0 && (
        <AgreementSummary agreements={filteredAgreements} />
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
