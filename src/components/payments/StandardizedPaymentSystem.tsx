
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarIcon, 
  Info, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, isAfter, isBefore, parseISO, differenceInDays } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StandardizedPaymentSystemProps {
  agreementId: string;
}

export function StandardizedPaymentSystem({ agreementId }: StandardizedPaymentSystemProps) {
  const [showPastPayments, setShowPastPayments] = useState(false);
  
  // Fetch agreement details
  const { data: agreement, isLoading: loadingAgreement } = useQuery({
    queryKey: ['agreement-payment-details', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          agreement_number,
          rent_amount,
          start_date,
          end_date,
          rent_due_day,
          daily_late_fee,
          customer:profiles!customer_id (
            full_name
          )
        `)
        .eq('id', agreementId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!agreementId
  });

  // Fetch payment schedules
  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['payment-schedules', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('lease_id', agreementId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!agreementId
  });

  // Fetch payment history
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payment-history', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_payments')
        .select('*')
        .eq('lease_id', agreementId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!agreementId
  });

  const isLoading = loadingAgreement || loadingPayments || loadingSchedules;

  // Filter payments by type
  const regularPayments = payments?.filter(p => p.type === 'Income') || [];
  const lateFeePayments = payments?.filter(p => p.type === 'LATE_PAYMENT_FEE') || [];
  
  // Get latest late fee record
  const latestLateFee = lateFeePayments.length > 0 
    ? lateFeePayments.reduce((latest, current) => {
        if (!latest.created_at) return current;
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
      }, lateFeePayments[0])
    : null;

  // Generate payment schedule based on agreement details and payment schedules
  const generatePaymentSchedule = () => {
    if (!agreement || !schedules) return [];
    
    const today = new Date();
    const allSchedules = [...schedules];
    
    // Map payment schedules to display format
    return allSchedules.map(schedule => {
      const dueDate = new Date(schedule.due_date);
      
      // Find matching payment
      const matchingPayment = regularPayments?.find(payment => {
        if (!payment.payment_date) return false;
        const paymentDate = new Date(payment.payment_date);
        const paymentMonth = paymentDate.getMonth();
        const paymentYear = paymentDate.getFullYear();
        const dueMonth = dueDate.getMonth();
        const dueYear = dueDate.getFullYear();
        
        return paymentMonth === dueMonth && paymentYear === dueYear;
      });
      
      // Find matching late fee
      const matchingLateFee = lateFeePayments?.find(payment => {
        if (!payment.original_due_date) return false;
        const originalDueDate = new Date(payment.original_due_date);
        const dueMonth = dueDate.getMonth();
        const dueYear = dueDate.getFullYear();
        const origMonth = originalDueDate.getMonth();
        const origYear = originalDueDate.getFullYear();
        
        return origMonth === dueMonth && origYear === dueYear;
      });
      
      // Determine payment status
      let status = 'pending';
      if (matchingPayment?.status === 'completed') {
        status = 'completed';
      }
      
      return {
        id: schedule.id,
        dueDate,
        amount: schedule.amount,
        status,
        description: schedule.description,
        paymentId: matchingPayment?.id,
        lateFee: matchingLateFee?.late_fine_amount || 0,
        daysOverdue: matchingLateFee?.days_overdue || 0
      };
    });
  };
  
  // Format payment schedule for display
  const paymentSchedule = generatePaymentSchedule();
  const today = new Date();
  
  // Split into future and past payments
  const futurePayments = paymentSchedule.filter(payment => 
    isAfter(payment.dueDate, today) || 
    format(payment.dueDate, 'yyyy-MM') === format(today, 'yyyy-MM')
  );
  
  const pastPayments = paymentSchedule.filter(payment => 
    isBefore(payment.dueDate, today) && 
    format(payment.dueDate, 'yyyy-MM') !== format(today, 'yyyy-MM')
  );
  
  // Get payment status badge
  const getStatusBadge = (status: string, dueDate: Date, lateFee: number) => {
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
    }
    
    if (isBefore(dueDate, today) && format(dueDate, 'yyyy-MM') !== format(today, 'yyyy-MM')) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    if (format(dueDate, 'yyyy-MM') === format(today, 'yyyy-MM')) {
      return lateFee > 0 
        ? <Badge variant="destructive">Late Fee Applied</Badge>
        : <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Due Now</Badge>;
    }
    
    return <Badge variant="outline">Upcoming</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule - 1st of Month Due Date</CardTitle>
          <CardDescription>
            Monthly payment schedule for agreement {agreement?.agreement_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Standardized Payment Schedule</AlertTitle>
            <AlertDescription>
              All payments are due on the 1st of each month. The monthly payment amount is {formatCurrency(agreement?.rent_amount || 0)}.
              {agreement?.daily_late_fee && (
                <span className="block mt-1">Late fee: {formatCurrency(agreement.daily_late_fee)} per day after the 1st.</span>
              )}
            </AlertDescription>
          </Alert>

          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {futurePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(payment.dueDate, 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status, payment.dueDate, payment.lateFee)}
                    </TableCell>
                    <TableCell>
                      {payment.lateFee > 0 ? (
                        <div className="text-destructive">
                          {formatCurrency(payment.lateFee)}
                          <span className="text-xs ml-1">
                            ({payment.daysOverdue} days)
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{payment.description}</span>
                    </TableCell>
                  </TableRow>
                ))}
                
                {pastPayments.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowPastPayments(!showPastPayments)}
                        className="text-xs"
                      >
                        {showPastPayments ? "Hide Past Payments" : "Show Past Payments"}
                        {showPastPayments ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                
                {showPastPayments && pastPayments.map((payment) => (
                  <TableRow key={payment.id} className="bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(payment.dueDate, 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {payment.status === 'completed' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                      ) : (
                        <Badge variant="destructive">Missed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.lateFee > 0 ? (
                        <div className="text-destructive">
                          {formatCurrency(payment.lateFee)}
                          <span className="text-xs ml-1">
                            ({payment.daysOverdue} days)
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{payment.description}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Process Payment</CardTitle>
          <CardDescription>
            Record a payment for this agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentForm agreementId={agreementId} />
        </CardContent>
      </Card>
    </div>
  );
}
