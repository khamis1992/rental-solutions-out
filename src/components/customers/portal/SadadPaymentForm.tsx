
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SadadPaymentFormProps {
  customerId: string;
  agreementId: string;
  customerEmail?: string;
  customerPhone?: string;
  amount?: number;
}

export const SadadPaymentForm = ({ 
  customerId, 
  agreementId, 
  customerEmail = "",
  customerPhone = "",
  amount = 0
}: SadadPaymentFormProps) => {
  const [paymentAmount, setPaymentAmount] = useState(amount > 0 ? amount.toString() : "");
  
  const paymentMutation = useMutation({
    mutationFn: async (amount: number) => {
      // In a real implementation, this would communicate with the SADAD API
      // For now, we'll just add the payment to our database directly
      const { data, error } = await supabase
        .from("unified_payments")
        .insert({
          lease_id: agreementId,
          amount: amount,
          amount_paid: amount,
          payment_date: new Date().toISOString(),
          payment_method: "SADAD",
          status: "completed",
          description: "SADAD Online Payment",
          type: "Income"
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Payment submitted successfully!");
      setPaymentAmount(amount > 0 ? amount.toString() : "");
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(paymentAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    paymentMutation.mutate(amountValue);
  };

  return (
    <div>
      {amount > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Recommended payment</p>
          <p className="text-xl font-semibold">{formatCurrency(amount)}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount (SAR)</Label>
          <Input
            id="amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={paymentMutation.isPending}
        >
          {paymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now with SADAD"
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          You will be redirected to the SADAD payment gateway to complete your payment.
        </p>
      </form>
    </div>
  );
};
