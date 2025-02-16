
export type SalesLeadStatus = 
  | "new"
  | "document_collection"
  | "vehicle_selection"
  | "agreement_draft"
  | "ready_for_signature"
  | "onboarding"
  | "completed"
  | "cancelled";

export interface LeadProgress {
  customer_conversion: boolean;
  agreement_creation: boolean;
  initial_payment: boolean;
}

export interface SalesLead {
  id: string;
  customer_id?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  preferred_vehicle_type?: string;
  preferred_agreement_type?: "short_term" | "lease_to_own" | null;
  budget_range_min?: number;
  budget_range_max?: number;
  notes?: string;
  status: SalesLeadStatus;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  lead_score?: number;
  next_follow_up?: string;
  onboarding_date?: string;
  onboarding_progress?: LeadProgress;
  document_url?: string;
  lead_source?: string;
  priority?: string;
  last_contacted?: string;
}

export interface LeadScore {
  id: string;
  lead_score: number;
  full_name: string;
  status: SalesLeadStatus;
  customer?: {
    full_name: string;
  };
}

export interface LeadCommunication {
  id: string;
  lead_id: string;
  type: string;
  content?: string;
  scheduled_at?: string;
  completed_at?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  team_member_id?: string;
  profiles?: {
    full_name: string;
  };
}

export interface VehicleRecommendation {
  id?: string;
  lead_id?: string;
  vehicle_id?: string;
  match_score?: number;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
