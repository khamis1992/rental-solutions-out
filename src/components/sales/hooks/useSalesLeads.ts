
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead } from "@/types/sales.types";

export const useSalesLeads = () => {
  return useQuery<SalesLead[]>({
    queryKey: ["sales-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our SalesLead type
      return data.map(lead => ({
        ...lead,
        onboarding_progress: lead.onboarding_progress as SalesLead['onboarding_progress']
      })) as SalesLead[];
    },
  });
};
