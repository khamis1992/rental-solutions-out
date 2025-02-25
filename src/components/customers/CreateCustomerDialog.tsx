
import { useState, ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { UserPlus } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { CustomCustomerFormFields } from "./CustomCustomerFormFields";
import { ContractPromptDialog } from "./ContractPromptDialog";
import { useCreateCustomer } from "./hooks/useCreateCustomer";

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
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showContractPrompt, setShowContractPrompt] = useState(false);

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

  useEffect(() => {
    if (!customerId) {
      setCustomerId(crypto.randomUUID());
    }
  }, []);

  const { isLoading, success, error, createCustomer } = useCreateCustomer(customerId, () => {
    setShowContractPrompt(true);
  });

  const onSubmit = (values: any) => {
    createCustomer(values);
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
              <CustomCustomerFormFields 
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

      <ContractPromptDialog 
        open={showContractPrompt} 
        onOpenChange={setShowContractPrompt}
        customerId={customerId}
        onClose={() => onOpenChange?.(false)}
      />
    </>
  );
};
