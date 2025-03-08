
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaymentAIRecommendations } from "./PaymentAIRecommendations";
import { Loader2 } from "lucide-react";
import { useInputHandler, useFormSubmitHandler } from "@/hooks/useEventHandlers";

interface SinglePaymentFormProps {
  contractId: string;
  onSuccess: () => void;
  totalInstallments?: number;
}

export function SinglePaymentForm({ contractId, onSuccess, totalInstallments }: SinglePaymentFormProps) {
  // Use standardized input handlers for form fields
  const chequeNumberInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0,
    transform: (value) => value.trim()
  });
  
  const paymentDateInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0
  });
  
  const amountInput = useInputHandler("", {
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    transform: (value) => value.trim()
  });
  
  const draweeBankNameInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0,
    transform: (value) => value.trim()
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form validation state
  const isFormValid = 
    chequeNumberInput.isValid && chequeNumberInput.value.length > 0 &&
    paymentDateInput.isValid && paymentDateInput.value.length > 0 &&
    amountInput.isValid && amountInput.value.length > 0 &&
    draweeBankNameInput.isValid && draweeBankNameInput.value.length > 0;
  
  // Use standardized form submit handler
  const submitHandler = useFormSubmitHandler(
    async () => {
      if (!isFormValid) {
        throw new Error("Please fill in all required fields correctly");
      }

      const { error } = await supabase
        .from("car_installment_payments")
        .insert({
          contract_id: contractId,
          cheque_number: chequeNumberInput.value,
          amount: Number(amountInput.value),
          payment_date: paymentDateInput.value,
          drawee_bank: draweeBankNameInput.value,
          paid_amount: 0,
          remaining_amount: Number(amountInput.value),
          status: "pending"
        });

      if (error) throw error;

      toast.success("Payment installment added successfully");
      onSuccess();
    },
    () => {
      // Success already handled with toast and callback
    },
    (error) => {
      console.error("Error adding payment:", error);
      toast.error(`Failed to add payment installment: ${error.message}`);
    }
  );
  
  // Use standardized form submit handler for analysis
  const analyzeHandler = useFormSubmitHandler(
    async () => {
      if (!chequeNumberInput.value || !paymentDateInput.value || !amountInput.value) {
        throw new Error("Please fill in all fields first");
      }
      
      const { data: suggestions, error } = await supabase.functions.invoke(
        "analyze-payment-installment",
        {
          body: {
            firstChequeNumber: chequeNumberInput.value,
            amount: Number(amountInput.value),
            firstPaymentDate: paymentDateInput.value,
            totalInstallments: totalInstallments || 1
          }
        }
      );

      if (error) throw error;
      setAiSuggestions(suggestions);
    },
    () => {
      // Success handled by setting AI suggestions
    },
    (error) => {
      console.error('Error analyzing payment:', error);
      toast.error(`Failed to analyze payment details: ${error.message}`);
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      submitHandler.handleSubmit(null);
    }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chequeNumber">Cheque Number</Label>
        <Input 
          id="chequeNumber" 
          value={chequeNumberInput.value}
          onChange={chequeNumberInput.handleChange}
          className={!chequeNumberInput.isValid && chequeNumberInput.value ? 'border-red-500' : ''}
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (QAR)</Label>
        <Input 
          id="amount" 
          type="number" 
          step="0.01"
          value={amountInput.value}
          onChange={amountInput.handleChange}
          className={!amountInput.isValid && amountInput.value ? 'border-red-500' : ''}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input 
          id="paymentDate" 
          type="date"
          value={paymentDateInput.value}
          onChange={paymentDateInput.handleChange}
          className={!paymentDateInput.isValid && paymentDateInput.value ? 'border-red-500' : ''}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
        <Input 
          id="draweeBankName" 
          value={draweeBankNameInput.value}
          onChange={draweeBankNameInput.handleChange}
          className={!draweeBankNameInput.isValid && draweeBankNameInput.value ? 'border-red-500' : ''}
          required 
        />
      </div>

      {!aiSuggestions && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => analyzeHandler.handleSubmit(null)}
          disabled={analyzeHandler.isSubmitting || !chequeNumberInput.value || !paymentDateInput.value || !amountInput.value}
        >
          {analyzeHandler.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Payment Details'
          )}
        </Button>
      )}

      {aiSuggestions && (
        <PaymentAIRecommendations
          riskLevel={aiSuggestions.riskAssessment.riskLevel}
          factors={aiSuggestions.riskAssessment.factors}
          recommendations={aiSuggestions.recommendations}
        />
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={submitHandler.isSubmitting || !isFormValid}
      >
        {submitHandler.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Payment...
          </>
        ) : (
          'Add Payment'
        )}
      </Button>
    </form>
  );
}
