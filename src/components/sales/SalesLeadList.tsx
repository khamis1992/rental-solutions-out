
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRightCircle } from "lucide-react";
import { VehicleRecommendations } from "./VehicleRecommendations";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface SalesLead {
  id: string;
  status: string;
  customer: {
    full_name: string;
  };
  lead_score: number;
  preferred_vehicle_type: string;
  budget_range_min: number;
  budget_range_max: number;
  onboarding_date: string | null;
}

export const SalesLeadList = () => {
  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["sales-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select(`
          id,
          status,
          lead_score,
          preferred_vehicle_type,
          budget_range_min,
          budget_range_max,
          onboarding_date,
          customer:customer_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SalesLead[];
    }
  });

  const handleTransferToOnboarding = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("sales_leads")
        .update({
          status: "onboarding",
          onboarding_date: new Date().toISOString()
        })
        .eq("id", leadId);

      if (error) throw error;
      toast.success("Lead transferred to onboarding");
      refetch();
    } catch (error) {
      console.error("Error transferring lead:", error);
      toast.error("Failed to transfer lead to onboarding");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leads?.map(lead => (
        <Card key={lead.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{lead.customer?.full_name || "Unnamed Lead"}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Budget: {formatCurrency(lead.budget_range_min)} - {formatCurrency(lead.budget_range_max)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant={lead.lead_score >= 70 ? "default" : "secondary"} 
                  className="bg-cyan-400 hover:bg-cyan-300"
                >
                  Score: {lead.lead_score}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Preferred: {lead.preferred_vehicle_type || "Any"}
                </p>
                {!lead.onboarding_date && (
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTransferToOnboarding(lead.id)}
                    className="mt-2 bg-primary hover:bg-primary/90 text-white"
                  >
                    <ArrowRightCircle className="h-4 w-4 mr-2" />
                    Transfer to Onboarding
                  </Button>
                )}
                {lead.onboarding_date && (
                  <Badge variant="outline" className="mt-2">
                    In Onboarding
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VehicleRecommendations leadId={lead.id} />
          </CardContent>
        </Card>
      ))}
      {(!leads || leads.length === 0) && (
        <div className="text-center text-muted-foreground py-8">
          No leads available
        </div>
      )}
    </div>
  );
};
