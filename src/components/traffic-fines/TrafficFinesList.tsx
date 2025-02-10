import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, Calendar, MapPin, Car, AlertTriangle, Activity, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`, {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted/20 rounded animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-12 bg-muted/10 rounded animate-pulse" 
                     style={{ animationDelay: `${i * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const SortableHeader = ({ 
    field, 
    children 
  }: { 
    field: string, 
    children: React.ReactNode 
  }) => (
    <div
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-2 cursor-pointer hover:text-primary transition-colors",
        sortField === field && "text-primary"
      )}
    >
      {children}
      <ArrowUpDown className={cn(
        "h-4 w-4 transition-transform duration-200",
        sortField === field && sortDirection === "desc" && "rotate-180"
      )} />
    </div>
  );

  return (
    <TooltipProvider>
      <Card className="bg-white/50 backdrop-blur-sm border-orange-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/60 group">
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="license_plate">
                        <Car className="h-4 w-4 text-orange-500" />
                        Vehicle
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by vehicle details</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="violation_date">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        Date
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by violation date</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="fine_type">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Fine Type
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by violation type</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="fine_location">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        Location
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by violation location</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="fine_amount">
                        Amount
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by fine amount</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SortableHeader field="payment_status">
                        <Activity className="h-4 w-4 text-orange-500" />
                        Status
                      </SortableHeader>
                    </TooltipTrigger>
                    <TooltipContent>Sort by payment status</TooltipContent>
                  </Tooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines?.map((fine) => (
                <TableRow 
                  key={fine.id} 
                  className="hover:bg-muted/50 transition-colors group relative"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent"
                        onClick={() => copyToClipboard(`${fine.lease?.vehicle?.year} ${fine.lease?.vehicle?.make} ${fine.lease?.vehicle?.model}`, "Vehicle details")}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            {fine.lease?.vehicle?.year} {fine.lease?.vehicle?.make}{" "}
                            {fine.lease?.vehicle?.model}
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {fine.lease?.vehicle?.license_plate}
                          </span>
                        </div>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(fine.violation_date), "PP")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      {fine.fine_type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      {fine.fine_location}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-orange-600">
                    {formatCurrency(fine.fine_amount || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        getStatusBadgeStyle(fine.payment_status),
                        "group-hover:scale-105 transition-all duration-200"
                      )}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {fine.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!fines || fines.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-orange-100 p-3">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="font-semibold">No traffic fines found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </TooltipProvider>
  );
}

export const TrafficFineTable = TrafficFinesList;
