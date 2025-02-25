
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TemplateRecommendation {
  id: string;
  template_id: string;
  recommendation_type: string;
  description: string;
  metrics: {
    total_sent: number;
    opened: number;
    clicked: number;
    engagement_rate: number;
    response_rate: number;
  };
  confidence_score: number;
  status: string;
  priority: string;
  email_templates?: {
    name: string;
  } | null;
}

export const TemplateRecommendations = () => {
  const { data: recommendations, isLoading } = useQuery<TemplateRecommendation[]>({
    queryKey: ["template-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_recommendations')
        .select(`
          *,
          email_templates (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

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
          <CardTitle className="flex items-center gap-2">
            AI Recommendations
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardTitle>
          <CardDescription>
            Smart suggestions to improve your email template performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations?.map((recommendation) => (
              <Card key={recommendation.id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    getPriorityColor(recommendation.priority).split(' ')[0]
                  }`}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {recommendation.email_templates?.name || 'Unnamed Template'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          getPriorityColor(recommendation.priority)
                        }`}
                      >
                        {recommendation.priority} priority
                      </span>
                      <Button variant="outline" size="sm" className="ml-2">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="ml-2">Implement</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Confidence Score</p>
                      <p className="font-medium">
                        {(recommendation.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Open Rate</p>
                      <p className="font-medium">
                        {(recommendation.metrics.engagement_rate).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Click Rate</p>
                      <p className="font-medium">
                        {(recommendation.metrics.response_rate).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Sent</p>
                      <p className="font-medium">
                        {recommendation.metrics.total_sent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {recommendations?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-medium text-lg">All Templates Optimized</h3>
                <p className="text-muted-foreground mt-1">
                  No recommendations at this time. Your templates are performing well!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
