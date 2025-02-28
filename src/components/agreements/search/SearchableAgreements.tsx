
import { useState } from "react";
import { useAgreements, Agreement } from "../hooks/useAgreements";
import { AgreementListHeader } from "../list/AgreementListHeader";
import { EnhancedAgreementListV2 } from "../v2/EnhancedAgreementListV2";

interface SearchableAgreementsProps {
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
}

export const SearchableAgreements = ({
  onViewDetails,
  onDelete
}: SearchableAgreementsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: agreements = [],
    isLoading,
    isError,
    error,
    refetch
  } = useAgreements(searchQuery);

  const handleSearchChange = (query: string) => {
    console.log("Search query changed:", query);
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <AgreementListHeader 
          onImportClick={() => {}}
          onDeleteClick={() => {}}
          isDeleting={false}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>
      
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center justify-between">
          <p className="text-blue-700">
            Showing results for: <span className="font-medium">{searchQuery}</span>
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      )}
      
      <EnhancedAgreementListV2
        agreements={agreements}
        onViewDetails={onViewDetails}
        onDelete={onDelete}
        viewMode="grid"
        showLoadingState={isLoading}
      />
    </div>
  );
};

// Import Button component
import { Button } from "@/components/ui/button";
