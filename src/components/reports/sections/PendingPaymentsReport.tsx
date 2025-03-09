
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { fetchPendingPaymentsReport, PendingPaymentReport } from "../utils/pendingPaymentsUtils";

export const PendingPaymentsReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof PendingPaymentReport>("total_amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: pendingPayments, isLoading, error } = useQuery({
    queryKey: ["pending-payments-report"],
    queryFn: fetchPendingPaymentsReport,
  });

  // Filter and sort the data
  const filteredData = pendingPayments?.filter(payment => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      payment.agreement_number.toLowerCase().includes(query) ||
      payment.customer_name.toLowerCase().includes(query) ||
      payment.license_plate.toLowerCase().includes(query) ||
      payment.id_number.toLowerCase().includes(query) ||
      payment.phone_number.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    return sortDirection === 'asc' 
      ? aString.localeCompare(bString) 
      : bString.localeCompare(aString);
  }) || [];

  const handleSort = (field: keyof PendingPaymentReport) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCsv = () => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    // Create CSV header
    const headers = [
      "Agreement Number", 
      "Customer Name", 
      "ID Number", 
      "Phone Number", 
      "Pending Rent Amount", 
      "Late Fine Amount", 
      "Traffic Fine Amount", 
      "Total Amount", 
      "License Plate"
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.agreement_number,
        `"${row.customer_name}"`, // Quote names to handle commas
        row.id_number,
        row.phone_number,
        row.pending_rent_amount,
        row.late_fine_amount,
        row.traffic_fine_amount,
        row.total_amount,
        row.license_plate
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully");
  };

  // Calculate totals for the summary section
  const totalPendingRent = filteredData.reduce((sum, item) => sum + item.pending_rent_amount, 0);
  const totalLateFines = filteredData.reduce((sum, item) => sum + item.late_fine_amount, 0);
  const totalTrafficFines = filteredData.reduce((sum, item) => sum + item.traffic_fine_amount, 0);
  const grandTotal = totalPendingRent + totalLateFines + totalTrafficFines;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading pending payments report...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <h3 className="font-semibold mb-2">Error loading report</h3>
            <p>{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6" />
          Pending Payments Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Pending Rent</div>
              <div className="text-2xl font-bold">{formatCurrency(totalPendingRent)}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Late Fines</div>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalLateFines)}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Traffic Fines</div>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalTrafficFines)}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Grand Total</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              placeholder="Search by agreement, customer, ID, license plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as keyof PendingPaymentReport)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_amount">Total Amount</SelectItem>
                <SelectItem value="pending_rent_amount">Pending Rent</SelectItem>
                <SelectItem value="late_fine_amount">Late Fines</SelectItem>
                <SelectItem value="traffic_fine_amount">Traffic Fines</SelectItem>
                <SelectItem value="customer_name">Customer Name</SelectItem>
                <SelectItem value="agreement_number">Agreement Number</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={sortDirection} 
              onValueChange={(value) => setSortDirection(value as "asc" | "desc")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("agreement_number")}
                >
                  Agreement #
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("customer_name")}
                >
                  Customer Name
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("id_number")}
                >
                  ID Number
                </TableHead>
                <TableHead className="font-semibold">Phone Number</TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary text-right"
                  onClick={() => handleSort("pending_rent_amount")}
                >
                  Pending Rent
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary text-right"
                  onClick={() => handleSort("late_fine_amount")}
                >
                  Late Fines
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary text-right"
                  onClick={() => handleSort("traffic_fine_amount")}
                >
                  Traffic Fines
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary text-right"
                  onClick={() => handleSort("total_amount")}
                >
                  Total
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("license_plate")}
                >
                  License Plate
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No pending payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((payment, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{payment.agreement_number}</TableCell>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell>{payment.id_number}</TableCell>
                    <TableCell>{payment.phone_number}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.pending_rent_amount)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(payment.late_fine_amount)}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      {formatCurrency(payment.traffic_fine_amount)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(payment.total_amount)}
                    </TableCell>
                    <TableCell>{payment.license_plate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
