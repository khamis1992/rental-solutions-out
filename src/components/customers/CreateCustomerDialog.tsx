import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerFormFields } from "./CustomerFormFields";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CreateCustomerDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateCustomerDialog = ({
  children,
  open,
  onOpenChange
}: CreateCustomerDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showContractPrompt, setShowContractPrompt] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      driver_license: "",
      email: "",
      nationality: "",
      id_document_expiry: null,
      license_document_expiry: null
    }
  });

  const validateCustomerData = (values: any) => {
    if (!values.full_name?.trim()) {
      throw new Error("Full name is required");
    }
    if (!values.phone_number?.trim()) {
      throw new Error("Phone number is required");
    }
    if (!values.email?.trim()) {
      throw new Error("Email is required");
    }
    
    // Validate Qatar phone number
    const phonePattern = /^(\+974|974)?[0-9]{8}$/;
    if (!phonePattern.test(values.phone_number.replace(/\s/g, ''))) {
      throw new Error("Invalid Qatar phone number format");
    }
    
    // Validate document expiry dates
    if (values.id_document_expiry && new Date(values.id_document_expiry) < new Date()) {
      throw new Error("ID document is expired");
    }
    if (values.license_document_expiry && new Date(values.license_document_expiry) < new Date()) {
      throw new Error("Driver's license is expired");
    }
    
    return true;
  };

  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);
    
    try {
      // Validate customer data
      validateCustomerData(values);

      // Generate a new UUID for the customer if not already set
      const newCustomerId = customerId || crypto.randomUUID();

      // Prepare the customer data
      const customerData = {
        id: newCustomerId,
        ...values,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending_review',
        document_verification_status: 'pending',
        preferred_communication_channel: 'email',
        welcome_email_sent: false
      };

      const { error: supabaseError } = await supabase
        .from("profiles")
        .insert(customerData);

      if (supabaseError) {
        throw supabaseError;
      }

      // Create onboarding checklist
      const onboardingSteps = [
        "Document Verification",
        "Welcome Email",
        "Initial Contact",
        "Profile Review"
      ];

      const onboardingData = onboardingSteps.map(step => ({
        customer_id: newCustomerId,
        step_name: step,
        completed: false
      }));

      const { error: onboardingError } = await supabase
        .from("customer_onboarding")
        .insert(onboardingData);

      if (onboardingError) {
        console.error("Error creating onboarding checklist:", onboardingError);
      }

      setSuccess(true);
      toast.success("Customer created successfully");

      // Invalidate and refetch customers query
      await queryClient.invalidateQueries({ queryKey: ["customers"] });

      // Store the customer ID and show the contract prompt
      setCustomerId(newCustomerId);
      setShowContractPrompt(true);

    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgreement = () => {
    // Keep dialog states in sync
    setShowContractPrompt(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    // Navigate to create agreement page with customer ID
    if (customerId) {
      navigate(`/agreements/new?customerId=${customerId}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children || (
            <EnhancedButton className="text-slate-50">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </EnhancedButton>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to the system. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomerFormFields form={form} />
              <DialogFooter>
                <EnhancedButton 
                  type="submit" 
                  loading={isLoading}
                  success={success}
                  error={error}
                  loadingText="Creating..."
                  successText="Customer Created!"
                  errorText="Failed to Create"
                >
                  Create Customer
                </EnhancedButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showContractPrompt} onOpenChange={setShowContractPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Agreement</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to create a new agreement for this customer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowContractPrompt(false);
              if (onOpenChange) {
                onOpenChange(false);
              }
            }}>
              Skip for now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateAgreement}>
              Create Agreement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
