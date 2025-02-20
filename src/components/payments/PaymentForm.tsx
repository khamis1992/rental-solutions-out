
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";

interface PaymentFormProps {
  agreementId: string;
  onComplete?: () => void;
}

export const PaymentForm = ({ agreementId, onComplete }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const [rentAmount, setRentAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [isSecurityDeposit, setIsSecurityDeposit] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Fetch rent amount and calculate late fee
  useEffect(() => {
    const fetchRentAmount = async () => {
      if (!agreementId) return;

      try {
        const { data: lease, error } = await supabase
          .from('leases')
          .select('rent_amount')
          .eq('id', agreementId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (lease?.rent_amount) {
          setRentAmount(Number(lease.rent_amount));
        }
      } catch (error) {
        console.error("Error fetching rent amount:", error);
        toast.error("Failed to fetch rent amount");
      }
    };

    const calculateLateFee = () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      if (today > firstOfMonth) {
        const daysLate = Math.floor((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        setLateFee(daysLate * 120); // 120 QAR per day
      } else {
        setLateFee(0);
      }
    };

    fetchRentAmount();
    calculateLateFee();
  }, [agreementId]);

  // Update due amount when rent amount or late fee changes
  useEffect(() => {
    setDueAmount(rentAmount + lateFee);
  }, [rentAmount, lateFee]);

  const generateReceipt = async (paymentId: string) => {
    setIsGeneratingReceipt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { paymentId }
      });

      if (error) throw error;

      // Create a blob from the PDF data and download it
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!agreementId) {
      toast.error("No agreement ID provided");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentAmount = Number(data.amount);
      const balance = dueAmount - paymentAmount;

      if (isSecurityDeposit) {
        // Create security deposit record
        const { data: deposit, error: depositError } = await supabase
          .from("security_deposits")
          .insert({
            lease_id: agreementId,
            amount: paymentAmount,
            status: 'completed',
            notes: data.description
          })
          .select()
          .single();

        if (depositError) throw depositError;

        // Create payment record linked to security deposit
        const { error: paymentError } = await supabase
          .from("unified_payments")
          .insert({
            lease_id: agreementId,
            amount: paymentAmount,
            amount_paid: paymentAmount,
            balance: 0,
            payment_method: data.paymentMethod,
            description: `Security Deposit - ${data.description || ''}`,
            payment_date: new Date().toISOString(),
            status: 'completed',
            type: 'Security_Deposit',
            security_deposit_id: deposit.id
          });

        if (paymentError) throw paymentError;
      } else {
        // Regular payment
        const { data: payment, error } = await supabase
          .from("unified_payments")
          .insert({
            lease_id: agreementId,
            amount: dueAmount,
            amount_paid: paymentAmount,
            balance: balance,
            payment_method: data.paymentMethod,
            description: data.description,
            payment_date: new Date().toISOString(),
            status: 'completed',
            type: 'Income',
            late_fine_amount: lateFee,
            days_overdue: Math.floor(lateFee / 120)
          })
          .select()
          .single();

        if (error) throw error;

        // Generate receipt
        await generateReceipt(payment.id);
      }

      toast.success("Payment processed successfully");
      reset();
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      await queryClient.invalidateQueries({ queryKey: ['security-deposits'] });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
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
              {!isSecurityDeposit && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Rent: {formatCurrency(rentAmount)} + Late Fee: {formatCurrency(lateFee)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isSecurityDeposit"
          checked={isSecurityDeposit}
          onCheckedChange={(checked) => {
            setIsSecurityDeposit(checked as boolean);
            if (checked) {
              setLateFee(0);
              setDueAmount(0);
            } else {
              setDueAmount(rentAmount + lateFee);
            }
          }}
        />
        <Label htmlFor="isSecurityDeposit">This is a security deposit</Label>
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
            <SelectItem value="Cheque">Cheque</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
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
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Process Payment"
        )}
      </Button>
    </form>
  );
};
