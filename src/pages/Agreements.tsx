
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Building2, FileText } from "lucide-react";
import { CustomAgreementList } from "@/components/agreements/list/CustomAgreementList";
import { useAgreements } from "@/components/agreements/hooks/useAgreements";
import { toast } from "sonner";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: agreements = [] } = useAgreements();
  const navigate = useNavigate();

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  const handleViewDetails = (agreement: any) => {
    navigate(`/agreements/${agreement.id}`);
  };

  const handleViewTemplate = (agreement: any) => {
    // Template viewing logic
    console.log("View template:", agreement);
    toast.info("View template functionality coming soon");
  };

  const handleDelete = (agreement: any) => {
    console.log("Delete:", agreement);
    toast.error("Delete functionality not implemented yet");
  };

  return <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section with Professional Gradient */}
        <div className="relative bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
          
          {/* Content Container */}
          <div className="relative w-full max-w-screen-xl mx-auto px-4 lg:px-8 py-10 sm:px-[240px]">
            {/* Enhanced Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-100 hover:bg-blue-50 transition-all duration-300 shadow-sm">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Organization</span>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-300" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200 shadow-sm">
                <span className="font-medium text-blue-700">Agreements Management</span>
              </div>
            </nav>

            {/* Title Section */}
            <div className="mb-10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-transparent bg-clip-text mb-2">
                    Agreements Management
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage and track all your agreements efficiently
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-6 max-w-screen-xl mx-auto">
              <div className="flex-1">
                <AgreementListHeader onImportClick={handleImportClick} onDeleteClick={handleDeleteClick} isDeleting={false} />
              </div>
              <div className="flex-shrink-0">
                <PaymentImport />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Section */}
          <div className="py-8">
            <AgreementStats />
          </div>

          {/* Agreements List */}
          <div className="pb-12">
            <CustomAgreementList
              agreements={agreements}
              onViewDetails={handleViewDetails}
              onViewTemplate={handleViewTemplate}
              onDelete={handleDelete}
            />
          </div>
        </div>

        <CreateAgreementDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </div>
    </DashboardLayout>;
};

export default Agreements;
