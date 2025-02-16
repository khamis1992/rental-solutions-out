
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalesLead } from "@/types/sales.types";
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

interface EditLeadDialogProps {
  lead: SalesLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: (lead: SalesLead) => void;
}

export function EditLeadDialog({ lead, open, onOpenChange, onLeadUpdated }: EditLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: lead.full_name,
      phone_number: lead.phone_number || "",
      nationality: lead.nationality || "",
      email: lead.email || "",
      preferred_vehicle_type: lead.preferred_vehicle_type || "",
      budget_min: lead.budget_min,
      budget_max: lead.budget_max || undefined,
      notes: lead.notes || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .update(values)
        .eq('id', lead.id)
        .select()
        .single();

      if (error) throw error;
      
      onLeadUpdated(data as SalesLead);
      onOpenChange(false);
      toast.success("Lead updated successfully");
    } catch (error) {
      toast.error("Error updating lead");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LeadBasicInfo form={form} />
            <VehiclePreferenceFields form={form} />
            <LeadNotesField form={form} />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
