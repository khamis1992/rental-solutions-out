
import { Json } from "./json.types";

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  nationality: string | null;
  document_verification_status: 'pending' | 'rejected' | 'verified' | 'expired';
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  merged_into?: string | null;
  needs_review?: boolean;
  profile_completion_score?: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending_review' | 'blacklisted';
  status_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPoints {
  id: string;
  customer_id: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_history: Array<{
    points: number;
    reason: string;
    date: string;
  }>;
}

export interface CustomerReward {
  id: string;
  customer_id: string;
  reward_id: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  updated_at: string;
  redeemed_at: string | null;
  expiry_date: string | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  tier_requirement: string | null;
  is_active: boolean;
}
