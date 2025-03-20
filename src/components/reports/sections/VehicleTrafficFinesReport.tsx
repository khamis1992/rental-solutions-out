
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Car, ChevronDown, ChevronRight, FileDown, MapPin, RefreshCw, Search, SortAsc, SortDesc } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isValid, parseISO } from "date-fns";
import { fetchVehicleTrafficFinesReport, exportVehicleTrafficFinesToCSV, exportDetailedTrafficFinesToCSV, VehicleTrafficFineReport } from "../utils/trafficFinesReportUtils";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const VehicleTrafficFinesReport = () => {
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof VehicleTrafficFineReport>("totalFines");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());

  // Fetch report data
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["vehicleTrafficFinesReport"],
    queryFn: fetchVehicleTrafficFinesReport,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          <h2 className="text-2xl font-bold">Vehicle Traffic Fines Report</h2>
          <div className="flex gap-4 items-center">
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
              onClick={() => exportVehicleTrafficFinesToCSV(filteredAndSortedData)}
              disabled={isLoading || isRefetching || filteredAndSortedData.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Summary
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => exportDetailedTrafficFinesToCSV(filteredAndSortedData)}
              disabled={isLoading || isRefetching || filteredAndSortedData.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Details
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
                    Array.from({ length:.5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-500">
                        Failed to load data. Please try refreshing the page.
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
      </div>
    </ErrorBoundary>
  );
};
