
import { supabase } from "@/integrations/supabase/client";
import type { SalesLead, LeadProgress } from "@/types/sales.types";

// Type guard to validate LeadProgress shape
function isValidLeadProgress(obj: any): obj is LeadProgress {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.customer_conversion === 'boolean' &&
    typeof obj.agreement_creation === 'boolean' &&
    typeof obj.initial_payment === 'boolean'
  );
}

const DEFAULT_LEAD_PROGRESS: LeadProgress = {
  customer_conversion: false,
  agreement_creation: false,
  initial_payment: false
};

export const leadService = {
  async getLeadDetails(leadId: string) {
    const { data, error } = await supabase
      .from("sales_leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error) throw error;

    // Convert DB response to our frontend type with proper type checking
    const progress = data.onboarding_progress as unknown;
    const validatedProgress = isValidLeadProgress(progress) 
      ? progress 
      : DEFAULT_LEAD_PROGRESS;

    return {
      ...data,
      onboarding_progress: validatedProgress
    } as SalesLead;
  },

  async updateLead(leadId: string, updates: Partial<SalesLead>) {
    // Convert the LeadProgress to a plain object for the database
    const dbUpdates = {
      ...updates,
      onboarding_progress: updates.onboarding_progress 
        ? {
            customer_conversion: updates.onboarding_progress.customer_conversion,
            agreement_creation: updates.onboarding_progress.agreement_creation,
            initial_payment: updates.onboarding_progress.initial_payment
          }
        : undefined
    };

    const { data, error } = await supabase
      .from("sales_leads")
      .update(dbUpdates)
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw error;

    // Convert response back to frontend type with validation
    const progress = data.onboarding_progress as unknown;
    const validatedProgress = isValidLeadProgress(progress)
      ? progress
      : DEFAULT_LEAD_PROGRESS;

    return {
      ...data,
      onboarding_progress: validatedProgress
    } as SalesLead;
  }
};
