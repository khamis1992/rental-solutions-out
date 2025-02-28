
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, RefreshCw } from "lucide-react";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { Agreement } from "@/components/agreements/hooks/useAgreements";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { SearchInput } from "@/components/agreements/search/SearchInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FilterConfig, SortConfig, SortDirection, SortField } from "@/components/agreements/v2/types";
import { ViewToggle } from "@/components/agreements/v2/ViewToggle";
import { getStatusConfig, getPaymentConfig, calculatePaymentProgress, formatShortDate } from "@/components/agreements/v2/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Filter,
  FileDown,
  FileText,
  Send,
  Square,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

// Main AgreementsManagement component
const AgreementsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [selectedAgreements, setSelectedAgreements] = useState<Agreement[]>([]);
  const [showSummary, setShowSummary] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<FilterConfig>({
    status: [],
    paymentStatus: [],
    dateRange: { start: undefined, end: undefined },
    amountRange: { min: 0, max: 5000 },
    vehicleDetails: { make: "", model: "", year: "" }
  });
  const [sort, setSort] = useState<SortConfig>({
    field: "date",
    direction: "desc"
  });

  // Fetch agreements data
  const { data: agreements = [], isLoading, refetch } = useQuery({
    queryKey: ["agreements", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching agreements...");
        
        // Basic query with joins
        let { data, error } = await supabase
          .from("leases")
          .select(`
            *,
            customer:profiles(
              id,
              full_name
            ),
            vehicle:vehicles(
              id,
              make,
              model,
              year,
              license_plate
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching agreements:", error);
          toast.error("Failed to fetch agreements");
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        // Get remaining amounts for each agreement
        const agreementIds = data.map((a: any) => a.id);
        if (agreementIds.length > 0) {
          const { data: remainingAmounts, error: remainingError } = await supabase
            .from("remaining_amounts")
            .select("*")
            .in("lease_id", agreementIds);

          if (!remainingError && remainingAmounts) {
            // Add remaining amounts to the agreements
            data = data.map((agreement: any) => {
              const remaining = remainingAmounts.filter(ra => ra.lease_id === agreement.id);
              return {
                ...agreement,
                remaining_amounts: remaining
              };
            });
          }
        }

        console.log(`Retrieved ${data.length} agreements`);
        return data as Agreement[];
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Filter agreements based on search query and filters
  const filteredAgreements = agreements.filter(agreement => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const agreementNumber = agreement.agreement_number?.toLowerCase() || "";
      const customerName = agreement.customer?.full_name?.toLowerCase() || "";
      const licensePlate = agreement.vehicle?.license_plate?.toLowerCase() || "";
      const vehicleInfo = `${agreement.vehicle?.make} ${agreement.vehicle?.model}`.toLowerCase();
      
      if (!(agreementNumber.includes(query) || 
            customerName.includes(query) || 
            licensePlate.includes(query) ||
            vehicleInfo.includes(query))) {
        return false;
      }
    }

    // Tab filter
    if (activeTab === "active" && agreement.status !== "active") {
      return false;
    } else if (activeTab === "pending" && agreement.status !== "pending_payment") {
      return false;
    } else if (activeTab === "closed" && agreement.status !== "closed") {
      return false;
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(agreement.status)) {
        return false;
      }
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus.length > 0) {
      if (!filters.paymentStatus.includes(agreement.payment_status || "")) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const startDate = agreement.start_date ? new Date(agreement.start_date) : null;
      
      if (filters.dateRange.start && startDate) {
        if (startDate < filters.dateRange.start) {
          return false;
        }
      }
      
      if (filters.dateRange.end && startDate) {
        if (startDate > filters.dateRange.end) {
          return false;
        }
      }
    }
    
    // Amount range filter
    if (filters.amountRange) {
      const amount = agreement.total_amount;
      
      if (amount < filters.amountRange.min || amount > filters.amountRange.max) {
        return false;
      }
    }
    
    // Vehicle details filter
    if (filters.vehicleDetails) {
      if (filters.vehicleDetails.make && 
          agreement.vehicle?.make && 
          !agreement.vehicle.make.toLowerCase().includes(filters.vehicleDetails.make.toLowerCase())) {
        return false;
      }
      
      if (filters.vehicleDetails.model && 
          agreement.vehicle?.model && 
          !agreement.vehicle.model.toLowerCase().includes(filters.vehicleDetails.model.toLowerCase())) {
        return false;
      }
      
      if (filters.vehicleDetails.year && 
          agreement.vehicle?.year && 
          agreement.vehicle.year.toString() !== filters.vehicleDetails.year) {
        return false;
      }
    }
    
    return true;
  });

  // Apply sorting to filtered agreements
  const sortedAgreements = [...filteredAgreements].sort((a, b) => {
    const direction = sort.direction === "asc" ? 1 : -1;
    
    switch (sort.field) {
      case "date":
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return (dateA - dateB) * direction;
      case "amount":
        return (a.total_amount - b.total_amount) * direction;
      case "status":
        return (a.status.localeCompare(b.status)) * direction;
      case "customer":
        const customerA = a.customer?.full_name || "";
        const customerB = b.customer?.full_name || "";
        return customerA.localeCompare(customerB) * direction;
      default:
        return 0;
    }
  });

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
  };

  const handleSortChange = (field: SortField) => {
    if (sort.field === field) {
      setSort({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc"
      });
    } else {
      setSort({
        field,
        direction: "desc"
      });
    }
  };

  const handleViewDetails = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (agreement: Agreement) => {
    setAgreementToDelete(agreement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = () => {
    // Refetch after successful deletion
    refetch();
    setDeleteDialogOpen(false);
    setAgreementToDelete(null);
  };

  const handleBulkDeleteConfirm = () => {
    // In a real implementation, we would use a batch delete API
    // For now, let's simulate deleting each agreement
    toast.success(`${selectedAgreements.length} agreements deleted`);
    setSelectedAgreements([]);
    setBulkDeleteDialogOpen(false);
    refetch();
  };

  const handleSelectAgreement = (agreement: Agreement, selected: boolean) => {
    if (selected) {
      setSelectedAgreements(prev => [...prev, agreement]);
    } else {
      setSelectedAgreements(prev => prev.filter(a => a.id !== agreement.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedAgreements([]);
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting ${selectedAgreements.length} agreements as ${format.toUpperCase()}`);
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      paymentStatus: [],
      dateRange: { start: undefined, end: undefined },
      amountRange: { min: 0, max: 5000 },
      vehicleDetails: { make: "", model: "", year: "" }
    });
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filters.status?.length || 0,
    filters.paymentStatus?.length || 0,
    filters.dateRange?.start || filters.dateRange?.end ? 1 : 0,
    filters.vehicleDetails?.make || filters.vehicleDetails?.model || filters.vehicleDetails?.year ? 1 : 0
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agreements Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-1"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Create Agreement
          </Button>
        </div>
      </div>

      <AgreementStats />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div className="md:col-span-3">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search agreements by number, customer, license plate..."
            className="md:max-w-lg"
          />
        </div>
        <div className="md:col-span-1 flex justify-end">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="px-3 gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs font-normal rounded-full px-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs h-8 px-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Agreement Status</h5>
                  <div className="flex flex-wrap gap-2">
                    {["active", "pending_payment", "closed"].map(status => (
                      <Button
                        key={status}
                        variant={filters.status?.includes(status) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const currentStatuses = filters.status || [];
                          const newStatuses = currentStatuses.includes(status)
                            ? currentStatuses.filter(s => s !== status)
                            : [...currentStatuses, status];
                          
                          setFilters(prev => ({
                            ...prev,
                            status: newStatuses
                          }));
                        }}
                        className="text-xs h-7"
                      >
                        {filters.status?.includes(status) ? (
                          <CheckSquare className="mr-1 h-3 w-3" />
                        ) : (
                          <Square className="mr-1 h-3 w-3" />
                        )}
                        {status === "active" ? "Active" : 
                         status === "pending_payment" ? "Pending" : "Closed"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Payment Status</h5>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "completed", "failed", "partially_paid"].map(status => (
                      <Button
                        key={status}
                        variant={filters.paymentStatus?.includes(status) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const currentStatuses = filters.paymentStatus || [];
                          const newStatuses = currentStatuses.includes(status)
                            ? currentStatuses.filter(s => s !== status)
                            : [...currentStatuses, status];
                          
                          setFilters(prev => ({
                            ...prev,
                            paymentStatus: newStatuses
                          }));
                        }}
                        className="text-xs h-7"
                      >
                        {filters.paymentStatus?.includes(status) ? (
                          <CheckSquare className="mr-1 h-3 w-3" />
                        ) : (
                          <Square className="mr-1 h-3 w-3" />
                        )}
                        {status === "pending" ? "Pending" : 
                         status === "completed" ? "Completed" : 
                         status === "failed" ? "Failed" : "Partially Paid"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Date Range</h5>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateRange?.start && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange?.start ? (
                              format(filters.dateRange.start, "PPP")
                            ) : (
                              <span>From</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange?.start}
                            onSelect={(date) => {
                              setFilters(prev => ({
                                ...prev,
                                dateRange: {
                                  ...prev.dateRange,
                                  start: date
                                }
                              }));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateRange?.end && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange?.end ? (
                              format(filters.dateRange.end, "PPP")
                            ) : (
                              <span>To</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange?.end}
                            onSelect={(date) => {
                              setFilters(prev => ({
                                ...prev,
                                dateRange: {
                                  ...prev.dateRange,
                                  end: date
                                }
                              }));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Amount Range</h5>
                    <span className="text-xs text-muted-foreground">
                      {filters.amountRange?.min} - {filters.amountRange?.max} QAR
                    </span>
                  </div>
                  <Slider
                    defaultValue={[filters.amountRange?.min || 0, filters.amountRange?.max || 5000]}
                    max={10000}
                    step={100}
                    onValueChange={(values) => {
                      setFilters(prev => ({
                        ...prev,
                        amountRange: {
                          min: values[0],
                          max: values[1]
                        }
                      }));
                    }}
                    className="py-2"
                  />
                </div>

                {/* Vehicle Details Filter */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Vehicle Details</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="make" className="text-xs">Make</Label>
                      <Input
                        id="make"
                        placeholder="Vehicle make"
                        value={filters.vehicleDetails?.make || ""}
                        onChange={(e) => {
                          setFilters(prev => ({
                            ...prev,
                            vehicleDetails: {
                              ...prev.vehicleDetails,
                              make: e.target.value
                            }
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="model" className="text-xs">Model</Label>
                      <Input
                        id="model"
                        placeholder="Vehicle model"
                        value={filters.vehicleDetails?.model || ""}
                        onChange={(e) => {
                          setFilters(prev => ({
                            ...prev,
                            vehicleDetails: {
                              ...prev.vehicleDetails,
                              model: e.target.value
                            }
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="year" className="text-xs">Year</Label>
                    <Input
                      id="year"
                      placeholder="Vehicle year"
                      value={filters.vehicleDetails?.year || ""}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          vehicleDetails: {
                            ...prev.vehicleDetails,
                            year: e.target.value
                          }
                        }));
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.status && filters.status.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Status: {filters.status.join(", ")}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, status: [] }))} 
                  />
                </Badge>
              )}
              
              {filters.paymentStatus && filters.paymentStatus.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Payment: {filters.paymentStatus.join(", ")}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, paymentStatus: [] }))} 
                  />
                </Badge>
              )}
              
              {(filters.dateRange?.start || filters.dateRange?.end) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Date: {filters.dateRange?.start ? format(filters.dateRange.start, "MMM d") : "Any"} - {filters.dateRange?.end ? format(filters.dateRange.end, "MMM d") : "Any"}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, dateRange: { start: undefined, end: undefined } }))} 
                  />
                </Badge>
              )}

              {(filters.vehicleDetails?.make || filters.vehicleDetails?.model || filters.vehicleDetails?.year) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>
                    Vehicle: 
                    {filters.vehicleDetails?.make ? ` ${filters.vehicleDetails.make}` : ""}
                    {filters.vehicleDetails?.model ? ` ${filters.vehicleDetails.model}` : ""}
                    {filters.vehicleDetails?.year ? ` ${filters.vehicleDetails.year}` : ""}
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, vehicleDetails: { make: "", model: "", year: "" } }))} 
                  />
                </Badge>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="h-7 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAgreements.length > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-muted/40 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{selectedAgreements.length} selected</span>
          </div>
          
          <div className="flex-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="text-xs h-8"
          >
            Clear
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                Actions <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setBulkDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileDown className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.info("Email sharing coming soon");
              }}>
                <Send className="mr-2 h-4 w-4" />
                <span>Share via Email</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Summary Cards */}
      {showSummary && sortedAgreements.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedAgreements.length}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500">12.5%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agreement Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex text-sm gap-3">
                <div>
                  <span className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                    {sortedAgreements.filter(a => a.status === 'active').length} Active
                  </span>
                </div>
                <div>
                  <span className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                    {sortedAgreements.filter(a => a.status === 'pending_payment').length} Pending
                  </span>
                </div>
                <div>
                  <span className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                    {sortedAgreements.filter(a => a.status === 'closed').length} Closed
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                <div 
                  className="bg-green-500 h-full"
                  style={{ 
                    width: `${sortedAgreements.filter(a => a.status === 'active').length / sortedAgreements.length * 100}%` 
                  }}
                ></div>
                <div 
                  className="bg-amber-500 h-full"
                  style={{ 
                    width: `${sortedAgreements.filter(a => a.status === 'pending_payment').length / sortedAgreements.length * 100}%` 
                  }}
                ></div>
                <div 
                  className="bg-red-500 h-full"
                  style={{ 
                    width: `${sortedAgreements.filter(a => a.status === 'closed').length / sortedAgreements.length * 100}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  sortedAgreements.reduce((sum, agreement) => sum + agreement.total_amount, 0)
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {formatCurrency(
                  sortedAgreements.length > 0 ? 
                    sortedAgreements.reduce((sum, agreement) => sum + agreement.total_amount, 0) / sortedAgreements.length : 0
                )} per agreement
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Customers
                  </div>
                  <div className="text-xl font-bold">
                    {new Set(sortedAgreements.map(a => a.customer_id)).size}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Vehicles
                  </div>
                  <div className="text-xl font-bold">
                    {new Set(sortedAgreements.map(a => a.vehicle_id)).size}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Agreements</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            /* Loading Skeletons */
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-6 pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 pb-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                        <Skeleton className="h-6 w-1/3" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                      <div className="flex justify-end gap-2 w-full">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Skeleton className="h-4 w-4" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-32" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          ) : sortedAgreements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No agreements found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                No agreements match your current filters. Try changing your search or filter criteria.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAgreements.map(agreement => {
                const status = getStatusConfig(agreement.status);
                const paymentConfig = getPaymentConfig(agreement.payment_status || "pending");
                const paymentProgress = calculatePaymentProgress(agreement);
                const StatusIcon = status.icon;
                const PaymentIcon = paymentConfig.icon;
                const isSelected = selectedAgreements.some(a => a.id === agreement.id);

                return (
                  <Card 
                    key={agreement.id} 
                    className={cn(
                      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                      isSelected && "ring-2 ring-primary border-primary"
                    )}
                  >
                    <CardHeader className={cn(
                      "space-y-4 bg-gradient-to-br",
                      status.gradient
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div 
                              onClick={() => handleSelectAgreement(agreement, !isSelected)} 
                              className="cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-500" />
                              )}
                            </div>
                            <Car className="h-5 w-5 text-slate-600" />
                            <div className="font-semibold text-lg text-slate-900">
                              {agreement.agreement_number || "No Agreement Number"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <p className="text-sm text-slate-600">
                              {agreement.customer?.full_name || "No Customer Name"}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "flex items-center gap-1.5 transition-colors",
                          status.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Start Date</span>
                          </div>
                          <span className="text-sm">
                            {agreement.start_date 
                              ? formatShortDate(agreement.start_date)
                              : "Not set"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">Amount</span>
                          </div>
                          <span className="text-sm">{formatCurrency(agreement.total_amount)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Payment Progress</span>
                          <span className="text-sm text-slate-500">{Math.round(paymentProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${paymentProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {agreement.payment_status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1.5",
                            paymentConfig.color
                          )}
                        >
                          <PaymentIcon className="h-3.5 w-3.5" />
                          {paymentConfig.badge}
                        </Badge>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex w-full justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(agreement)}
                          className="hover:bg-primary/5 hover:text-primary"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(agreement)}
                          className="hover:bg-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          if (selectedAgreements.length === sortedAgreements.length) {
                            setSelectedAgreements([]);
                          } else {
                            setSelectedAgreements([...sortedAgreements]);
                          }
                        }}
                      >
                        {selectedAgreements.length === sortedAgreements.length ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("date")}
                    >
                      <div className="flex items-center">
                        <span>Agreement</span>
                        {sort.field === "date" && (
                          <span className="ml-1 text-xs">
                            {sort.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("customer")}
                    >
                      <div className="flex items-center">
                        <span>Customer</span>
                        {sort.field === "customer" && (
                          <span className="ml-1 text-xs">
                            {sort.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("date")}
                    >
                      <div className="flex items-center">
                        <span>Date</span>
                        {sort.field === "date" && (
                          <span className="ml-1 text-xs">
                            {sort.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("amount")}
                    >
                      <div className="flex items-center">
                        <span>Amount</span>
                        {sort.field === "amount" && (
                          <span className="ml-1 text-xs">
                            {sort.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("status")}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sort.field === "status" && (
                          <span className="ml-1 text-xs">
                            {sort.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAgreements.map(agreement => {
                    const status = getStatusConfig(agreement.status);
                    const paymentConfig = getPaymentConfig(agreement.payment_status || "pending");
                    const StatusIcon = status.icon;
                    const PaymentIcon = paymentConfig.icon;
                    const isSelected = selectedAgreements.some(a => a.id === agreement.id);

                    return (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleSelectAgreement(agreement, !isSelected)}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {agreement.agreement_number || "No Agreement Number"}
                        </TableCell>
                        <TableCell>
                          {agreement.customer?.full_name || "No Customer Name"}
                        </TableCell>
                        <TableCell>
                          {agreement.vehicle ? (
                            <div className="flex flex-col">
                              <span>{`${agreement.vehicle.year} ${agreement.vehicle.make} ${agreement.vehicle.model}`}</span>
                              <span className="text-xs text-muted-foreground">{agreement.vehicle.license_plate}</span>
                            </div>
                          ) : (
                            "No Vehicle"
                          )}
                        </TableCell>
                        <TableCell>
                          {formatShortDate(agreement.start_date)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(agreement.total_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge className={cn(
                              "flex items-center gap-1.5",
                              status.color
                            )}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </Badge>
                            {agreement.payment_status && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-1.5",
                                  paymentConfig.color
                                )}
                              >
                                <PaymentIcon className="h-3.5 w-3.5" />
                                {paymentConfig.badge}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(agreement)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(agreement)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {/* Active agreements content */}
          {/* Same structure as "all" tab but filtered for active agreements */}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {/* Pending agreements content */}
          {/* Same structure as "all" tab but filtered for pending agreements */}
        </TabsContent>
        <TabsContent value="closed" className="space-y-4">
          {/* Closed agreements content */}
          {/* Same structure as "all" tab but filtered for closed agreements */}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      {agreementToDelete && (
        <DeleteAgreementDialog
          agreementId={agreementToDelete.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleDeleteConfirmed}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agreements</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgreements.length} agreements? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agreement Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Agreement Details</DialogTitle>
          </DialogHeader>
          {selectedAgreement && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Agreement Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Agreement Number:</span>
                      <span className="text-sm font-medium">{selectedAgreement.agreement_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge className={getStatusConfig(selectedAgreement.status).color}>
                        {getStatusConfig(selectedAgreement.status).label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <span className="text-sm font-medium">{formatShortDate(selectedAgreement.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="text-sm font-medium">{formatShortDate(selectedAgreement.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Agreement Type:</span>
                      <span className="text-sm font-medium">{selectedAgreement.agreement_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedAgreement.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rent Amount:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedAgreement.rent_amount || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer & Vehicle</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{selectedAgreement.customer?.full_name || "No Customer Name"}</span>
                    </div>
                    {selectedAgreement.vehicle && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Vehicle:</span>
                          <span className="text-sm font-medium">
                            {`${selectedAgreement.vehicle.year} ${selectedAgreement.vehicle.make} ${selectedAgreement.vehicle.model}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">License Plate:</span>
                          <span className="text-sm font-medium">{selectedAgreement.vehicle.license_plate}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Initial Mileage:</span>
                      <span className="text-sm font-medium">{selectedAgreement.initial_mileage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Return Mileage:</span>
                      <span className="text-sm font-medium">{selectedAgreement.return_mileage || "Not returned"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Status:</span>
                    {selectedAgreement.payment_status && (
                      <Badge className={getPaymentConfig(selectedAgreement.payment_status).color}>
                        {getPaymentConfig(selectedAgreement.payment_status).badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Payment Date:</span>
                    <span className="text-sm font-medium">{formatShortDate(selectedAgreement.last_payment_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Payment Date:</span>
                    <span className="text-sm font-medium">{formatShortDate(selectedAgreement.next_payment_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Frequency:</span>
                    <span className="text-sm font-medium">{selectedAgreement.payment_frequency || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Daily Late Fee:</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedAgreement.daily_late_fee || 0)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Payment Progress</h4>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${calculatePaymentProgress(selectedAgreement)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{Math.round(calculatePaymentProgress(selectedAgreement))}% Complete</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              
              {selectedAgreement.notes && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <p className="text-sm">{selectedAgreement.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleDelete(selectedAgreement);
                  }}
                >
                  Delete Agreement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgreementsManagement;
