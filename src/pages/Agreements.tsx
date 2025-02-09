
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { Folder, Settings, ChevronRight, Building2, Layers } from "lucide-react";

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
          {/* Primary Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#9333EA] opacity-90" />
          
          {/* Animated Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          {/* Glass Effect Layer */}
          <div className="absolute inset-0 backdrop-blur-[1px] bg-white/5" />
          
          {/* Enhanced Breadcrumb Navigation */}
          <div className="relative flex items-center gap-3 text-sm text-white/90 p-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
              <Building2 className="h-4 w-4 animate-fade-in" />
              <span className="font-medium">Organization</span>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
              <Folder className="h-4 w-4 animate-fade-in" />
              <span className="font-medium">Agreements</span>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Settings className="h-4 w-4 animate-fade-in" />
              <span className="font-medium">Management</span>
            </div>
          </div>

          {/* Enhanced Header Content */}
          <div className="relative px-4 py-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Agreements Management
              </h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex justify-between items-start">
              <AgreementListHeader 
                onImportClick={handleImportClick}
                onDeleteClick={handleDeleteClick}
                isDeleting={false}
              />
              <PaymentImport />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
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

