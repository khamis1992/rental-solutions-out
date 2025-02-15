
export type SalesLeadStatus = 
  | "new"
  | "document_collection" 
  | "vehicle_selection"
  | "agreement_draft"
  | "ready_for_signature"
  | "onboarding"
  | "completed"
  | "cancelled";

export interface SalesLead {
  id: string;
  customer_id?: string;
  full_name: string;
  phone_number: string;
  email?: string;
  preferred_vehicle_type?: string;
  preferred_agreement_type?: string;
  budget_range_min?: number;
  budget_range_max?: number;
  notes?: string;
  lead_score?: number;
  status: SalesLeadStatus;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  onboarding_progress?: {
    customer_conversion: boolean;
    agreement_creation: boolean;
    initial_payment: boolean;
  };
}

export interface LeadFormData {
  full_name: string;
  phone_number: string;
  email?: string;
  preferred_vehicle_type?: string;
  preferred_agreement_type?: string;
  budget_range_min?: number;
  budget_range_max?: number;
  notes?: string;
}
