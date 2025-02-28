
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface PaymentHistoryProps {
  customerId: string;
  agreementId?: string; // Optional, to filter by specific agreement
}

export const PaymentHistory = ({ customerId, agreementId }: PaymentHistoryProps) => {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['customer-payment-history', customerId, agreementId],
    queryFn: async () => {
      try {
        // If we have both customerId and agreementId, we can query directly
        if (agreementId) {
          const { data, error } = await supabase
            .from('unified_payments')
            .select('*')
            .eq('lease_id', agreementId)
            .order('payment_date', { ascending: false });
            
          if (error) throw error;
          return data || [];
        }
        
        // Otherwise we need to first get all leases for this customer
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('id')
          .eq('customer_id', customerId);
          
        if (leaseError) throw leaseError;
        
        if (!leases || leases.length === 0) {
          return [];
        }
        
        // Now get payments for all of these leases
        const leaseIds = leases.map(lease => lease.id);
        const { data, error } = await supabase
          .from('unified_payments')
          .select('*')
          .in('lease_id', leaseIds)
          .order('payment_date', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching payment history:", err);
        throw err;
      }
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    console.error("Payment history error:", error);
    return (
      <div className="text-center py-6 text-destructive">
        Error loading payment history
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No payment history found
      </div>
    );
  }

  // Helper to format dates safely
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (e) {
      console.error("Date format error:", e);
      return "Invalid date";
    }
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.payment_date ? 
                  formatDate(payment.payment_date) : 
                  "N/A"}
              </TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {payment.payment_method || "N/A"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  payment.status === "completed" ? "success" :
                  payment.status === "pending" ? "warning" :
                  "secondary"
                }>
                  {payment.status || "Unknown"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
