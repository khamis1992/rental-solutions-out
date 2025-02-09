
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight } from "lucide-react";

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
          {/* Header with gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50" />
          
          {/* Breadcrumb */}
          <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
            <span>Agreements</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Management</span>
          </div>

          {/* Header Actions */}
          <div className="relative flex justify-between items-start">
            <AgreementListHeader 
              onImportClick={handleImportClick}
              onDeleteClick={handleDeleteClick}
              isDeleting={false}
            />
            <PaymentImport />
          </div>
        </div>

        {/* Stats Section */}
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
