
import { useState } from "react";
import { AgreementListHeader } from "../list/AgreementListHeader";
import { useAgreements } from "../hooks/useAgreements";
import { EnhancedAgreementListV2 } from "../v2/EnhancedAgreementListV2";
import { Agreement } from "../hooks/useAgreements";
import { toast } from "sonner";

interface AgreementSearchProviderProps {
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
}

export const AgreementSearchProvider = ({
  onViewDetails,
  onDelete
}: AgreementSearchProviderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: agreements = [],
    isLoading,
    isError,
    error
  } = useAgreements(searchQuery);

  const handleSearchChange = (query: string) => {
    console.log("Search query changed:", query);
    setSearchQuery(query);
  };

  const handleImportClick = () => {
    // Import handling logic
  };

  return (
    <div className="w-full">
      <AgreementListHeader 
        onImportClick={handleImportClick}
        onDeleteClick={() => {}}
        isDeleting={false}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      
      <div className="mt-4">
        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Failed to load agreements"}
            </p>
          </div>
        ) : (
          <EnhancedAgreementListV2
            agreements={agreements}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            viewMode="grid"
            showLoadingState={isLoading}
          />
        )}
      </div>
    </div>
  );
};
