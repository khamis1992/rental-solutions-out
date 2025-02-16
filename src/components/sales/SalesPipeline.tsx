import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadDetails } from "./LeadDetails";
import { LeadCommunication } from "./LeadCommunication";
import { LeadTasks } from "./LeadTasks";
import { Loader2 } from "lucide-react";
import type { SalesLead, LeadProgress } from "@/types/sales.types";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const SalesPipeline = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  const { data: onboardingLeads, isLoading, error } = useQuery({
    queryKey: ["onboarding-leads", currentTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .eq("status", "onboarding")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching onboarding leads:", error);
        throw error;
      }

      // Convert the Supabase JSON data to our frontend type with validation
      return (data || []).map(lead => {
        const progress = lead.onboarding_progress as unknown;
        const validatedProgress = isValidLeadProgress(progress)
          ? progress
          : DEFAULT_LEAD_PROGRESS;

        return {
          ...lead,
          onboarding_progress: validatedProgress
        };
      }) as SalesLead[];
    },
    enabled: currentTab === "onboarding"
  });

  if (error) {
    toast.error("Failed to load onboarding leads");
    return (
      <div className="text-center text-red-500 py-8">
        Error loading onboarding leads. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onboardingLeads?.map((lead) => (
        <div key={lead.id} className="space-y-6 animate-fade-in">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <LeadDetails leadId={lead.id} />
            </TabsContent>
            
            <TabsContent value="communication">
              <LeadCommunication leadId={lead.id} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <LeadTasks leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </div>
      ))}
      {(!onboardingLeads || onboardingLeads.length === 0) && (
        <div className="text-center text-muted-foreground py-8">
          No leads in onboarding
        </div>
      )}
    </div>
  );
};

const isValidLeadProgress = (progress: any): progress is LeadProgress => {
  return (
    typeof progress.customer_conversion === "boolean" &&
    typeof progress.agreement_creation === "boolean" &&
    typeof progress.initial_payment === "boolean"
  );
};

const DEFAULT_LEAD_PROGRESS: LeadProgress = {
  customer_conversion: false,
  agreement_creation: false,
  initial_payment: false
};
