
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

  const isLoading = loadingAgreement || loadingPayments;

  // Generate payment schedule based on agreement details
  const generatePaymentSchedule = () => {
    if (!agreement) return [];
    
    const startDate = new Date(agreement.start_date);
    const endDate = new Date(agreement.end_date);
    const dueDay = agreement.rent_due_day || 1; // Default to 1st if not specified
    
    const schedule = [];
    let currentDate = new Date(startDate);
    
    // Set to the first day of month after start date
    currentDate.setDate(1);
    if (currentDate.getMonth() === startDate.getMonth() && 
        startDate.getDate() > 1) {
      // If we started after the 1st, move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Generate schedule until end date
    while (currentDate <= endDate) {
      // Create payment for current month
      schedule.push({
        id: `${agreementId}-${format(currentDate, 'yyyy-MM')}`,
        dueDate: new Date(currentDate),
        amount: agreement.rent_amount,
        status: determinePaymentStatus(currentDate, payments),
        description: `Rent for ${format(currentDate, 'MMMM yyyy')}`
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return schedule;
  };
  
  // Determine if a payment was made for a specific month
  const determinePaymentStatus = (dueDate: Date, paymentsList: any[] | undefined) => {
    if (!paymentsList || paymentsList.length === 0) return 'pending';
    
    // Check if any payment matches this month
    const dueMonth = dueDate.getMonth();
    const dueYear = dueDate.getFullYear();
    
    const matchingPayment = paymentsList.find(payment => {
      const paymentDate = new Date(payment.payment_date);
      return (
        paymentDate.getMonth() === dueMonth && 
        paymentDate.getFullYear() === dueYear
      );
    });
    
    return matchingPayment ? 'completed' : 'pending';
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
  const getStatusBadge = (status: string, dueDate: Date) => {
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
    }
    
    if (isBefore(dueDate, today) && format(dueDate, 'yyyy-MM') !== format(today, 'yyyy-MM')) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    if (format(dueDate, 'yyyy-MM') === format(today, 'yyyy-MM')) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Due Now</Badge>;
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
            </AlertDescription>
          </Alert>

          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                      {getStatusBadge(payment.status, payment.dueDate)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{payment.description}</span>
                    </TableCell>
                  </TableRow>
                ))}
                
                {pastPayments.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center p-2">
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
