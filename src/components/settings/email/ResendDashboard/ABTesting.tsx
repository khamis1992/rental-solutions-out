
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FlaskConical, TrendingUp, CheckCircle2 } from "lucide-react";

interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  winning_variant_id: string | null;
  variants: ABTestVariant[];
}

interface ABTestVariant {
  id: string;
  name: string;
  is_control: boolean;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    conversion: number;
  };
  email_templates?: {
    name: string;
  } | null;
}

export const ABTesting = () => {
  const { data: experiments, isLoading } = useQuery<ABTestExperiment[]>({
    queryKey: ["ab-test-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_test_experiments')
        .select(`
          *,
          variants:ab_test_variants (
            *,
            email_templates (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                A/B Testing
                <FlaskConical className="h-5 w-5 text-purple-500" />
              </CardTitle>
              <CardDescription>
                Test different email variants to optimize performance
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Experiment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active Tests</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-4">
                {experiments?.filter(exp => exp.status === 'active').map((experiment) => (
                  <ExperimentCard key={experiment.id} experiment={experiment} />
                ))}
                {experiments?.filter(exp => exp.status === 'active').length === 0 && (
                  <EmptyState
                    message="No active experiments"
                    description="Start a new A/B test to optimize your email performance"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {experiments?.filter(exp => exp.status === 'completed').map((experiment) => (
                  <ExperimentCard key={experiment.id} experiment={experiment} />
                ))}
                {experiments?.filter(exp => exp.status === 'completed').length === 0 && (
                  <EmptyState
                    message="No completed experiments"
                    description="Completed experiments will appear here"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="draft">
              <div className="space-y-4">
                {experiments?.filter(exp => exp.status === 'draft').map((experiment) => (
                  <ExperimentCard key={experiment.id} experiment={experiment} />
                ))}
                {experiments?.filter(exp => exp.status === 'draft').length === 0 && (
                  <EmptyState
                    message="No draft experiments"
                    description="Create a new experiment to get started"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const ExperimentCard = ({ experiment }: { experiment: ABTestExperiment }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-500 bg-green-50';
      case 'completed':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const calculateMetrics = (variant: ABTestVariant) => {
    const openRate = variant.metrics.opened / variant.metrics.delivered * 100 || 0;
    const clickRate = variant.metrics.clicked / variant.metrics.opened * 100 || 0;
    return { openRate, clickRate };
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-medium text-lg">{experiment.name}</h3>
            <p className="text-sm text-muted-foreground">{experiment.description}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(experiment.status)}`}
          >
            {experiment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {experiment.variants.map((variant) => {
            const { openRate, clickRate } = calculateMetrics(variant);
            return (
              <Card key={variant.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {variant.is_control ? 'Control' : 'Variant'}: {variant.email_templates?.name}
                    </h4>
                    {experiment.winning_variant_id === variant.id && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Open Rate</span>
                      <span className="font-medium">{openRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Click Rate</span>
                      <span className="font-medium">{clickRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sample Size</span>
                      <span className="font-medium">{variant.metrics.sent.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" className="w-full sm:w-auto">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message, description }: { message: string; description: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-medium text-lg">{message}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
};
