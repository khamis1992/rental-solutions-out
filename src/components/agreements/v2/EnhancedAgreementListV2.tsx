
import { useState, useRef, useEffect } from "react";
import { Agreement } from "../hooks/useAgreements";
import { AgreementCard } from "./AgreementCard";
import { SearchInput } from "../search/SearchInput";
import { ViewToggle } from "./ViewToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SortConfig, SortField, SortDirection, EnhancedAgreementListV2Props } from "./types";
import { toast } from "sonner";

export const EnhancedAgreementListV2 = ({
  agreements,
  onViewDetails,
  onDelete,
  viewMode = "grid",
  showLoadingState = false,
  onViewModeChange
}: EnhancedAgreementListV2Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>(agreements);
  const [selectedAgreements, setSelectedAgreements] = useState<Agreement[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<"grid" | "list" | "compact">(viewMode);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "date", direction: "desc" });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update filtered agreements when agreements or search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAgreements(agreements);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      
      const filtered = agreements.filter(agreement => {
        // Search by agreement number
        if (agreement.agreement_number && 
            agreement.agreement_number.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        
        // Search by customer name
        if (agreement.customer && 
            agreement.customer.full_name && 
            agreement.customer.full_name.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        
        // Search by vehicle details
        if (agreement.vehicle) {
          const vehicleInfo = `${agreement.vehicle.make} ${agreement.vehicle.model} ${agreement.vehicle.license_plate}`.toLowerCase();
          if (vehicleInfo.includes(lowerCaseQuery)) {
            return true;
          }
        }
        
        // Search by status
        if (agreement.status.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        
        return false;
      });
      
      setFilteredAgreements(filtered);
    }
  }, [agreements, searchQuery]);

  // Update view mode
  useEffect(() => {
    setCurrentViewMode(viewMode);
  }, [viewMode]);

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list" | "compact") => {
    setCurrentViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Focus search input
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle agreement selection
  const handleSelectAgreement = (agreement: Agreement, selected: boolean) => {
    if (selected) {
      setSelectedAgreements(prev => [...prev, agreement]);
    } else {
      setSelectedAgreements(prev => prev.filter(a => a.id !== agreement.id));
    }
  };

  // Sort agreements
  const sortedAgreements = [...filteredAgreements].sort((a, b) => {
    switch (sortConfig.field) {
      case "date":
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        
      case "amount":
        return sortConfig.direction === "asc" 
          ? a.total_amount - b.total_amount 
          : b.total_amount - a.total_amount;
        
      case "status":
        return sortConfig.direction === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
        
      case "customer":
        const nameA = a.customer?.full_name || "";
        const nameB = b.customer?.full_name || "";
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
        
      default:
        return 0;
    }
  });

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        // Toggle direction if same field
        return {
          ...prevConfig,
          direction: prevConfig.direction === "asc" ? "desc" : "asc"
        };
      } else {
        // New field, default to descending
        return {
          field,
          direction: "desc"
        };
      }
    });
    
    toast.info(`Sorted by ${field} ${sortConfig.direction === "asc" ? "descending" : "ascending"}`);
  };

  // Render empty state
  if (sortedAgreements.length === 0 && !showLoadingState) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <SearchInput
            ref={searchInputRef}
            onSearch={handleSearch}
            placeholder="Search agreements..."
            className="max-w-md"
          />
          
          <ViewToggle 
            viewMode={currentViewMode} 
            onChange={handleViewModeChange}
            onSearchFocus={handleSearchFocus}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium text-gray-500">No agreements found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first agreement"}
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (showLoadingState) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 rounded w-72"></div>
          <div className="h-10 bg-gray-200 rounded w-36"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 h-64">
              <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render main content based on view mode
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <SearchInput
          ref={searchInputRef}
          onSearch={handleSearch}
          placeholder="Search agreements..."
          className="max-w-md"
        />
        
        <ViewToggle 
          viewMode={currentViewMode} 
          onChange={handleViewModeChange}
          onSearchFocus={handleSearchFocus}
        />
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Agreements</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {currentViewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAgreements.map(agreement => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                  onSelect={handleSelectAgreement}
                  isSelected={selectedAgreements.some(a => a.id === agreement.id)}
                />
              ))}
            </div>
          )}
          
          {currentViewMode === "list" && (
            <div className="flex flex-col space-y-3">
              {sortedAgreements.map(agreement => (
                <div 
                  key={agreement.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium">
                        {agreement.agreement_number || `Agreement #${agreement.id.substring(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {agreement.customer?.full_name || "No customer"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      agreement.status === "active" ? "bg-green-100 text-green-800" :
                      agreement.status === "expired" ? "bg-red-100 text-red-800" :
                      agreement.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {agreement.status}
                    </span>
                    
                    <button
                      onClick={() => onViewDetails && onViewDetails(agreement)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {currentViewMode === "compact" && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("customer")}
                    >
                      Customer
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      Vehicle
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAgreements.map(agreement => (
                    <tr key={agreement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {agreement.customer?.full_name || "No customer"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {agreement.agreement_number || `#${agreement.id.substring(0, 8)}`}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agreement.vehicle ? `${agreement.vehicle.make} ${agreement.vehicle.model}` : "No vehicle"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {agreement.vehicle?.license_plate || "No plate"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agreement.start_date ? new Date(agreement.start_date).toLocaleDateString() : "No date"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${agreement.total_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          agreement.status === "active" ? "bg-green-100 text-green-800" :
                          agreement.status === "expired" ? "bg-red-100 text-red-800" :
                          agreement.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {agreement.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => onViewDetails && onViewDetails(agreement)}
                          className="text-blue-600 hover:text-blue-800 transition-colors mr-2"
                        >
                          View
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(agreement)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* Filter for active agreements */}
          <div className={
            currentViewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col space-y-3"
          }>
            {sortedAgreements
              .filter(agreement => agreement.status === "active")
              .map(agreement => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                  onSelect={handleSelectAgreement}
                  isSelected={selectedAgreements.some(a => a.id === agreement.id)}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4">
          {/* Filter for expired agreements */}
          <div className={
            currentViewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col space-y-3"
          }>
            {sortedAgreements
              .filter(agreement => agreement.status === "expired")
              .map(agreement => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                  onSelect={handleSelectAgreement}
                  isSelected={selectedAgreements.some(a => a.id === agreement.id)}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Filter for pending agreements */}
          <div className={
            currentViewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col space-y-3"
          }>
            {sortedAgreements
              .filter(agreement => agreement.status === "pending")
              .map(agreement => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                  onSelect={handleSelectAgreement}
                  isSelected={selectedAgreements.some(a => a.id === agreement.id)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
