
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  PendingPaymentReport, 
  fetchPendingPaymentsReport,
  exportPendingPaymentsToCSV,
  formatFinancialValue
} from "../utils/pendingPaymentsUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileDown, RefreshCw, Search, SortAsc, SortDesc, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extracted component for summary cards to reduce complexity
const SummaryCard = ({ title, amount, isLoading }: { title: string; amount: number; isLoading: boolean }) => (
  <Card>
    <CardHeader className="py-3">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          `QAR ${amount.toLocaleString()}`
        )}
      </div>
    </CardContent>
  </Card>
);

// Extracted component for error display
const ErrorDisplay = ({ error }: { error: Error | null }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading pending payments</AlertTitle>
      <AlertDescription>
        {error.message || 'An unexpected error occurred. Please try again or contact support.'}
      </AlertDescription>
    </Alert>
  );
};

export const PendingPaymentsReport = () => {
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof PendingPaymentReport>("total_amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch report data with retry configuration
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["pendingPaymentsReport"],
    queryFn: fetchPendingPaymentsReport,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Increased retries for resilience
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Effect to show toast on error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load pending payments report", {
        description: "Please try again or contact support if the issue persists.",
        duration: 5000,
      });
      console.error("Report error details:", error);
    }
  }, [error]);

  // Handle sorting
  const handleSort = (field: keyof PendingPaymentReport) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: "Refreshing data...",
      success: "Data refreshed successfully",
      error: "Failed to refresh data"
    });
  };

  // Filter and sort data
  const filteredAndSortedData = data
    ? data
        .filter(
          (item) =>
            item.agreement_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Calculate summary statistics
  const summary = filteredAndSortedData.reduce(
    (acc, item) => {
      acc.totalPendingRent += item.pending_rent_amount;
      acc.totalLateFines += item.late_fine_amount;
      acc.totalTrafficFines += item.traffic_fine_amount;
      acc.grandTotal += item.total_amount;
      return acc;
    },
    {
      totalPendingRent: 0,
      totalLateFines: 0,
      totalTrafficFines: 0,
      grandTotal: 0,
    }
  );

  // Handle export
  const handleExport = () => {
    if (filteredAndSortedData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      exportPendingPaymentsToCSV(filteredAndSortedData);
      toast.success("Report exported to CSV");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data");
    }
  };

  const getSortIcon = (field: keyof PendingPaymentReport) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          <h2 className="text-2xl font-bold">Pending Payments Report</h2>
          <div className="flex gap-4 items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
              disabled={isLoading || isRefetching || filteredAndSortedData.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export
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

        {error && <ErrorDisplay error={error instanceof Error ? error : new Error(String(error))} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            title="Pending Rent" 
            amount={summary.totalPendingRent} 
            isLoading={isLoading || isRefetching} 
          />
          
          <SummaryCard 
            title="Late Fines" 
            amount={summary.totalLateFines} 
            isLoading={isLoading || isRefetching} 
          />
          
          <SummaryCard 
            title="Traffic Fines" 
            amount={summary.totalTrafficFines} 
            isLoading={isLoading || isRefetching} 
          />
          
          <SummaryCard 
            title="Total Due" 
            amount={summary.grandTotal} 
            isLoading={isLoading || isRefetching} 
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("agreement_number")}
                    >
                      <div className="flex items-center gap-1">
                        Agreement No.
                        {getSortIcon("agreement_number")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("customer_name")}
                    >
                      <div className="flex items-center gap-1">
                        Customer Name
                        {getSortIcon("customer_name")}
                      </div>
                    </TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("pending_rent_amount")}
                    >
                      <div className="flex items-center gap-1">
                        Pending Rent
                        {getSortIcon("pending_rent_amount")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("late_fine_amount")}
                    >
                      <div className="flex items-center gap-1">
                        Late Fines
                        {getSortIcon("late_fine_amount")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("traffic_fine_amount")}
                    >
                      <div className="flex items-center gap-1">
                        Traffic Fines
                        {getSortIcon("traffic_fine_amount")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("total_amount")}
                    >
                      <div className="flex items-center gap-1">
                        Total Amount
                        {getSortIcon("total_amount")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("license_plate")}
                    >
                      <div className="flex items-center gap-1">
                        License Plate
                        {getSortIcon("license_plate")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || isRefetching ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-red-500">
                        Failed to load data. Please try refreshing the page.
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {searchQuery ? "No matching records found" : "No pending payments found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((item, index) => (
                      <TableRow key={`${item.agreement_number}-${index}`}>
                        <TableCell>{item.agreement_number}</TableCell>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>{item.id_number}</TableCell>
                        <TableCell>{item.phone_number}</TableCell>
                        <TableCell>
                          {item.pending_rent_amount > 0 ? (
                            <span className="font-medium">
                              QAR {item.pending_rent_amount.toLocaleString()}
                            </span>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.late_fine_amount > 0 ? (
                            <span className="font-medium text-amber-600">
                              QAR {item.late_fine_amount.toLocaleString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {item.traffic_fine_amount > 0 ? (
                            <span className="font-medium text-red-600">
                              QAR {item.traffic_fine_amount.toLocaleString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="font-bold">
                          QAR {item.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.license_plate}</TableCell>
                      </TableRow>
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
