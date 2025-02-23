
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { 
  ChevronRight, 
  Building2, 
  FileText,
  Settings,
  BarChart,
  Clock
} from "lucide-react";
import { CustomAgreementList } from "@/components/agreements/list/CustomAgreementList";
import { useAgreements } from "@/components/agreements/hooks/useAgreements";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { type Agreement } from "@/types/agreement.types";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { toast } from "sonner";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { 
    data: agreements = [], 
    isLoading,
    refetch 
  } = useAgreements();

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#98BBF5]/5 to-white">
        {/* Enhanced Header Section with New Color Scheme */}
        <div className="relative bg-gradient-to-r from-[#98BBF5]/10 via-[#98BBF5]/20 to-[#98BBF5]/10 border-b border-[#98BBF5]/20">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
          
          {/* Content Container */}
          <div className="relative w-full max-w-screen-xl mx-auto px-4 lg:px-8 py-10 sm:px-[240px]">
            {/* Enhanced Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-[#1C304F] mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#98BBF5]/30 hover:bg-[#98BBF5]/10 transition-all duration-300 shadow-sm">
                <Building2 className="h-4 w-4 text-[#1C304F]" />
                <span className="font-medium">Organization</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#98BBF5]" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#98BBF5]/10 backdrop-blur-md border border-[#98BBF5]/30 shadow-sm">
                <FileText className="h-4 w-4 text-[#1C304F]" />
                <span className="font-medium text-[#1C304F]">Agreements Management</span>
              </div>
            </nav>

            {/* Enhanced Title Section */}
            <div className="mb-10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-[#98BBF5] to-[#1C304F] rounded-xl shadow-lg group transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <FileText className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1C304F] via-[#98BBF5] to-[#1C304F] text-transparent bg-clip-text mb-2">
                    Agreements Management
                  </h1>
                  <p className="text-[#1C304F]/80 text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Manage and
                    <BarChart className="h-4 w-4" /> track all agreements
                    <Clock className="h-4 w-4" /> efficiently
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between items-center gap-6 max-w-screen-xl mx-auto">
              <div className="flex-1">
                <AgreementListHeader 
                  onImportClick={handleImportClick} 
                  onDeleteClick={() => {}} 
                  isDeleting={false}
                />
              </div>
              <div className="flex-shrink-0">
                <PaymentImport />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Stats Section */}
          <div className="py-8">
            <AgreementStats />
          </div>

          {/* Enhanced Agreements List */}
          <div className="pb-12">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#98BBF5]"></div>
              </div>
            ) : (
              <CustomAgreementList 
                agreements={agreements}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteClick}
                viewMode="grid"
              />
            )}
          </div>
        </div>

        {/* Dialogs */}
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />

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
    </DashboardLayout>
  );
};

export default Agreements;

