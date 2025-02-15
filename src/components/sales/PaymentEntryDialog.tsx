
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentEntryDialogProps {
  agreementId: string;
  onPaymentComplete?: () => void;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  description: string;
}

export const PaymentEntryDialog = ({ agreementId, onPaymentComplete }: PaymentEntryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset } = useForm<PaymentFormData>({
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      description: "Initial payment",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      // Create the payment record
      const { error: paymentError } = await supabase
        .from("unified_payments")
        .insert({
          lease_id: agreementId,
          amount: data.amount,
          amount_paid: data.amount,
          payment_method: data.paymentMethod,
          payment_date: new Date().toISOString(),
          description: data.description,
          status: "completed",
          type: "Income"
        });

      if (paymentError) throw paymentError;

      toast.success("Payment recorded successfully");
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["unified-payments"] });
      
      // Call the completion callback
      onPaymentComplete?.();
      
      // Reset form and close dialog
      reset();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error submitting payment:", error);
      toast.error(error.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Enter Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Initial Payment</DialogTitle>
          <DialogDescription>
            Record the first payment for this agreement
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              {...register("amount", { required: true, min: 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              {...register("paymentMethod")}
              onValueChange={(value) => register("paymentMethod").onChange({ target: { value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Payment description"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting ? "Recording Payment..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
