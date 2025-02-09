
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Folder, Settings } from "lucide-react";

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
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="relative space-y-6 pb-4">
          {/* Enhanced Header with dynamic gradient and pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4f6ef7] to-[#1a365d] opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-10" />
          
          {/* Enhanced Breadcrumb with icons */}
          <div className="relative flex items-center gap-2 text-sm text-white/80">
            <Folder className="h-4 w-4" />
            <span>Agreements</span>
            <ChevronRight className="h-4 w-4" />
            <Settings className="h-4 w-4" />
            <span className="text-white">Management</span>
          </div>

          {/* Header Actions with grouped buttons */}
          <div className="relative flex justify-between items-start">
            <AgreementListHeader 
              onImportClick={handleImportClick}
              onDeleteClick={handleDeleteClick}
              isDeleting={false}
            />
            <PaymentImport />
          </div>
        </div>

        {/* Stats Section with enhanced cards */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none" />
          <AgreementStats />
        </div>

        <AgreementList />
        
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;
