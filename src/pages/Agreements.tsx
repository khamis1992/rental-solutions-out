
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Building2, FileText } from "lucide-react";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="w-full mx-auto">
          {/* Header Section with Professional Gradient */}
          <div className="relative bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            
            {/* Content Container */}
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Enhanced Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
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
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-transparent bg-clip-text">
                      Agreements Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage and track all your agreements efficiently
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-4">
                <AgreementListHeader
                  onImportClick={handleImportClick}
                  onDeleteClick={handleDeleteClick}
                  isDeleting={false}
                />
                <PaymentImport />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stats Section */}
            <div className="py-6">
              <AgreementStats />
            </div>

            {/* Agreements List */}
            <div className="pb-8">
              <AgreementList />
            </div>
          </div>
        </div>

        <CreateAgreementDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;
