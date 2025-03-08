
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ExistingChequeCheck } from "./ExistingChequeCheck";
import { useInputHandler, useFormSubmitHandler } from "@/hooks/useEventHandlers";

interface BulkPaymentFormProps {
  contractId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const BulkPaymentForm = ({ contractId, onSuccess, onClose }: BulkPaymentFormProps) => {
  // Use our standardized input handlers for each form field
  const chequeNumberInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0,
    transform: (value) => value.trim()
  });
  
  const totalChequesInput = useInputHandler("", {
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0 && num <= 100; // Reasonable limit
    },
    transform: (value) => value.trim()
  });
  
  const amountInput = useInputHandler("", {
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    transform: (value) => value.trim()
  });
  
  const startDateInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0
  });
  
  const draweeBankNameInput = useInputHandler("", {
    validator: (value) => value.trim().length > 0,
    transform: (value) => value.trim()
  });
  
  const [chequeNumbers, setChequeNumbers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Form validation
  const isFormValid = 
    chequeNumberInput.isValid && chequeNumberInput.value.length > 0 &&
    totalChequesInput.isValid && totalChequesInput.value.length > 0 &&
    amountInput.isValid && amountInput.value.length > 0 &&
    startDateInput.isValid && startDateInput.value.length > 0 &&
    draweeBankNameInput.isValid && draweeBankNameInput.value.length > 0;

  // Use our standardized form submit handler
  const submitHandler = useFormSubmitHandler(
    async () => {
      if (!isFormValid) {
        throw new Error("Please fill in all required fields correctly");
      }
      
      console.log("Submitting bulk payments:", {
        firstChequeNumber: chequeNumberInput.value,
        totalCheques: parseInt(totalChequesInput.value),
        amount: parseFloat(amountInput.value),
        startDate: startDateInput.value,
        draweeBankName: draweeBankNameInput.value,
        contractId,
      });

      const { data, error } = await supabase.functions.invoke('create-bulk-payments', {
        body: {
          firstChequeNumber: chequeNumberInput.value,
          totalCheques: parseInt(totalChequesInput.value),
          amount: parseFloat(amountInput.value),
          startDate: startDateInput.value,
          draweeBankName: draweeBankNameInput.value,
          contractId
        }
      });

      if (error) throw error;

      console.log("Bulk payments created:", data);
      
      await queryClient.invalidateQueries({ queryKey: ['car-installment-payments', contractId] });
      
      toast.success("Bulk payments created successfully");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    () => {
      // Success already handled with toast and callbacks
    },
    (error) => {
      console.error("Error creating bulk payments:", error);
      toast.error(`Failed to create bulk payments: ${error.message}`);
    }
  );

  const generateChequeNumbers = () => {
    if (!chequeNumberInput.value || !totalChequesInput.value) return;
    
    const baseNumber = chequeNumberInput.value.replace(/\D/g, '');
    const prefix = chequeNumberInput.value.replace(/\d/g, '');
    const total = parseInt(totalChequesInput.value);
    
    const numbers = Array.from({ length: total }, (_, index) => {
      return `${prefix}${String(Number(baseNumber) + index).padStart(baseNumber.length, '0')}`;
    });
    
    setChequeNumbers(numbers);
  };

  // Reset cheque numbers when inputs change
  useEffect(() => {
    setChequeNumbers([]);
  }, [chequeNumberInput.value, totalChequesInput.value]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      submitHandler.handleSubmit(null);
    }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstChequeNumber">First Cheque Number</Label>
        <Input
          id="firstChequeNumber"
          value={chequeNumberInput.value}
          onChange={chequeNumberInput.handleChange}
          className={!chequeNumberInput.isValid && chequeNumberInput.value ? 'border-red-500' : ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCheques">Total Cheques</Label>
        <Input
          id="totalCheques"
          type="number"
          value={totalChequesInput.value}
          onChange={totalChequesInput.handleChange}
          className={!totalChequesInput.isValid && totalChequesInput.value ? 'border-red-500' : ''}
          required
        />
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={generateChequeNumbers}
        disabled={!chequeNumberInput.value || !totalChequesInput.value || !chequeNumberInput.isValid || !totalChequesInput.isValid}
      >
        Check Existing Cheques
      </Button>

      {chequeNumbers.length > 0 && (
        <ExistingChequeCheck 
          contractId={contractId} 
          chequeNumbers={chequeNumbers} 
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount per Cheque</Label>
        <Input
          id="amount"
          type="number"
          value={amountInput.value}
          onChange={amountInput.handleChange}
          className={!amountInput.isValid && amountInput.value ? 'border-red-500' : ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDateInput.value}
          onChange={startDateInput.handleChange}
          className={!startDateInput.isValid && startDateInput.value ? 'border-red-500' : ''}
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

      <Button 
        type="submit" 
        disabled={submitHandler.isSubmitting || !isFormValid} 
        className="w-full"
      >
        {submitHandler.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Payments...
          </>
        ) : (
          'Create Bulk Payments'
        )}
      </Button>
    </form>
  );
};
