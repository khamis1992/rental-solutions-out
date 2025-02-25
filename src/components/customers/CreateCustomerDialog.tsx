
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
  const queryClient = useQueryClient();
  
  // Mode: 'onSubmit' means validation only happens on submit
  // ReValidateMode: 'never' means fields won't be revalidated after submission
  const form = useForm({
    mode: 'onSubmit',
    reValidateMode: 'never',
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      driver_license: "",
      id_document_url: "",
      license_document_url: "",
      contract_document_url: "",
      email: "",
      nationality: "",
    },
    // This will prevent any validation from running
    resolver: async (values) => {
      return {
        values,
        errors: {}
      };
    }
  });

  // Direct form submission without validation
  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);
    
    try {
      const newCustomerId = customerId || crypto.randomUUID();
      
      // Clean up phone number - remove any validation formatting
      const cleanedValues = {
        ...values,
        phone_number: values.phone_number?.replace(/[^0-9+]/g, '') || ''
      };
      
      const customerData = {
        id: newCustomerId,
        ...cleanedValues,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending_review',
        document_verification_status: 'pending',
        preferred_communication_channel: 'email',
        welcome_email_sent: false,
        form_data: null
      };

      console.log("Inserting customer with data:", customerData);

      const { error: supabaseError } = await supabase
        .from("profiles")
        .insert(customerData);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw supabaseError;
      }

      setSuccess(true);
      toast.success("Customer created successfully");
      
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      setTimeout(() => {
        form.reset();
        onOpenChange?.(false);
        setCustomerId(null);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <CustomerFormFields 
              form={form} 
              customerId={customerId || undefined}
            />
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
  );
};
