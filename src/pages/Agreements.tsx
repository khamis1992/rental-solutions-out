
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Building2, FileText, AlertCircle } from "lucide-react";
import { useAgreements } from "@/components/agreements/hooks/useAgreements";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { type Agreement } from "@/types/agreement.types";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SearchInput } from "@/components/agreements/search/SearchInput";
import { ViewToggle } from "@/components/agreements/v2/ViewToggle";
import { EnhancedAgreementListV2 } from "@/components/agreements/v2/EnhancedAgreementListV2";
import { Button } from "@/components/ui/button";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    // Get from localStorage or default to grid
    if (typeof window !== "undefined") {
      return (localStorage.getItem("agreement-view-mode") as "grid" | "list") || "grid";
    }
    return "grid";
  });

  const {
    data: agreements = [],
    isLoading,
    isError,
    error,
    refetch
  } = useAgreements(searchQuery);

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleViewDetails = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowDetailsDialog(true);
  };

  const handleDeleteClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowDeleteDialog(true);
  };

  const handleDeleteComplete = () => {
    toast.success("Agreement deleted successfully");
    refetch();
    setShowDeleteDialog(false);
    setSelectedAgreement(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("agreement-view-mode", mode);
  };

  return <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Enhanced Header Section with Improved Enterprise Styling */}
        <div className="relative bg-gradient-to-r from-[#2D2942]/5 to-[#2D2942]/10 border-b border-[#2D2942]/10">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          
          {/* Content Container */}
          <div className="relative w-full max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
            {/* Enhanced Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-[#2D2942]/60 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#2D2942]/10 hover:bg-[#2D2942]/5 transition-all duration-300 shadow-sm">
                <Building2 className="h-4 w-4 text-[#2D2942]" />
                <span className="font-medium">Organization</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#2D2942]/30" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2D2942]/5 backdrop-blur-md border border-[#2D2942]/10 shadow-sm">
                <span className="font-medium text-[#2D2942]">Agreements Management</span>
              </div>
            </nav>

            {/* Title Section with Improved Spacing */}
            <div className="mb-8">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-[#2D2942] rounded-xl shadow-md">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#2D2942] mb-1">
                    Agreements Management
                  </h1>
                  <p className="text-[#2D2942]/60">
                    Manage and track all your agreements efficiently
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Action Buttons - IMPROVED LAYOUT */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full max-w-md">
                <SearchInput 
                  onSearch={handleSearchChange}
                  placeholder="Search agreements..."
                  initialValue={searchQuery}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <ViewToggle 
                  viewMode={viewMode} 
                  onChange={handleViewModeChange}
                />
                <AgreementListHeader 
                  onImportClick={handleImportClick} 
                  onDeleteClick={() => {}} 
                  isDeleting={false} 
                />
                <PaymentImport />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Enhanced Styling */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Section with Consistent Color Scheme */}
          <div className="py-8">
            <AgreementStats />
          </div>

          {/* Agreements List with Loading/Error State */}
          <div className="pb-12">
            <ErrorBoundary>
              {isError ? (
                <div className="bg-white border rounded-lg p-8 text-center shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-semibold text-gray-800">Unable to load agreements</h3>
                    <p className="text-gray-600 max-w-md mb-4">
                      {error instanceof Error ? error.message : "There was an error fetching your agreements. This might be due to insufficient permissions."}
                    </p>
                    <Button onClick={() => refetch()} className="bg-[#2D2942] hover:bg-[#2D2942]/90">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <EnhancedAgreementListV2 
                  agreements={agreements} 
                  onViewDetails={handleViewDetails} 
                  onDelete={handleDeleteClick} 
                  viewMode={viewMode} 
                  showLoadingState={isLoading}
                  onViewModeChange={handleViewModeChange}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Dialogs */}
        <CreateAgreementDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

        {selectedAgreement && (
          <>
            <AgreementDetailsDialog 
              open={showDetailsDialog} 
              onOpenChange={setShowDetailsDialog} 
              agreementId={selectedAgreement.id} 
            />
            <DeleteAgreementDialog 
              agreementId={selectedAgreement.id} 
              open={showDeleteDialog} 
              onOpenChange={setShowDeleteDialog} 
              onDeleted={handleDeleteComplete} 
            />
          </>
        )}
      </div>
    </DashboardLayout>;
};

export default Agreements;
