
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateCustomerDialog } from "../customers/CreateCustomerDialog";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SalesLead } from "@/types/sales.types";

export const SalesPipeline = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');

  // Fetch lead data if leadId is present
  const { data: lead } = useQuery({
    queryKey: ["sales-lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("sales_leads")
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            phone_number,
            email
          )
        `)
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as SalesLead;
    },
    enabled: !!leadId
  });

  const handleCreateAgreement = () => {
    // If we have lead data, pass it to the agreement creation page
    if (lead && lead.customer_id) {
      navigate(`/agreements/new?customerId=${lead.customer_id}&leadId=${lead.id}`);
    } else {
      navigate("/agreements/new");
    }
  };

  const onboardingStages = [
    {
      title: "Convert Lead to Customer",
      description: "Transform qualified leads into customers by completing their profile",
      icon: <UserPlus className="h-6 w-6 text-primary" />,
      action: leadId ? <CreateCustomerDialog leadId={leadId} /> : null,
      completed: lead?.onboarding_progress?.customer_conversion
    },
    {
      title: "Create Agreement",
      description: "Set up a new rental or lease-to-own agreement",
      icon: <FileText className="h-6 w-6 text-primary" />,
      action: handleCreateAgreement,
      completed: lead?.onboarding_progress?.agreement_creation,
      disabled: !lead?.customer_id
    },
    {
      title: "Enter First Payment",
      description: "Record the initial payment for the agreement",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      action: () => navigate("/finance"),
      completed: lead?.onboarding_progress?.initial_payment,
      disabled: !lead?.onboarding_progress?.agreement_creation
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {onboardingStages.map((stage, index) => (
        <Card 
          key={index} 
          className={`relative overflow-hidden transition-all hover:shadow-md ${
            stage.completed ? "border-green-500" : ""
          }`}
        >
          <div className={`absolute top-0 left-0 w-1 h-full ${
            stage.completed ? "bg-green-500" : "bg-primary"
          }`} />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stage.completed ? "bg-green-500/10" : "bg-primary/10"
              }`}>
                {stage.icon}
              </div>
              <CardTitle className="text-lg font-medium">{stage.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {stage.description}
            </p>
            {stage.action && (
              typeof stage.action === 'function' ? (
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary hover:text-white transition-colors"
                  onClick={stage.action}
                  disabled={stage.disabled}
                >
                  Get Started
                </Button>
              ) : (
                stage.action
              )
            )}
            {stage.completed && (
              <Badge variant="default" className="w-full justify-center bg-green-500">
                Completed
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
