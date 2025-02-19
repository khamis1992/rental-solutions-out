
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgreementType, LeaseStatus } from "@/types/agreement.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export interface AgreementFormData {
  agreementType: AgreementType;
  customerId: string;
  vehicleId: string;
  rentAmount: number;
  agreementDuration: number;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  notes?: string;
  downPayment?: number;
  // Additional customer fields
  nationality?: string;
  drivingLicense?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  // Template fields
  finalPrice?: number;
  agreementNumber?: string;
  templateId?: string;
}

export const useAgreementForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementType, setAgreementType] = useState<AgreementType>("short_term");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AgreementFormData>({
    defaultValues: {
      agreementType: "short_term",
      startDate: new Date().toISOString().split('T')[0],
      agreementDuration: 12,
      dailyLateFee: 120,
    },
    mode: "onChange"
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger,
    reset
  } = form;

  const validateFormData = async (data: AgreementFormData): Promise<boolean> => {
    try {
      if (!data.customerId) {
        toast.error("Please select a customer");
        return false;
      }

      if (!data.vehicleId) {
        toast.error("Please select a vehicle");
        return false;
      }

      if (!data.templateId) {
        toast.error("No template selected");
        return false;
      }

      if (!data.rentAmount || data.rentAmount <= 0) {
        toast.error("Please enter a valid rent amount");
        return false;
      }

      if (!data.agreementDuration || data.agreementDuration <= 0) {
        toast.error("Please enter a valid agreement duration");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Error validating form data");
      return false;
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form data
      const isValid = await validateFormData(data);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      console.log("Form data before submission:", data);

      const { error: supabaseError } = await supabase
        .from('leases')
        .insert({
          agreement_type: data.agreementType,
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          rent_amount: data.rentAmount,
          total_amount: data.rentAmount * data.agreementDuration,
          start_date: data.startDate,
          end_date: data.endDate,
          daily_late_fee: data.dailyLateFee,
          notes: data.notes,
          down_payment: data.downPayment,
          status: 'pending_payment' as LeaseStatus,
          initial_mileage: 0,
          agreement_duration: `${data.agreementDuration} months`,
          template_id: data.templateId
        });

      if (supabaseError) {
        throw supabaseError;
      }

      toast.success("Agreement created successfully");
      
      // Reset form and trigger success callback
      reset();
      onSuccess();

    } catch (error) {
      console.error('Error creating agreement:', error);
      setError(error instanceof Error ? error.message : "Failed to create agreement");
      toast.error(error instanceof Error ? error.message : "Failed to create agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup function
  const cleanup = () => {
    setIsSubmitting(false);
    setError(null);
  };

  // Make sure to clean up when component unmounts
  React.useEffect(() => {
    return () => cleanup();
  }, []);

  return {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    watch,
    setValue,
    errors,
    trigger,
    isValid,
    isDirty,
    reset,
    isSubmitting,
    error,
    cleanup
  };
};
