
import { Json } from "../json.types";

export interface CustomerProfile {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  role?: string;
  nationality?: string | null;
  driver_license?: string | null;
  id_document_url?: string | null;
  license_document_url?: string | null;
  id_document_expiry?: string | null;
  license_document_expiry?: string | null;
  document_verification_status?: string | null;
  preferred_communication_channel?: string | null;
  welcome_email_sent?: boolean;
  status?: string;
  form_data?: Json;
}

export interface LoyaltyPoints {
  id: string;
  customer_id: string;
  points: number;
  tier: string;
  points_history?: Json[];
  created_at: string;
  updated_at: string;
}

export interface CustomerReward {
  id: string;
  customer_id: string;
  reward_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
  redeemed_at?: string;
  rewards?: {
    id: string;
    name: string;
    description?: string;
    points_cost: number;
    reward_type: string;
    tier_requirement?: string;
  };
}
