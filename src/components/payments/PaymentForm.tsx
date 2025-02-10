
import { useState } from "react";
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
import { DollarSign, CreditCard, Receipt, Coins, PiggyBank } from "lucide-react";

interface PaymentFormProps {
  agreementId?: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("unified_payments").insert({
        lease_id: agreementId,
        amount: parseFloat(data.amount),
        amount_paid: parseFloat(data.amount),
        balance: 0,
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'completed',
        type: 'Income',
        reconciliation_status: 'pending'
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount" className="flex items-center gap-2 text-[#1A1F2C]">
          <DollarSign className="h-4 w-4 text-[#9b87f5]" />
          Amount (QAR)
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          className="border-[#9b87f5]/20 focus:border-[#9b87f5] transition-colors"
          {...register("amount", { required: true })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod" className="flex items-center gap-2 text-[#1A1F2C]">
          <CreditCard className="h-4 w-4 text-[#9b87f5]" />
          Payment Method
        </Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger className="border-[#9b87f5]/20 focus:border-[#9b87f5] transition-colors">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Cash
            </SelectItem>
            <SelectItem value="WireTransfer">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Wire Transfer
              </div>
            </SelectItem>
            <SelectItem value="Invoice">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoice
              </div>
            </SelectItem>
            <SelectItem value="Deposit">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Deposit
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2 text-[#1A1F2C]">
          <Receipt className="h-4 w-4 text-[#9b87f5]" />
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Add payment notes or description..."
          className="border-[#9b87f5]/20 focus:border-[#9b87f5] transition-colors min-h-[100px]"
          {...register("description")}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white transition-colors"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Add Payment
          </div>
        )}
      </Button>
    </form>
  );
};
