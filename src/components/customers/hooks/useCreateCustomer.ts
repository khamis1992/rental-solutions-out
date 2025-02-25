
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

      if (!customerId) {
        throw new Error("Customer ID is required");
      }

      // Create the customer profile first
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
        creation_status: 'pending',
        form_data: values
      };

      console.log("Attempting to insert customer data:", customerData);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([customerData])
        .select();

      if (profileError) {
        console.error("Profile creation error:", {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw profileError;
      }

      // Queue the onboarding steps creation
      const { error: queueError } = await supabase
        .from("profile_creation_queue")
        .insert([{
          profile_id: customerId,
          operation_type: 'create_onboarding_steps',
          status: 'pending',
          payload: {
            steps: [
              "Document Verification",
              "Welcome Email",
              "Initial Contact",
              "Profile Review"
            ]
          }
        }]);

      if (queueError) {
        console.error("Error queueing onboarding steps:", queueError);
        // Don't throw here - we've already created the profile
        toast.error("Onboarding steps will be created shortly");
      }

      // Update profile status to onboarding
      const { error: statusError } = await supabase
        .from("profiles")
        .update({ creation_status: 'onboarding' })
        .eq('id', customerId);

      if (statusError) {
        console.error("Error updating profile status:", statusError);
      }

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
      
      // Update profile with error status if possible
      if (customerId) {
        await supabase
          .from("profiles")
          .update({ 
            creation_status: 'failed',
            creation_error: error.message
          })
          .eq('id', customerId);
      }

      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    success,
    error,
    createCustomer
  };
};
