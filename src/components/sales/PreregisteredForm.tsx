
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalesLead, CreateLeadInput } from "@/types/sales.types";
import { LeadBasicInfo } from "./form/LeadBasicInfo";
import { VehiclePreferenceFields } from "./form/VehiclePreferenceFields";
import { LeadNotesField } from "./form/LeadNotesField";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone_number: z.string().min(8, "Phone number must be at least 8 characters"),
  nationality: z.string().min(2, "Nationality is required"),
  email: z.string().email("Invalid email address"),
  preferred_vehicle_type: z.string().min(1, "Vehicle type is required"),
  budget_min: z.number().min(1400, "Minimum budget must be at least 1400"),
  budget_max: z.number().optional(),
  notes: z.string().optional(),
});

interface PreregisteredFormProps {
  onLeadCreated: (lead: SalesLead) => void;
}

export function PreregisteredForm({ onLeadCreated }: PreregisteredFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget_min: 1400,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const inputData: CreateLeadInput = {
        ...values,
        status: "new",
        onboarding_progress: {
          initial_payment: false,
          agreement_creation: false,
          customer_conversion: false
        }
      };

      const { data, error } = await supabase
        .from("sales_leads")
        .insert([inputData])
        .select()
        .single();

      if (error) throw error;
      
      onLeadCreated(data as SalesLead);
      form.reset();
      toast.success("Lead created successfully");
    } catch (error) {
      toast.error("Error creating lead");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <LeadBasicInfo form={form} />
        <VehiclePreferenceFields form={form} />
        <LeadNotesField form={form} />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Lead"}
        </Button>
      </form>
    </Form>
  );
}
