
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
        <div className="relative space-y-6 pb-4 rounded-lg overflow-hidden">
          {/* Enhanced Header with dynamic gradient and interactive pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ee7171] to-[#f6d794] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20 animate-pulse" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          
          {/* Enhanced Breadcrumb with animated icons */}
          <div className="relative flex items-center gap-2 text-sm text-white/90 p-4">
            <Folder className="h-4 w-4 animate-fade-in" />
            <span className="font-medium hover:text-white transition-colors">Agreements</span>
            <ChevronRight className="h-4 w-4 text-white/70" />
            <Settings className="h-4 w-4 animate-fade-in" />
            <span className="text-white font-medium">Management</span>
          </div>

          {/* Header Actions with grouped buttons */}
          <div className="relative flex justify-between items-start p-4">
            <AgreementListHeader 
              onImportClick={handleImportClick}
              onDeleteClick={handleDeleteClick}
              isDeleting={false}
            />
            <PaymentImport />
          </div>
        </div>

        {/* Enhanced Stats Section with glass morphism */}
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
