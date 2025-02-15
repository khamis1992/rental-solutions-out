
import { supabase } from "@/integrations/supabase/client";
import type { SalesLead } from "@/types/sales.types";

export const leadService = {
  async getLeads() {
    const { data, error } = await supabase
      .from("sales_leads")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getLeadDetails(leadId: string) {
    const { data, error } = await supabase
      .from("sales_leads")
      .select(`
        *,
        assigned_to:profiles(full_name),
        communications:sales_communications(*)
      `)
      .eq("id", leadId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateLead(leadId: string, updates: Partial<SalesLead>) {
    const { data, error } = await supabase
      .from("sales_leads")
      .update(updates)
      .eq("id", leadId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
