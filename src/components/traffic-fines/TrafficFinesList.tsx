
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, Calendar, MapPin, Car, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TrafficFineListProps {
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

export function TrafficFinesList({ searchQuery, statusFilter, sortField, sortDirection, onSort }: TrafficFineListProps) {
  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines", searchQuery, statusFilter, sortField, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from("traffic_fines")
        .select(`
          *,
          lease:leases(
            customer_id,
            vehicle:vehicles(
              make,
              model,
              year,
              license_plate
            )
          )
        `);

      if (searchQuery) {
        query = query.or(`license_plate.ilike.%${searchQuery}%,violation_number.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter);
      }

      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching traffic fines:", error);
        throw error;
      }

      return data;
    },
  });

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-white/50 backdrop-blur-sm border-orange-500/20">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/60">
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-orange-500" />
                    Vehicle
                  </TooltipTrigger>
                  <TooltipContent>Vehicle details</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => onSort("violation_date")}
                    >
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Sort by date</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Fine Type
                  </TooltipTrigger>
                  <TooltipContent>Type of violation</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Location
                  </TooltipTrigger>
                  <TooltipContent>Violation location</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    Amount
                  </TooltipTrigger>
                  <TooltipContent>Fine amount</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    Status
                  </TooltipTrigger>
                  <TooltipContent>Payment status</TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines?.map((fine) => (
              <TableRow key={fine.id} className="hover:bg-muted/50 transition-colors group">
                <TableCell className="font-medium">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => copyToClipboard(`${fine.lease?.vehicle?.year} ${fine.lease?.vehicle?.make} ${fine.lease?.vehicle?.model}`)}
                  >
                    {fine.lease?.vehicle?.year} {fine.lease?.vehicle?.make}{" "}
                    {fine.lease?.vehicle?.model}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {fine.lease?.vehicle?.license_plate}
                    </span>
                  </Button>
                </TableCell>
                <TableCell>{format(new Date(fine.violation_date), "PP")}</TableCell>
                <TableCell>{fine.fine_type}</TableCell>
                <TableCell>{fine.fine_location}</TableCell>
                <TableCell className="font-semibold text-orange-600">{formatCurrency(fine.fine_amount || 0)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusBadgeStyle(fine.payment_status)} group-hover:scale-105 transition-transform`}
                  >
                    {fine.payment_status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!fines || fines.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    No traffic fines found
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </TooltipProvider>
  );
}

// Make sure we're exporting the component with both names for backward compatibility
export const TrafficFineTable = TrafficFinesList;
