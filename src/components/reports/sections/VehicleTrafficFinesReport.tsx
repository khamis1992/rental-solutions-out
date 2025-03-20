import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Car, ChevronDown, ChevronRight, FileDown, FilePdf, Info, MapPin, RefreshCw, Search, SortAsc, SortDesc, Unlink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isValid, parseISO } from "date-fns";
import { fetchVehicleTrafficFinesReport, exportVehicleTrafficFinesToCSV, exportDetailedTrafficFinesToCSV, exportTrafficFinesToPDF, VehicleTrafficFineReport, UnassignedTrafficFine } from "../utils/trafficFinesReportUtils";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export const VehicleTrafficFinesReport = () => {
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof VehicleTrafficFineReport>("totalFines");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
  const [expandedUnassigned, setExpandedUnassigned] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("assigned");

  // Fetch report data with improved error handling
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["vehicleTrafficFinesReport"],
    queryFn: fetchVehicleTrafficFinesReport,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (err) => {
      console.error("Error fetching traffic fines report:", err);
      toast.error("Failed to load traffic fines report. Please try again.");
    }
  });

  // Toggle expand/collapse for a vehicle
  const toggleVehicleExpand = (vehicleId: string) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedVehicles(newExpanded);
  };

  // Toggle expand/collapse for an unassigned fine
  const toggleUnassignedExpand = (fineId: string) => {
    const newExpanded = new Set(expandedUnassigned);
    if (newExpanded.has(fineId)) {
      newExpanded.delete(fineId);
    } else {
      newExpanded.add(fineId);
    }
    setExpandedUnassigned(newExpanded);
  };

  // Handle sorting
  const handleSort = (field: keyof VehicleTrafficFineReport) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Filter and sort data
  const filteredAndSortedData = data?.vehicleReports
    ? data.vehicleReports
        .filter(
          (item) =>
            item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.agreementNumber && item.agreementNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
          const valueA = a[sortField];
          const valueB = b[sortField];

          if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
          }

          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortDirection === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }

          return 0;
        })
    : [];

  // Filter unassigned fines
  const filteredUnassignedFines = data?.unassignedFines?.fines
    ? data.unassignedFines.fines.filter(
        (fine) =>
          (fine.license_plate && fine.license_plate.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (fine.violation_number && fine.violation_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (fine.fine_location && fine.fine_location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Format date function
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid Date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getSortIcon = (field: keyof VehicleTrafficFineReport) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const handleExportPDF = () => {
    if (data) {
      exportTrafficFinesToPDF(data.vehicleReports, data.unassignedFines, data.summary);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          <h2 className="text-2xl font-bold">Vehicle Traffic Fines Report</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, plates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => exportVehicleTrafficFinesToCSV(data?.vehicleReports || [], data?.unassignedFines || { totalFines: 0, fineCount: 0, fines: [] })}
              disabled={isLoading || isRefetching || !data}
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => exportDetailedTrafficFinesToCSV(data?.vehicleReports || [], data?.unassignedFines || { totalFines: 0, fineCount: 0, fines: [] })}
              disabled={isLoading || isRefetching || !data}
            >
              <FileDown className="h-4 w-4" />
              Export Detailed
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportPDF}
              disabled={isLoading || isRefetching || !data}
            >
              <FilePdf className="h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Info alert about traffic fines */}
        <Alert variant="info" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>About Traffic Fines Report</AlertTitle>
          <AlertDescription>
            This report groups traffic fines by vehicle and separates unassigned fines (without a lease agreement).
            The total count may differ from the Traffic Fines Management page, which shows all fines including unassigned ones.
          </AlertDescription>
        </Alert>

        {/* Summary statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Vehicles */}
          <Card>
            <CardContent className="pt-6">
              {isLoading || isRefetching ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.summary.totalVehicles || 0}</div>
                  <div className="text-sm text-muted-foreground">Vehicles with Fines</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Total Fines Count */}
          <Card>
            <CardContent className="pt-6">
              {isLoading || isRefetching ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.summary.totalFines || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Fine Records</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Total Fines Amount */}
          <Card>
            <CardContent className="pt-6">
              {isLoading || isRefetching ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(data?.summary.totalAmount || 0)}</div>
                  <div className="text-sm text-muted-foreground">Total Fine Amount</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pending Amount */}
          <Card>
            <CardContent className="pt-6">
              {isLoading || isRefetching ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{formatCurrency(data?.summary.pendingAmount || 0)}</div>
                  <div className="text-sm text-muted-foreground">Pending Amount</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Completed Amount */}
          <Card>
            <CardContent className="pt-6">
              {isLoading || isRefetching ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(data?.summary.completedAmount || 0)}</div>
                  <div className="text-sm text-muted-foreground">Paid Amount</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unassigned fines counter card */}
        <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
          <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                <Unlink className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium">Unassigned Traffic Fines</h3>
                <p className="text-sm text-muted-foreground">
                  Fines not yet linked to a vehicle or agreement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold">{data?.summary.unassignedFines || 0}</div>
                <div className="text-xs text-muted-foreground">Count</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(data?.summary.unassignedAmount || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for switching between assigned and unassigned fines */}
        <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="assigned" className="gap-2">
              <Car className="h-4 w-4" />
              Assigned Vehicle Fines
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="gap-2">
              <Unlink className="h-4 w-4" />
              Unassigned Fines
              <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200">
                {data?.summary.unassignedFines || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {/* Vehicle traffic fines table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("make")}
                        >
                          <div className="flex items-center gap-1">
                            Vehicle
                            {getSortIcon("make")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("licensePlate")}
                        >
                          <div className="flex items-center gap-1">
                            License Plate
                            {getSortIcon("licensePlate")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("customerName")}
                        >
                          <div className="flex items-center gap-1">
                            Customer
                            {getSortIcon("customerName")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("agreementNumber")}
                        >
                          <div className="flex items-center gap-1">
                            Agreement #
                            {getSortIcon("agreementNumber")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("fineCount")}
                        >
                          <div className="flex items-center gap-1">
                            Fine Count
                            {getSortIcon("fineCount")}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => handleSort("totalFines")}
                        >
                          <div className="flex items-center gap-1">
                            Total Amount
                            {getSortIcon("totalFines")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading || isRefetching ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <AlertTriangle className="h-8 w-8 text-red-500" />
                              <p className="text-red-500 font-medium">Failed to load data. Please try refreshing the page.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="mt-2"
                              >
                                Try Again
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAndSortedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchQuery ? "No matching records found" : "No vehicle traffic fines found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedData.map((report) => (
                          <Collapsible
                            key={report.vehicleId}
                            open={expandedVehicles.has(report.vehicleId)}
                            onOpenChange={() => toggleVehicleExpand(report.vehicleId)}
                            className="w-full"
                          >
                            <TableRow className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toggleVehicleExpand(report.vehicleId)}>
                              <TableCell className="w-10">
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                    {expandedVehicles.has(report.vehicleId) ? 
                                      <ChevronDown className="h-4 w-4" /> : 
                                      <ChevronRight className="h-4 w-4" />
                                    }
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4 text-primary" />
                                  <span>{report.year} {report.make} {report.model}</span>
                                </div>
                              </TableCell>
                              <TableCell>{report.licensePlate}</TableCell>
                              <TableCell>{report.customerName || "N/A"}</TableCell>
                              <TableCell>{report.agreementNumber || "N/A"}</TableCell>
                              <TableCell>{report.fineCount}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(report.totalFines)}
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/30 p-0">
                                  <div className="p-4">
                                    <h4 className="font-semibold mb-2">Traffic Fine Details</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Violation #</TableHead>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Location</TableHead>
                                          <TableHead>Fine Amount</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {report.fines.map((fine) => (
                                          <TableRow key={fine.id}>
                                            <TableCell>{fine.violation_number || "N/A"}</TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDate(fine.violation_date)}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                {fine.fine_type || "Traffic Violation"}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {fine.fine_location || "N/A"}
                                              </div>
                                            </TableCell>
                                            <TableCell>{formatCurrency(fine.fine_amount || 0)}</TableCell>
                                            <TableCell>
                                              <Badge 
                                                variant="secondary"
                                                className={cn(
                                                  getStatusBadgeStyle(fine.payment_status || "pending")
                                                )}
                                              >
                                                {fine.payment_status || "pending"}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-4">
            {/* Unassigned fines table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Violation #</TableHead>
                        <TableHead>Violation Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Fine Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading || isRefetching ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <AlertTriangle className="h-8 w-8 text-red-500" />
                              <p className="text-red-500 font-medium">Failed to load data. Please try refreshing the page.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="mt-2"
                              >
                                Try Again
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUnassignedFines.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchQuery ? "No matching unassigned fines found" : "No unassigned traffic fines found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnassignedFines.map((fine) => (
                          <Collapsible
                            key={fine.id}
                            open={expandedUnassigned.has(fine.id)}
                            onOpenChange={() => toggleUnassignedExpand(fine.id)}
                            className="w-full"
                          >
                            <TableRow 
                              className="hover:bg-muted/50 transition-colors cursor-pointer" 
                              onClick={() => toggleUnassignedExpand(fine.id)}
                            >
                              <TableCell className="w-10">
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                    {expandedUnassigned.has(fine.id) ? 
                                      <ChevronDown className="h-4 w-4" /> : 
                                      <ChevronRight className="h-4 w-4" />
                                    }
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {fine.licensePlateOnly ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Has Plate
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      No Data
                                    </Badge>
                                  )}
                                  {fine.license_plate || "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>{fine.violation_number || "N/A"}</TableCell>
                              <TableCell>{formatDate(fine.violation_date)}</TableCell>
                              <TableCell>{fine.fine_location || "N/A"}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(fine.fine_amount || 0)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  className={cn(
                                    getStatusBadgeStyle(fine.payment_status || "pending")
                                  )}
                                >
                                  {fine.payment_status || "pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/30 p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Fine Details</h4>
                                      <dl className="grid grid-cols-2 gap-2 text-sm">
                                        <dt className="text-muted-foreground">Serial Number:</dt>
                                        <dd>{fine.serial_number || "N/A"}</dd>

                                        <dt className="text-muted-foreground">Violation Type:</dt>
                                        <dd>{fine.fine_type || "N/A"}</dd>

                                        <dt className="text-muted-foreground">Violation Charge:</dt>
                                        <dd>{fine.violation_charge || "N/A"}</dd>

                                        <dt className="text-muted-foreground">Violation Points:</dt>
                                        <dd>{fine.violation_points || "N/A"}</dd>
                                        
                                        <dt className="text-muted-foreground">Created At:</dt>
                                        <dd>{formatDate(fine.created_at || null)}</dd>
                                      </dl>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-900">
                                      <h4 className="text-orange-800 dark:text-orange-400 font-semibold mb-2 flex items-center gap-2">
                                        <Unlink className="h-4 w-4" />
                                        Assignment Information
                                      </h4>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        This fine is not currently assigned to any vehicle or agreement in the system.
                                      </p>
                                      <p className="text-sm">
                                        {fine.licensePlateOnly 
                                          ? "There is a license plate match but no vehicle record found." 
                                          : "No license plate information available for matching."}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};
