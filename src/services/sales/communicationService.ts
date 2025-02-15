
import { supabase } from "@/integrations/supabase/client";

export const communicationService = {
  async getCommunications(leadId: string) {
    const { data, error } = await supabase
      .from("sales_communications")
      .select(`
        *,
        team_member:profiles(full_name)
      `)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addCommunication(leadId: string, content: string) {
    const { error } = await supabase
      .from("sales_communications")
      .insert({
        lead_id: leadId,
        type: "note",
        content,
        status: "completed"
      });

    if (error) throw error;
  }
};
