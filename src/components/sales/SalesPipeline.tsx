
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateCustomerDialog } from "../customers/CreateCustomerDialog";
import { useSearchParams } from "react-router-dom";

export const SalesPipeline = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');

  const onboardingStages = [
    {
      title: "Convert Lead to Customer",
      description: "Transform qualified leads into customers by completing their profile",
      icon: <UserPlus className="h-6 w-6 text-primary" />,
      action: leadId ? <CreateCustomerDialog leadId={leadId} /> : null
    },
    {
      title: "Create Agreement",
      description: "Set up a new rental or lease-to-own agreement",
      icon: <FileText className="h-6 w-6 text-primary" />,
      action: () => navigate("/agreements/new")
    },
    {
      title: "Enter First Payment",
      description: "Record the initial payment for the agreement",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      action: () => navigate("/finance")
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {onboardingStages.map((stage, index) => (
        <Card key={index} className="relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
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
                >
                  Get Started
                </Button>
              ) : (
                stage.action
              )
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
