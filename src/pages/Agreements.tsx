
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { ChevronRight, Building2, FileText, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Enhanced Header Section with Wave Pattern */}
        <div className="relative bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-blue-700/90 border-b dark:border-blue-800">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Content Container */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Enhanced Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <Building2 className="h-4 w-4 text-white" />
                <span className="font-medium">Organization</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                <FileText className="h-4 w-4 text-white" />
                <span className="font-medium text-white">Agreements Management</span>
              </div>
            </nav>

            {/* Title Section with Enhanced Design */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-white/10 rounded-xl shadow-inner border border-white/20">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      Agreements Management
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/20 text-white border border-blue-300/30">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Pro
                      </span>
                    </h1>
                    <p className="text-white/80 text-lg">
                      Manage and track all your agreements efficiently
                    </p>
                  </div>
                </div>

                {/* Notification Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <Bell className="h-5 w-5 text-white" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Action Buttons with Enhanced Design */}
            <div className="flex justify-between items-center gap-6 backdrop-blur-sm">
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

          {/* Decorative Wave Pattern */}
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-[1px]">
            <svg className="w-full h-8" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 48h1440V0c-211.415 32-461.415 48-750 48-288.585 0-538.585-16-750-48v48z" fill="currentColor" className="text-gray-50 dark:text-gray-900" />
            </svg>
          </div>
        </div>

        {/* Main Content Area with Enhanced Spacing */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Section with Animation */}
          <div className="transform -translate-y-8">
            <AgreementStats />
          </div>

          {/* Agreements List with Enhanced Spacing */}
          <div className="pb-12">
            <AgreementList />
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
