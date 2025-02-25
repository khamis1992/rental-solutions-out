
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateCustomerData } from "../utils/customerValidation";

export const useCreateCustomer = (customerId: string | null, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

  const createCustomer = async (values: any) => {
    console.log("Starting form submission with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);
    
    try {
      console.log("Validating customer data...");
      validateCustomerData(values);

      const customerData = {
        id: customerId,
        ...values,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending_review',
        document_verification_status: 'pending',
        preferred_communication_channel: 'email',
        welcome_email_sent: false,
        form_data: null
      };

      console.log("Attempting to insert customer data:", customerData);

      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .insert(customerData)
        .select();

      console.log("Supabase insert response - Data:", data, "Error:", supabaseError);

      if (supabaseError) {
        console.error("Detailed Supabase error:", {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code
        });
        throw supabaseError;
      }

      await createOnboardingSteps();

      setSuccess(true);
      toast.success("Customer created successfully");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      onSuccess?.();

    } catch (error: any) {
      console.error("Detailed error in createCustomer:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const createOnboardingSteps = async () => {
    console.log("Creating onboarding steps...");
    const onboardingSteps = [
      "Document Verification",
      "Welcome Email",
      "Initial Contact",
      "Profile Review"
    ];

    const onboardingData = onboardingSteps.map(step => ({
      customer_id: customerId,
      step_name: step,
      completed: false
    }));

    const { error: onboardingError } = await supabase
      .from("customer_onboarding")
      .insert(onboardingData);

    if (onboardingError) {
      console.error("Error creating onboarding checklist:", {
        message: onboardingError.message,
        details: onboardingError.details,
        hint: onboardingError.hint,
        code: onboardingError.code
      });
    }
  };

  return {
    isLoading,
    success,
    error,
    createCustomer
  };
};
