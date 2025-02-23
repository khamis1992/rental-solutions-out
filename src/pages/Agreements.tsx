
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
  Clock,
  Search,
  FilterCog,
  CheckCircle2,
  Wallet,
  Lock,
  XCircle,
  Ban,
  Archive,
  CheckSquare,
  ArrowUpDown,
  Plus,
  Loader2
} from "lucide-react";
import { CustomAgreementList } from "@/components/agreements/list/CustomAgreementList";
import { useAgreements } from "@/components/agreements/hooks/useAgreements";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { type Agreement, type LeaseStatus } from "@/types/agreement.types";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LeaseStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Filter and sort agreements
  const filteredAgreements = agreements
    .filter(agreement => {
      const matchesStatus = currentStatus === 'all' ? true : agreement.status === currentStatus;
      const matchesSearch = searchQuery.toLowerCase() === '' ? true : 
        agreement.agreement_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agreement.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agreement.vehicle?.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const statusOptions = [
    { value: "all", label: "All Status", icon: <FilterCog className="h-4 w-4 text-[#1C304F]/70" /> },
    { value: "pending_payment", label: "Pending Payment", icon: <Clock className="h-4 w-4 text-yellow-500" /> },
    { value: "pending_deposit", label: "Pending Deposit", icon: <Wallet className="h-4 w-4 text-[#98BBF5]" /> },
    { value: "active", label: "Active", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
    { value: "closed", label: "Closed", icon: <Lock className="h-4 w-4 text-gray-500" /> },
    { value: "terminated", label: "Terminated", icon: <XCircle className="h-4 w-4 text-red-500" /> },
    { value: "cancelled", label: "Cancelled", icon: <Ban className="h-4 w-4 text-orange-500" /> },
    { value: "archived", label: "Archived", icon: <Archive className="h-4 w-4 text-gray-500" /> },
    { value: "completed", label: "Completed", icon: <CheckSquare className="h-4 w-4 text-green-500" /> }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#98BBF5]/5 to-white">
        {/* Enhanced Header Section */}
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

          {/* Enhanced Search and Filter Bar */}
          <div className="sticky top-4 z-10 mb-6">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-[#98BBF5]/20 p-4 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1C304F]/50 transition-transform duration-300 group-focus-within:rotate-90" />
                  <Input
                    type="search"
                    placeholder="Search agreements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full border-[#98BBF5]/30 focus:border-[#98BBF5] transition-all duration-300"
                  />
                </div>

                {/* Status Filter */}
                <Select value={currentStatus} onValueChange={(value: LeaseStatus | 'all') => setCurrentStatus(value)}>
                  <SelectTrigger className="w-[180px] border-[#98BBF5]/30 hover:border-[#98BBF5]">
                    <div className="flex items-center gap-2">
                      <FilterCog className="h-4 w-4 text-[#1C304F]/70" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Button */}
                <Button
                  variant="outline"
                  className="border-[#98BBF5]/30 hover:border-[#98BBF5]"
                  onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                </Button>

                {/* Create New Button */}
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#98BBF5] hover:bg-[#98BBF5]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Agreement
                </Button>
              </div>

              {/* Active Filters */}
              {currentStatus !== 'all' && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-[#1C304F]/70">Active filters:</span>
                  <Badge 
                    variant="secondary"
                    className="bg-[#98BBF5]/10 text-[#1C304F] hover:bg-[#98BBF5]/20"
                  >
                    {statusOptions.find(opt => opt.value === currentStatus)?.icon}
                    <span className="ml-1">{statusOptions.find(opt => opt.value === currentStatus)?.label}</span>
                    <button 
                      className="ml-2 hover:text-red-500"
                      onClick={() => setCurrentStatus('all')}
                    >
                      ×
                    </button>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Agreements List with Loading State */}
          <div className="pb-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 text-[#98BBF5] animate-spin" />
                <p className="text-[#1C304F]/70 animate-pulse">Loading agreements...</p>
              </div>
            ) : (
              <CustomAgreementList 
                agreements={filteredAgreements}
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
