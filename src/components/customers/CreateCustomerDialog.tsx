
import React, { useState, ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerFormFields } from "./CustomerFormFields";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import type { SalesLead } from "@/types/sales.types";

interface CreateCustomerDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  leadId?: string;
}

interface CustomerFormData {
  full_name: string;
  phone_number: string;
  email?: string;
  address: string;
  driver_license: string;
  id_document_url: string;
  license_document_url: string;
  contract_document_url: string;
  nationality?: string;
}

export const CreateCustomerDialog = ({
  children,
  open,
  onOpenChange,
  leadId
}: CreateCustomerDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormData>({
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      address: "",
      driver_license: "",
      id_document_url: "",
      license_document_url: "",
      contract_document_url: "",
      nationality: ""
    }
  });

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!leadId) return;

      try {
        const { data: lead, error } = await supabase
          .from('sales_leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (error) throw error;

        if (lead) {
          const typedLead = lead as SalesLead;
          form.reset({
            full_name: typedLead.full_name,
            phone_number: typedLead.phone_number,
            email: typedLead.email || "",
            address: "",
            driver_license: "",
            id_document_url: "",
            license_document_url: "",
            contract_document_url: "",
            nationality: ""
          });
        }
      } catch (error: any) {
        console.error('Error fetching lead data:', error);
        toast.error(error.message || "Failed to fetch lead data");
      }
    };

    fetchLeadData();
  }, [leadId, form]);

  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);
    try {
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

      if (leadId) {
        const { error: leadError } = await supabase
          .from('sales_leads')
          .update({
            status: 'onboarding',
            customer_id: newCustomerId,
            onboarding_progress: {
              customer_conversion: true,
              agreement_creation: false,
              initial_payment: false
            }
          })
          .eq('id', leadId);

        if (leadError) throw leadError;

        const { error: eventError } = await supabase
          .from('sales_conversion_events')
          .insert({
            lead_id: leadId,
            event_type: 'customer_conversion',
            metadata: {
              customer_id: newCustomerId,
              conversion_date: new Date().toISOString()
            }
          });

        if (eventError) throw eventError;
      }

      setSuccess(true);
      toast.success("Customer created successfully");

      await queryClient.invalidateQueries({
        queryKey: ["customers"]
      });

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
  );
};
