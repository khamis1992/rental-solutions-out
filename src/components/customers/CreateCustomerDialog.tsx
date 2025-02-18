
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
import { Button } from "@/components/ui/button";
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
      id_document_url: "",
      license_document_url: "",
      nationality: "",
      email: "",
    }
  });

  const validateCustomerData = (values: any) => {
    const requiredFields = ['full_name', 'phone_number', 'address', 'driver_license', 'nationality'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.replace('_', ' ')).join(', ');
      throw new Error(`Required fields missing: ${fieldNames}`);
    }
  };

  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);

    try {
      validateCustomerData(values);
      const newCustomerId = customerId || crypto.randomUUID();
      
      const customerData = {
        id: newCustomerId,
        ...values,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending_review'
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
      setCustomerId(newCustomerId);
      setShowContractPrompt(true);

      await queryClient.invalidateQueries({
        queryKey: ["customers"]
      });

    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = () => {
    if (customerId) {
      navigate(`/agreements/new?customerId=${customerId}`);
      onOpenChange?.(false);
    }
  };

  const handleSkip = () => {
    form.reset();
    setShowContractPrompt(false);
    onOpenChange?.(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children || <EnhancedButton className="text-slate-50">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
          </EnhancedButton>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to the system. Fill in all required fields.
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
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={handleSkip}>
              Skip for now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateContract}>
              Create Agreement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
