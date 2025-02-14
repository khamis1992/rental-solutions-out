
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CustomerTier {
  id: string;
  name: LoyaltyTier;
  points_required: number;
  benefits: Benefit[];
  created_at: string;
  updated_at: string;
}

export interface Benefit {
  name: string;
  description: string;
}

export interface LoyaltyPoints {
  id: string;
  customer_id: string;
  points: number;
  tier: LoyaltyTier;
  points_history: PointHistory[];
  created_at: string;
  updated_at: string;
}

export interface PointHistory {
  points: number;
  reason: string;
  date: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  is_active: boolean;
  tier_requirement: LoyaltyTier;
  created_at: string;
  updated_at: string;
}

export interface CustomerReward {
  id: string;
  customer_id: string;
  reward_id: string;
  redeemed_at: string;
  status: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}
