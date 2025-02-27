
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { PaymentHistoryView } from "@/types/database/payment.types";

interface PaymentHistoryProps {
  customerId: string;
  agreementId?: string; // Optional, to filter by specific agreement
}

export const PaymentHistory = ({ customerId, agreementId }: PaymentHistoryProps) => {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['customer-payment-history', customerId, agreementId],
    queryFn: async () => {
      try {
        // Start with a base query
        let query = supabase
          .from('payment_history_view')
          .select(`
            id,
            amount,
            amount_paid,
            balance,
            actual_payment_date,
            original_due_date,
            late_fine_amount,
            days_overdue,
            status,
            payment_method,
            description,
            type,
            agreement_number
          `)
          .eq('customer_id', customerId);
        
        // Add agreement filter if provided
        if (agreementId) {
          query = query.eq('lease_id', agreementId);
        }
        
        // Execute the query
        const { data, error } = await query.order('actual_payment_date', { ascending: false });

        if (error) throw error;
        return (data || []) as PaymentHistoryView[];
      } catch (err) {
        console.error("Error fetching payment history:", err);
        throw err;
      }
    },
  });

  // Calculate totals
  const totals = payments?.reduce((acc, payment) => ({
    totalPaid: acc.totalPaid + (payment.amount_paid || 0),
    totalLateFees: acc.totalLateFees + (payment.late_fine_amount || 0),
  }), { totalPaid: 0, totalLateFees: 0 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading payment history</p>
            <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Payment Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Total Amount Paid</div>
            <div className="text-lg font-semibold">{formatCurrency(totals?.totalPaid || 0)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Late Fees</div>
            <div className="text-lg font-semibold text-destructive">
              {formatCurrency(totals?.totalLateFees || 0)}
            </div>
          </div>
        </div>

        {/* Payment List */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Agreement</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Late Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.actual_payment_date ? 
                      formatDateToDisplay(new Date(payment.actual_payment_date)) : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>{payment.agreement_number || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 'secondary'}
                      className={payment.status === 'completed' ? 
                        'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.late_fine_amount > 0 ? (
                      <span className="text-destructive">
                        {formatCurrency(payment.late_fine_amount)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No payment history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
