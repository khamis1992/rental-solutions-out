
import { useState } from "react";
import { AgreementListHeader } from "../list/AgreementListHeader";
import { useAgreements } from "../hooks/useAgreements";
import { EnhancedAgreementListV2 } from "../v2/EnhancedAgreementListV2";
import { Agreement } from "../hooks/useAgreements";
import { SearchInput } from "./SearchInput";
import { ViewToggle } from "../v2/ViewToggle";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
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
    toast.info("Import functionality coming soon");
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    console.log("View mode changed to:", mode);
    setViewMode(mode);
    // Save preference to localStorage
    localStorage.setItem("agreement-view-mode", mode);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <SearchInput 
          onSearch={handleSearchChange}
          placeholder="Search agreements..."
          initialValue={searchQuery}
          className="max-w-md"
        />
        <div className="flex items-center gap-4">
          <ViewToggle 
            initialMode={viewMode} 
            onViewModeChange={handleViewModeChange} 
          />
          <AgreementListHeader 
            onImportClick={handleImportClick}
            onDeleteClick={() => {}}
            isDeleting={false}
          />
        </div>
      </div>
      
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
            viewMode={viewMode}
            showLoadingState={isLoading}
            onViewModeChange={handleViewModeChange}
          />
        )}
      </div>
    </div>
  );
};
