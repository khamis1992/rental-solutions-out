
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PointsRule {
  id: string;
  action_type: string;
  points_awarded: number;
  description: string;
  minimum_amount: number;
  tier_multiplier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  is_active: boolean;
}

export function LoyaltyProgramSettings() {
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['points-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_earning_rules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PointsRule[];
    }
  });

  const updateRule = useMutation({
    mutationFn: async (rule: Partial<PointsRule> & { id: string }) => {
      const { error } = await supabase
        .from('points_earning_rules')
        .update(rule)
        .eq('id', rule.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-rules'] });
      toast.success('Rule updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update rule: ' + error.message);
    }
  });

  const handlePointsChange = (rule: PointsRule, points: string) => {
    const numPoints = parseInt(points);
    if (isNaN(numPoints)) return;

    updateRule.mutate({
      id: rule.id,
      points_awarded: numPoints
    });
  };

  const handleMinimumAmountChange = (rule: PointsRule, amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    updateRule.mutate({
      id: rule.id,
      minimum_amount: numAmount
    });
  };

  const handleStatusChange = (rule: PointsRule, isActive: boolean) => {
    updateRule.mutate({
      id: rule.id,
      is_active: isActive
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points Earning Rules</CardTitle>
        <CardDescription>Configure how customers earn loyalty points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rules?.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{rule.description}</h3>
                  <p className="text-sm text-muted-foreground">Action: {rule.action_type}</p>
                </div>
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={(checked) => handleStatusChange(rule, checked)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Points Awarded</Label>
                  <Input
                    type="number"
                    value={rule.points_awarded}
                    onChange={(e) => handlePointsChange(rule, e.target.value)}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Amount (if applicable)</Label>
                  <Input
                    type="number"
                    value={rule.minimum_amount}
                    onChange={(e) => handleMinimumAmountChange(rule, e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Tier Multipliers</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {Object.entries(rule.tier_multiplier).map(([tier, multiplier]) => (
                    <div key={tier} className="text-center p-2 border rounded">
                      <div className="font-medium capitalize">{tier}</div>
                      <div className="text-sm text-muted-foreground">{multiplier}x</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
