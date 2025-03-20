
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileDown, FilePdf } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  fetchVehicleTrafficFinesReport, 
  exportVehicleTrafficFinesToCSV, 
  exportDetailedTrafficFinesToCSV,
  exportTrafficFinesToPDF,
  VehicleTrafficFineReport,
  UnassignedFinesReport,
  VehicleTrafficFineSummary
} from "../utils/trafficFinesReportUtils";

export const VehicleTrafficFinesReport = () => {
  const [activeTab, setActiveTab] = useState<"vehicles" | "unassigned">("vehicles");

  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["traffic-fines-report"],
    queryFn: fetchVehicleTrafficFinesReport,
    meta: {
      errorMessage: "Failed to load traffic fines report"
    }
  });

  const handleExportToCSV = () => {
    if (!data) return;
    if (activeTab === "vehicles") {
      exportVehicleTrafficFinesToCSV(data.vehicleReports, data.unassignedFines);
    } else {
      exportDetailedTrafficFinesToCSV(data.vehicleReports, data.unassignedFines);
    }
  };

  const handleExportToPDF = () => {
    if (!data) return;
    exportTrafficFinesToPDF(data.vehicleReports, data.unassignedFines, data.summary);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-md" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Summary skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Table skeleton */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="border rounded-md">
                <div className="grid grid-cols-5 gap-4 p-4 border-b">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b">
                    {Array(5).fill(0).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Traffic Fines Report</CardTitle>
          <CardDescription>
            Review traffic fines associated with vehicles in your fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load traffic fines report"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Traffic Fines Report</CardTitle>
          <CardDescription>
            Review traffic fines associated with vehicles in your fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>
              No traffic fines data is available at this time
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { vehicleReports, unassignedFines, summary } = data;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between md:space-y-0">
        <div>
          <CardTitle>Vehicle Traffic Fines Report</CardTitle>
          <CardDescription>
            Review traffic fines associated with vehicles in your fleet
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportToCSV} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportToPDF} variant="outline" size="sm">
            <FilePdf className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>About This Report</AlertTitle>
          <AlertDescription>
            This report shows traffic fines associated with vehicles in your fleet. The report is divided into two sections:
            "Assigned" fines (linked to specific vehicles and agreements) and "Unassigned" fines (not yet linked to a specific vehicle/agreement).
            The summary statistics include both assigned and unassigned fines.
          </AlertDescription>
        </Alert>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Total Vehicles with Fines</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.totalVehicles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.totalFines}</div>
              <div className="text-xs text-muted-foreground">
                {summary.unassignedFines} unassigned / {summary.totalFines - summary.unassignedFines} assigned
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(summary.pendingAmount)} pending / {formatCurrency(summary.completedAmount)} completed
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Unassigned Fines Amount</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{formatCurrency(summary.unassignedAmount)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="vehicles" onValueChange={(value) => setActiveTab(value as "vehicles" | "unassigned")}>
          <TabsList>
            <TabsTrigger value="vehicles">Vehicle Fines ({vehicleReports.length})</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned Fines ({unassignedFines.fineCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicles" className="space-y-4">
            {vehicleReports.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Vehicle Fines</AlertTitle>
                <AlertDescription>
                  There are no traffic fines associated with vehicles in your fleet
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Fine Count</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleReports.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId}>
                        <TableCell className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>{vehicle.customerName || "Not Available"}</TableCell>
                        <TableCell className="text-right">{vehicle.fineCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vehicle.totalFines)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unassigned" className="space-y-4">
            {unassignedFines.fineCount === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Unassigned Fines</AlertTitle>
                <AlertDescription>
                  There are no unassigned traffic fines in the system
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Violation #</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedFines.fines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell className="font-medium">
                          {fine.violation_number || "N/A"}
                        </TableCell>
                        <TableCell>
                          {fine.license_plate || "N/A"}
                          {fine.licensePlateOnly && (
                            <Badge variant="outline" className="ml-2">Plate Only</Badge>
                          )}
                        </TableCell>
                        <TableCell>{fine.fine_type || "N/A"}</TableCell>
                        <TableCell>
                          {fine.violation_date 
                            ? new Date(fine.violation_date).toLocaleDateString() 
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(fine.fine_amount || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={fine.payment_status === "completed" ? "outline" : "default"}
                          >
                            {fine.payment_status || "pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
