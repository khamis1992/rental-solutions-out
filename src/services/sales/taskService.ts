
import { supabase } from "@/integrations/supabase/client";

export const taskService = {
  async getTasks(leadId: string) {
    const { data, error } = await supabase
      .from("sales_tasks")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addTask(leadId: string, title: string) {
    const { error } = await supabase
      .from("sales_tasks")
      .insert({
        lead_id: leadId,
        title,
        status: "pending"
      });

    if (error) throw error;
  },

  async completeTask(taskId: string) {
    const { error } = await supabase
      .from("sales_tasks")
      .update({ status: "completed" })
      .eq("id", taskId);

    if (error) throw error;
  }
};
