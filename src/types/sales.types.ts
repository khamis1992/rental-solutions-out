
export interface SalesLead {
  id: string;
  full_name: string;
  phone_number: string | null;
  nationality: string | null;
  email: string | null;
  preferred_vehicle_type: string | null;
  budget_min: number;
  budget_max: number | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  onboarding_progress: OnboardingProgress;
  onboarding_date: string | null;
  customer_id: string | null;
}

export type LeadStatus = 
  | "new"
  | "document_collection"
  | "vehicle_selection"
  | "agreement_draft"
  | "ready_for_signature"
  | "in_onboarding"
  | "completed"
  | "cancelled";

export interface OnboardingProgress {
  initial_payment: boolean;
  agreement_creation: boolean;
  customer_conversion: boolean;
}

export interface SalesTask {
  id: string;
  lead_id: string;
  task_type: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateLeadInput = Omit<SalesLead, 'id' | 'created_at' | 'updated_at' | 'customer_id' | 'onboarding_date'>;
