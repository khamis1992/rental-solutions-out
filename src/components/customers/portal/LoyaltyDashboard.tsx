
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Award, TrendingUp } from "lucide-react";
import type { CustomerTier, LoyaltyPoints, Reward, PointHistory } from "@/types/loyalty";

interface LoyaltyDashboardProps {
  customerId: string;
}

export function LoyaltyDashboard({ customerId }: LoyaltyDashboardProps) {
  // Fetch or initialize loyalty points
  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty-points', customerId],
    queryFn: async () => {
      // First try to get existing loyalty points
      const { data: existingData, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If no loyalty points exist, initialize them
      if (!existingData) {
        const { data: newLoyaltyData, error: insertError } = await supabase
          .from('loyalty_points')
          .insert([{
            customer_id: customerId,
            points: 0,
            tier: 'bronze',
            points_history: []
          }])
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        if (!newLoyaltyData) throw new Error('Failed to create loyalty points');

        return {
          ...newLoyaltyData,
          points_history: []
        };
      }

      // Cast points_history to the correct type
      const pointsHistory = Array.isArray(existingData.points_history) 
        ? existingData.points_history.map((history: any) => ({
            points: history.points,
            reason: history.reason,
            date: history.date
          }))
        : [];

      return {
        ...existingData,
        points_history: pointsHistory
      };
    }
  });

  // Fetch available rewards
  const { data: rewards } = useQuery({
    queryKey: ['rewards-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as Reward[];
    },
  });

  // Fetch customer tier info
  const { data: tierInfo } = useQuery({
    queryKey: ['customer-tier', loyaltyData?.tier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_tiers')
        .select('*')
        .eq('name', loyaltyData?.tier)
        .single();

      if (error) throw error;
      
      // Cast benefits to the correct type
      const benefits = Array.isArray(data.benefits) 
        ? data.benefits.map((benefit: any) => ({
            name: benefit.name,
            description: benefit.description
          }))
        : [];

      return {
        ...data,
        benefits
      } as CustomerTier;
    },
    enabled: !!loyaltyData?.tier,
  });

  // Calculate progress to next tier
  const calculateNextTier = () => {
    if (!loyaltyData) return null;

    const tiers = {
      bronze: { next: 'silver', required: 1001 },
      silver: { next: 'gold', required: 5001 },
      gold: { next: 'platinum', required: 10001 },
      platinum: { next: null, required: null },
    };

    const currentTier = loyaltyData.tier;
    const nextTier = tiers[currentTier]?.next;
    const pointsRequired = tiers[currentTier]?.required;

    if (!nextTier || !pointsRequired) return null;

    const progress = (loyaltyData.points / pointsRequired) * 100;
    const remaining = pointsRequired - loyaltyData.points;

    return { nextTier, progress, remaining };
  };

  const nextTierInfo = calculateNextTier();

  return (
    <div className="space-y-6">
      {/* Current Tier & Points */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loyalty Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold capitalize">{loyaltyData?.tier || 'Bronze'}</h3>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <h3 className="text-2xl font-bold">{loyaltyData?.points || 0}</h3>
            </div>
          </div>

          {nextTierInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTierInfo.nextTier}</span>
                <span>{nextTierInfo.remaining} points needed</span>
              </div>
              <Progress value={nextTierInfo.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      {tierInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Your Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {tierInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{benefit.name}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rewards?.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {reward.tier_requirement}
                      </Badge>
                      <Badge variant="outline">{reward.points_cost} points</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  disabled={!loyaltyData || loyaltyData.points < reward.points_cost}
                >
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      {loyaltyData?.points_history && loyaltyData.points_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Points History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyData.points_history.map((history, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{history.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-600">+{history.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
