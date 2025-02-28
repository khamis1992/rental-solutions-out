
import { useState, useRef, useEffect } from "react";
import { useAgreements } from "./hooks/useAgreements";
import { AgreementList } from "./components/AgreementList";
import { SearchInput } from "./components/ListControls/SearchInput";
import { ViewToggle } from "./components/ListControls/ViewToggle";
import { AdvancedFilters } from "./components/ListControls/AdvancedFilters";
import { BulkOperations } from "./components/ListControls/BulkOperations";
import { AgreementSummary } from "./components/AgreementSummary";
import { Agreement } from "@/types/agreement.types";
import { SortConfig, FilterConfig } from "./types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AgreementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>([]);
  const [selectedAgreements, setSelectedAgreements] = useState<Agreement[]>([]);
  const [showSummary, setShowSummary] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: agreements, isLoading, error } = useAgreements(searchQuery);
  
  // Initialize filtered agreements when data is loaded
  useEffect(() => {
    if (agreements) {
      let filtered = [...agreements];
      
      // Apply basic tab filtering
      if (activeTab === "active") {
        filtered = filtered.filter(a => a.status === "active");
      } else if (activeTab === "pending") {
        filtered = filtered.filter(a => a.status === "pending_payment");
      } else if (activeTab === "closed") {
        filtered = filtered.filter(a => a.status === "closed");
      }
      
      setFilteredAgreements(filtered);
    }
  }, [agreements, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewDetails = (agreement: Agreement) => {
    // In a real implementation, we would navigate to the agreement details page or open a modal
    toast.info(`Viewing details for agreement ${agreement.agreement_number}`);
  };

  const handleDelete = (agreement: Agreement) => {
    // In a real implementation, we would call an API to delete the agreement
    toast.success(`Agreement ${agreement.agreement_number} deleted`);
    
    // Remove from filtered agreements
    setFilteredAgreements(prev => prev.filter(a => a.id !== agreement.id));
    
    // Remove from selected agreements if it's selected
    setSelectedAgreements(prev => prev.filter(a => a.id !== agreement.id));
  };

  const handleFilterChange = (filters: FilterConfig) => {
    if (!agreements) return;
    
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
    // In a real implementation, we would use a batch delete API
    agreements.forEach(agreement => {
      // Remove from filtered agreements
      setFilteredAgreements(prev => prev.filter(a => a.id !== agreement.id));
    });
    
    setSelectedAgreements([]);
    toast.success(`${agreements.length} agreements deleted`);
  };

  const handleExportSelected = (agreements: Agreement[], format: string) => {
    // Implementation for exporting would go here
    toast.success(`Exporting ${agreements.length} agreements as ${format.toUpperCase()}`);
  };
  
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading agreements: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agreements Management</h1>
        <div className="flex items-center gap-4">
          <SearchInput 
            onSearch={handleSearch} 
            ref={searchInputRef}
            initialValue={searchQuery}
            placeholder="Search agreements..."
          />
          <ViewToggle 
            viewMode={viewMode} 
            onChange={setViewMode} 
            onSearchFocus={focusSearchInput}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Agreements</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending Payment</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
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
          <AgreementList
            agreements={filteredAgreements}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            viewMode={viewMode}
            showLoadingState={isLoading}
            onSelectAgreement={handleSelectAgreement}
            selectedAgreements={selectedAgreements}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
