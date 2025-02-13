
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
      <div className="mx-auto space-y-6 py-8">
        <div className="relative space-y-6 pb-4 rounded-2xl overflow-hidden w-full">
          {/* Professional Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 shadow-md" />
          
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Circuit Board Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 opacity-20">
            <FileText className="w-full h-full text-blue-500 animate-pulse" />
          </div>
          
          {/* Glass Effect Layer */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.02]" />
          
          {/* Content Wrapper */}
          <div className="relative px-8 py-8 w-full max-w-[1600px] mx-auto">
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

            {/* Title Section with Enhanced Typography */}
            <div className="space-y-4 mb-8 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg transform hover:scale-110 transition-transform duration-200">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-transparent bg-clip-text">
                    Agreements Management
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed mt-1">
                    Manage and track all your agreements in one place efficiently
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons with Professional Styling */}
            <div className="flex justify-between items-start gap-6 w-full">
              <div className="flex-1">
                <AgreementListHeader 
                  onImportClick={handleImportClick}
                  onDeleteClick={handleDeleteClick}
                  isDeleting={false}
                />
              </div>
              <div className="flex-shrink-0">
                <PaymentImport />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="relative px-4 md:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/5 to-transparent pointer-events-none" />
          <AgreementStats />
        </div>

        <div className="px-4 md:px-8">
          <AgreementList />
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
