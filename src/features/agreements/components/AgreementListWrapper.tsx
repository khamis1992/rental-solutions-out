
import { useState } from "react";
import { type Agreement, type LeaseStatus } from "@/types/agreement.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Filter,
  Lock,
  XCircle,
  Ban,
  Archive,
  CheckSquare,
  ArrowUpDown,
  Search,
  Clock,
  Loader2
} from "lucide-react";

interface AgreementListWrapperProps {
  children: React.ReactNode;
  agreements: Agreement[];
  onFilterChange: (agreements: Agreement[]) => void;
  isLoading?: boolean;
}

export const AgreementListWrapper = ({
  children,
  agreements,
  onFilterChange,
  isLoading = false
}: AgreementListWrapperProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStatus, setCurrentStatus] = useState<LeaseStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const statusOptions = [
    { value: "all", label: "All Status", icon: <Filter className="h-4 w-4 text-[#1C304F]/70" /> },
    { value: "pending_payment", label: "Pending Payment", icon: <Clock className="h-4 w-4 text-yellow-500" /> },
    { value: "pending_deposit", label: "Pending Deposit", icon: <Clock className="h-4 w-4 text-[#98BBF5]" /> },
    { value: "active", label: "Active", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
    { value: "closed", label: "Closed", icon: <Lock className="h-4 w-4 text-gray-500" /> },
    { value: "terminated", label: "Terminated", icon: <XCircle className="h-4 w-4 text-red-500" /> },
    { value: "cancelled", label: "Cancelled", icon: <Ban className="h-4 w-4 text-orange-500" /> },
    { value: "archived", label: "Archived", icon: <Archive className="h-4 w-4 text-gray-500" /> },
    { value: "completed", label: "Completed", icon: <CheckSquare className="h-4 w-4 text-green-500" /> }
  ];

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

  // Update parent component with filtered results
  useState(() => {
    onFilterChange(filteredAgreements);
  }, [filteredAgreements, onFilterChange]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="sticky top-4 z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-[#98BBF5]/20 p-4 transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
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
                  <Filter className="h-4 w-4 text-[#1C304F]/70" />
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

      {/* List Content with Loading State */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-[#98BBF5]/10 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 text-[#98BBF5] animate-spin" />
            <p className="text-[#1C304F]/70 animate-pulse">Loading agreements...</p>
          </div>
        ) : filteredAgreements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 bg-[#98BBF5]/10 rounded-full">
              <Search className="h-8 w-8 text-[#1C304F]/40" />
            </div>
            <p className="text-[#1C304F]/70">No agreements found</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

