
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ScoringRule {
  rule_name: string;
  category: string;
  points: number;
  description: string;
}

interface LeadScore {
  id: string;
  lead_score: number;
  full_name: string;
  status: string;
}

export const LeadScoring = () => {
  // Fetch scoring rules
  const { data: scoringRules, isLoading: rulesLoading } = useQuery({
    queryKey: ["scoring-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_scoring_rules")
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: false });

      if (error) throw error;
      return data as ScoringRule[];
    }
  });

  // Fetch top scored leads
  const { data: topLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["top-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select(`
          id,
          lead_score,
          customer:customer_id (
            full_name
          ),
          status
        `)
        .not("lead_score", "is", null)
        .order("lead_score", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as LeadScore[];
    }
  });

  if (rulesLoading || leadsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Calculate max possible score
  const maxScore = scoringRules?.reduce((sum, rule) => sum + rule.points, 0) || 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Scored Leads</CardTitle>
          <CardDescription>Leads with highest engagement and potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLeads?.map((lead) => (
              <div key={lead.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{lead.customer?.full_name}</span>
                  <span className="text-muted-foreground">{lead.lead_score} points</span>
                </div>
                <Progress value={(lead.lead_score / maxScore) * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scoring Criteria</CardTitle>
          <CardDescription>How leads are scored in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoringRules?.map((rule) => (
              <div key={rule.rule_name} className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{rule.rule_name.split('_').join(' ').toUpperCase()}</h4>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <span className="text-sm font-medium">+{rule.points} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
