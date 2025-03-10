
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { getFirstDayOfMonth, calculateDaysOverdue } from "@/components/reports/utils/pendingPaymentsUtils";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const [rentAmount, setRentAmount] = useState(0);
  const [dailyLateFeeRate, setDailyLateFeeRate] = useState(120);
  const [dueAmount, setDueAmount] = useState(0);
  const [existingLateFee, setExistingLateFee] = useState<any>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Fetch rent amount and calculate late fee
  useEffect(() => {
    const fetchRentAmount = async () => {
      if (!agreementId) {
        console.error("No agreement ID provided");
        return;
      }

      try {
        const { data: lease, error } = await supabase
          .from('leases')
          .select('rent_amount, rent_due_day, daily_late_fee')
          .eq('id', agreementId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (lease?.rent_amount) {
          setRentAmount(Number(lease.rent_amount));
          if (lease.daily_late_fee) {
            setDailyLateFeeRate(Number(lease.daily_late_fee));
          }
        } else {
          console.warn("No rent amount found for agreement:", agreementId);
        }
      } catch (error) {
        console.error("Error fetching rent amount:", error);
        toast.error("Failed to fetch rent amount");
      }
    };

    const fetchExistingLateFee = async () => {
      if (!agreementId) return;
      
      try {
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { data, error } = await supabase
          .from('unified_payments')
          .select('*')
          .eq('lease_id', agreementId)
          .eq('type', 'LATE_PAYMENT_FEE')
          .eq('original_due_date', firstOfMonth.toISOString())
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setExistingLateFee(data);
          setLateFee(data.late_fine_amount || 0);
        } else {
          calculateLateFee();
        }
      } catch (error) {
        console.error("Error fetching existing late fee:", error);
        calculateLateFee();
      }
    };

    const calculateLateFee = () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      if (today > firstOfMonth) {
        const daysLate = Math.floor((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        setLateFee(daysLate * dailyLateFeeRate);
      } else {
        setLateFee(0);
      }
    };

    if (agreementId) {
      fetchRentAmount();
      fetchExistingLateFee();
    }
  }, [agreementId, dailyLateFeeRate]);

  // Update due amount when rent amount or late fee changes
  useEffect(() => {
    setDueAmount(rentAmount + lateFee);
  }, [rentAmount, lateFee]);

  const onSubmit = async (data: any) => {
    if (!agreementId) {
      toast.error("No agreement ID provided");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentAmount = Number(data.amount);
      const balance = dueAmount - paymentAmount;
      
      // Calculate days overdue and late fee based on standardized due date (1st of month)
      const paymentDate = new Date();
      const daysOverdue = calculateDaysOverdue(paymentDate);
      const originalDueDate = getFirstDayOfMonth(paymentDate);
      const lateFineAmount = existingLateFee?.late_fine_amount || (daysOverdue > 0 ? daysOverdue * dailyLateFeeRate : 0);
      
      // Batch operations using transactions
      const { error } = await supabase.rpc('record_payment_with_late_fee', {
        p_lease_id: agreementId,
        p_amount: dueAmount,
        p_amount_paid: paymentAmount,
        p_balance: balance,
        p_payment_method: data.paymentMethod,
        p_description: data.description,
        p_payment_date: paymentDate.toISOString(),
        p_late_fine_amount: lateFineAmount,
        p_days_overdue: daysOverdue,
        p_original_due_date: originalDueDate.toISOString(),
        p_existing_late_fee_id: existingLateFee?.id || null
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!agreementId) {
    return <div>No agreement selected</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-muted p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Due Amount</div>
            <div className="text-lg font-semibold">
              {formatCurrency(dueAmount)}
              <span className="text-sm text-muted-foreground ml-2">
                (Rent: {formatCurrency(rentAmount)} + Late Fee: {formatCurrency(lateFee)})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="amount">Amount Paid (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register("amount", { required: true })}
        />
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="On_hold">On Hold</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add payment notes or description..."
          {...register("description")}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};
