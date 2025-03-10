
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Trash2, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LateFineActions } from "./LateFineActions";
import { cn } from "@/lib/utils";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payment-history', agreementId],
    queryFn: async () => {
      try {
        console.log("Fetching payment history for agreement:", agreementId);
        
        const { data, error } = await supabase
          .from('unified_payments')
          .select(`
            id,
            amount,
            amount_paid,
            balance,
            payment_date,
            original_due_date,
            late_fine_amount,
            days_overdue,
            status,
            payment_method,
            description,
            type
          `)
          .eq('lease_id', agreementId)
          .order('payment_date', { ascending: false });

        if (error) {
          console.error("Error fetching payment history:", error);
          throw error;
        }
        
        console.log("Fetched payment data:", data);
        return data || [];
      } catch (err) {
        console.error("Error in payment history query:", err);
        throw err;
      }
    },
    staleTime: 30000, // 30 seconds
  });

  // Group payments by month
  const paymentsByMonth = payments?.reduce((acc, payment) => {
    // Use payment_date for regular payments and original_due_date for late fees
    const date = payment.payment_date ? new Date(payment.payment_date) : 
                 payment.original_due_date ? new Date(payment.original_due_date) : 
                 new Date();
    
    const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        payments: []
      };
    }
    
    acc[monthYear].payments.push(payment);
    return acc;
  }, {} as Record<string, {month: string, year: number, payments: any[]}>);

  const handleDeleteClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPaymentId) return;

    try {
      const { error } = await supabase
        .from("unified_payments")
        .delete()
        .eq("id", selectedPaymentId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        entity_type: 'payment',
        entity_id: selectedPaymentId,
        action: 'delete_payment',
        changes: {
          status: 'deleted'
        }
      });

      toast.success("Payment deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["payment-history", agreementId] });
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPaymentId(null);
    }
  };

  const handleLateFineUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["payment-history", agreementId] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    console.error("Payment history error:", error);
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-md">
        <p className="font-medium">Error loading payment history</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No payment history found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalLateFees = payments.reduce((sum, p) => sum + (p.late_fine_amount || 0), 0);
  
  // Count auto-generated late fee records
  const autoGeneratedCount = payments.filter(p => 
    p.type === 'LATE_PAYMENT_FEE' && 
    p.description?.includes('Auto-generated late payment record')
  ).length;
  
  const historicalPaymentCount = payments.filter(p => 
    p.description?.toLowerCase().includes('historical payment')
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payment History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
              <div className="text-lg font-semibold">
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Late Fines</div>
              <div className="text-lg font-semibold text-destructive">
                {formatCurrency(totalLateFees)}
              </div>
            </div>
          </div>

          {autoGeneratedCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
              <p className="text-amber-700 text-sm">
                <AlertTriangle className="h-4 w-4 inline-block mr-1 text-amber-500" />
                {autoGeneratedCount} auto-generated payment records exist. These represent historical months without payments.
                {historicalPaymentCount > 0 && (
                  <span className="ml-1">{historicalPaymentCount} historical payments have been recorded.</span>
                )}
              </p>
            </div>
          )}

          {/* Payment List By Month */}
          {paymentsByMonth && Object.values(paymentsByMonth)
            .sort((a, b) => {
              // Sort by year descending, then by month descending
              if (a.year !== b.year) return b.year - a.year;
              return new Date(0, b.month).getMonth() - new Date(0, a.month).getMonth();
            })
            .map((monthGroup) => (
              <div key={`${monthGroup.month}-${monthGroup.year}`} className="mb-6">
                <h3 className="text-sm font-semibold bg-muted px-4 py-2 rounded-md mb-3">
                  {monthGroup.month} {monthGroup.year}
                </h3>
                
                <div className="space-y-3">
                  {monthGroup.payments.map((payment) => {
                    const remainingBalance = payment.balance || 0;
                    const paymentStatus = payment.status || (remainingBalance === 0 ? 'completed' : 'pending');
                    
                    // Check if this is a historical payment (by analyzing the description)
                    const isHistoricalPayment = payment.description?.toLowerCase().includes('historical payment');
                    
                    // Check if this is an auto-generated late payment record
                    const isAutoGenerated = payment.description?.includes('Auto-generated late payment record');
                    
                    return (
                      <div
                        key={payment.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors",
                          isHistoricalPayment && "border-blue-200 bg-blue-50 hover:bg-blue-100/50",
                          isAutoGenerated && "border-amber-200 bg-amber-50 hover:bg-amber-100/50"
                        )}
                      >
                        <div>
                          <div className="font-medium flex items-center">
                            {isHistoricalPayment && (
                              <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
                            )}
                            {payment.payment_date ? formatDateToDisplay(new Date(payment.payment_date)) : 'No payment date'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.payment_method} - {payment.description || 'Payment'}
                          </div>
                          {payment.type === 'LATE_PAYMENT_FEE' && (
                            <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                              Late Fee Record
                            </Badge>
                          )}
                          {isHistoricalPayment && (
                            <Badge variant="outline" className="mt-1 ml-1 bg-blue-50 text-blue-700 border-blue-200">
                              Historical Payment
                            </Badge>
                          )}
                          {isAutoGenerated && (
                            <Badge variant="outline" className="mt-1 ml-1 bg-amber-50 text-amber-700 border-amber-200">
                              Auto-Generated
                            </Badge>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div>Due Amount: {formatCurrency(payment.amount)}</div>
                          <div>Amount Paid: {formatCurrency(payment.amount_paid)}</div>
                          {payment.late_fine_amount > 0 && (
                            <div className="text-destructive flex items-center justify-end gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Late Fine: {formatCurrency(payment.late_fine_amount)}</span>
                              {payment.days_overdue > 0 && (
                                <span className="text-sm ml-1">
                                  ({payment.days_overdue} days @ 120 QAR/day)
                                </span>
                              )}
                              <LateFineActions
                                paymentId={payment.id}
                                currentLateFine={payment.late_fine_amount}
                                currentBalance={payment.balance || 0}
                                onUpdate={handleLateFineUpdate}
                              />
                            </div>
                          )}
                          <div className={remainingBalance === 0 ? "text-green-600" : "text-destructive"}>
                            Balance: {formatCurrency(remainingBalance)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={paymentStatus === 'completed' ? 
                                'bg-green-50 text-green-600 border-green-200' : 
                                'bg-yellow-50 text-yellow-600 border-yellow-200'
                              }
                            >
                              {paymentStatus === 'completed' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {paymentStatus === 'completed' ? 'Completed' : 'Pending'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(payment.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
