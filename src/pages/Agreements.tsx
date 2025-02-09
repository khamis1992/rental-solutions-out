
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Building2 } from "lucide-react";

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
        <div className="relative space-y-6 pb-4 rounded-2xl overflow-hidden">
          {/* Professional Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50] via-[#3498DB] to-[#2980B9] opacity-95" />
          
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Glass Effect Layer with enhanced blur */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.02]" />
          
          {/* Content Wrapper */}
          <div className="relative px-6 py-8">
            {/* Enhanced Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Organization</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                <span className="font-medium">Agreements Management</span>
              </div>
            </nav>

            {/* Title Section with Enhanced Typography */}
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
                Agreements Management
              </h1>
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                Manage and track all your agreements in one place. Create, edit, and monitor agreement status efficiently.
              </p>
            </div>
            
            {/* Action Buttons with Professional Styling */}
            <div className="flex justify-between items-start gap-6">
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

        {/* Enhanced Stats Section with Gradient Overlay */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E50]/5 to-transparent pointer-events-none" />
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

