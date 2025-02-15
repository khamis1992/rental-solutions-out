
import { Database } from "@/integrations/supabase/types";

export type SalesPipelineStage = 
  | "new"
  | "document_collection"
  | "vehicle_selection"
  | "agreement_draft"
  | "ready_for_signature"
  | "onboarding"
  | "completed"
  | "cancelled";

export type SalesLead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  status: SalesPipelineStage;
  lead_score: number | null;
  notes: string | null;
  created_at: string | null;
  last_contacted: string | null;
  assigned_to: string | null;
  customer_id: string | null;
  document_url: string | null;
  onboarding_date: string | null;
  preferred_agreement_type: Database["public"]["Enums"]["agreement_type"] | null;
  budget_range_min: number | null;
  budget_range_max: number | null;
  preferred_vehicle_type: string | null;
  onboarding_progress: {
    customer_conversion: boolean;
    agreement_creation: boolean;
    initial_payment: boolean;
  } | null;
};

export type SalesCommunication = {
  id: string;
  lead_id: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  team_member?: {
    full_name: string;
  };
};

export type SalesTask = {
  id: string;
  lead_id: string;
  title: string;
  status: 'pending' | 'completed';
  created_at: string;
};
