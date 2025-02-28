
import { useState, useMemo, useCallback } from "react";
import { EnhancedAgreementListV2Props, SortConfig, FilterConfig } from "./types";
import { AgreementCard } from "./AgreementCard";
import { 
  Filter, 
  ArrowUpDown, 
  CalendarIcon, 
  ChevronDown,
  ArrowDownAZ,
  ArrowUpAZ,
  Check
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export const EnhancedAgreementListV2 = ({
  agreements,
  onViewDetails,
  onDelete,
  viewMode = "grid",
  showLoadingState = false,
  onViewModeChange
}: EnhancedAgreementListV2Props) => {
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc"
  });

  // Filtering state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: [],
    paymentStatus: [],
    dateRange: undefined
  });

  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterConfig.status && filterConfig.status.length > 0) count++;
    if (filterConfig.paymentStatus && filterConfig.paymentStatus.length > 0) count++;
    if (filterConfig.dateRange) count++;
    return count;
  }, [filterConfig]);

  // Toggle status filter
  const toggleStatusFilter = useCallback((status: string) => {
    setFilterConfig(prev => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return {
        ...prev,
        status: newStatuses
      };
    });
  }, []);

  // Toggle payment status filter
  const togglePaymentStatusFilter = useCallback((status: string) => {
    setFilterConfig(prev => {
      const currentStatuses = prev.paymentStatus || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return {
        ...prev,
        paymentStatus: newStatuses
      };
    });
  }, []);

  // Apply date filter
  const applyDateFilter = useCallback(() => {
    if (dateFrom || dateTo) {
      setFilterConfig(prev => ({
        ...prev,
        dateRange: {
          start: dateFrom,
          end: dateTo
        }
      }));
    }
  }, [dateFrom, dateTo]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterConfig({
      status: [],
      paymentStatus: [],
      dateRange: undefined
    });
    setDateFrom(undefined);
    setDateTo(undefined);
  }, []);

  // Filtered and sorted agreements
  const filteredAndSortedAgreements = useMemo(() => {
    // Start with filtering
    let result = [...agreements];

    // Apply status filter
    if (filterConfig.status && filterConfig.status.length > 0) {
      result = result.filter(agreement => 
        filterConfig.status!.includes(agreement.status)
      );
    }

    // Apply payment status filter
    if (filterConfig.paymentStatus && filterConfig.paymentStatus.length > 0) {
      result = result.filter(agreement => 
        filterConfig.paymentStatus!.includes(agreement.payment_status || 'pending')
      );
    }

    // Apply date range filter
    if (filterConfig.dateRange) {
      const { start, end } = filterConfig.dateRange;
      if (start) {
        result = result.filter(agreement => 
          agreement.start_date && new Date(agreement.start_date) >= start
        );
      }
      if (end) {
        result = result.filter(agreement => 
          agreement.start_date && new Date(agreement.start_date) <= end
        );
      }
    }

    // Then sort
    return result.sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (field) {
        case 'date':
          return multiplier * (
            (new Date(a.created_at).getTime()) - 
            (new Date(b.created_at).getTime())
          );
        case 'amount':
          return multiplier * (a.total_amount - b.total_amount);
        case 'status':
          return multiplier * a.status.localeCompare(b.status);
        case 'customer':
          return multiplier * (
            (a.customer?.full_name || '').localeCompare(b.customer?.full_name || '')
          );
        default:
          return 0;
      }
    });
  }, [agreements, filterConfig, sortConfig]);

  // Loading state
  if (showLoadingState) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="animate-pulse bg-white rounded-lg border border-slate-200/75 p-6 space-y-4"
          >
            <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="flex justify-between pt-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Sorting Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white">
                <ArrowUpDown className="h-4 w-4" />
                Sort
                {sortConfig && (
                  <Badge variant="secondary" className="ml-2 font-normal">
                    {sortConfig.field} {sortConfig.direction === 'asc' ? <ArrowUpAZ className="h-3 w-3 inline ml-1" /> : <ArrowDownAZ className="h-3 w-3 inline ml-1" />}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={sortConfig.field} 
                onValueChange={(value) => setSortConfig(prev => ({ ...prev, field: value as any }))}
              >
                <DropdownMenuRadioItem value="date">Created Date</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="customer">Customer Name</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={sortConfig.direction} 
                onValueChange={(value) => setSortConfig(prev => ({ ...prev, direction: value as any }))}
              >
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 bg-blue-600 hover:bg-blue-700">{activeFiltersCount}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Filter Agreements</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Agreement Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.status?.includes('active')}
                  onCheckedChange={() => toggleStatusFilter('active')}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.status?.includes('pending_payment')}
                  onCheckedChange={() => toggleStatusFilter('pending_payment')}
                >
                  Pending Payment
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.status?.includes('closed')}
                  onCheckedChange={() => toggleStatusFilter('closed')}
                >
                  Closed
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Payment Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.paymentStatus?.includes('pending')}
                  onCheckedChange={() => togglePaymentStatusFilter('pending')}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.paymentStatus?.includes('completed')}
                  onCheckedChange={() => togglePaymentStatusFilter('completed')}
                >
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterConfig.paymentStatus?.includes('failed')}
                  onCheckedChange={() => togglePaymentStatusFilter('failed')}
                >
                  Failed
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <div className="p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white">
                <CalendarIcon className="h-4 w-4" />
                Date Range
                {filterConfig.dateRange && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">From</h4>
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    className="rounded-md border"
                    initialFocus
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-sm">To</h4>
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    className="rounded-md border"
                    initialFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setDateFrom(undefined);
                      setDateTo(undefined);
                      setFilterConfig(prev => ({ ...prev, dateRange: undefined }));
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={applyDateFilter}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredAndSortedAgreements.length}</span> of <span className="font-medium">{agreements.length}</span> agreements
        </div>
      </div>

      {/* No results state */}
      {filteredAndSortedAgreements.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium">No matching agreements</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No agreements were found that match your filters. Try adjusting your search criteria or clear the filters.
          </p>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="mt-2"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Agreements List */}
      {filteredAndSortedAgreements.length > 0 && (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredAndSortedAgreements.map((agreement) => (
            <AgreementCard
              key={agreement.id}
              agreement={agreement}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
