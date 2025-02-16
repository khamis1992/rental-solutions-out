
import { supabase } from "@/integrations/supabase/client";
import type { SalesLead, LeadProgress } from "@/types/sales.types";

export const leadService = {
  async getLeadDetails(leadId: string) {
    const { data, error } = await supabase
      .from("sales_leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error) throw error;

    // Convert DB response to our frontend type
    return {
      ...data,
      onboarding_progress: data.onboarding_progress as LeadProgress || {
        customer_conversion: false,
        agreement_creation: false,
        initial_payment: false
      }
    } as SalesLead;
  },

  async updateLead(leadId: string, updates: Partial<SalesLead>) {
    // Convert the LeadProgress to a plain object for the database
    const dbUpdates = {
      ...updates,
      onboarding_progress: updates.onboarding_progress ? {
        customer_conversion: updates.onboarding_progress.customer_conversion,
        agreement_creation: updates.onboarding_progress.agreement_creation,
        initial_payment: updates.onboarding_progress.initial_payment
      } : undefined
    };

    const { data, error } = await supabase
      .from("sales_leads")
      .update(dbUpdates)
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw error;

    // Convert response back to frontend type
    return {
      ...data,
      onboarding_progress: data.onboarding_progress as LeadProgress
    } as SalesLead;
  }
};
