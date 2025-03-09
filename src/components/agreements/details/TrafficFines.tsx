
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { TrafficFineStatusBadge } from "./components/TrafficFineStatusBadge";
import { fetchTrafficFines } from "./utils/trafficFineUtils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, MapPin, Calendar } from "lucide-react";

interface TrafficFinesProps {
  agreementId: string;
}

export const TrafficFines = ({ agreementId }: TrafficFinesProps) => {
  const queryClient = useQueryClient();
  
  const { data: fines, isLoading, error } = useQuery({
    queryKey: ["traffic-fines", agreementId],
    queryFn: () => fetchTrafficFines(agreementId),
  });

  const handleStatusChange = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .update({ 
          payment_status: 'completed',
          payment_date: new Date().toISOString()
        })
        .eq('id', fineId);

      if (error) throw error;

      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["traffic-fines"] }),
        queryClient.invalidateQueries({ queryKey: ["legal-cases"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-history"] })
      ]);

      toast.success("Traffic fine marked as paid");
    } catch (error) {
      console.error('Error updating traffic fine:', error);
      toast.error("Failed to update traffic fine status");
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.warn(`Invalid date value: ${dateString}`);
        return 'Invalid Date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading traffic fines...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Traffic fines error:", error);
    return (
      <Card>
        <CardContent>
          <div className="p-4 text-destructive bg-destructive/10 rounded-md">
            <p className="font-medium">Error loading traffic fines</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFines = fines?.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;
  const unpaidFines = fines?.filter(fine => fine.payment_status !== 'completed')
    .reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Fines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Fines</div>
              <div className="text-lg font-semibold">{formatCurrency(totalFines)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Unpaid Fines</div>
              <div className="text-lg font-semibold text-destructive">{formatCurrency(unpaidFines)}</div>
            </div>
          </div>
          
          {/* Fines Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Violation #</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines?.map((fine) => (
                  <TableRow key={fine.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(fine.violation_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {fine.fine_type || 'Traffic Violation'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {fine.fine_location || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {fine.violation_number || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(fine.fine_amount)}</TableCell>
                    <TableCell>
                      <TrafficFineStatusBadge status={fine.payment_status} />
                    </TableCell>
                    <TableCell>
                      {fine.payment_status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(fine.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!fines || fines.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">No traffic fines recorded</h3>
                        <p className="text-sm text-muted-foreground">
                          This agreement has no associated traffic fines
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
