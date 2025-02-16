
import { Database } from "@/integrations/supabase/types";

export type SalesLeadStatus = Database['public']['Enums']['sales_lead_status'];

export interface SalesLead {
  id: string;
  full_name: string;
  phone_number: string;
  nationality: string;
  email: string;
  preferred_vehicle_type: string;
  budget_min: number;
  budget_max?: number;
  notes?: string;
  status: SalesLeadStatus;
  created_at: string;
  updated_at: string;
  onboarding_progress: {
    initial_payment: boolean;
    agreement_creation: boolean;
    customer_conversion: boolean;
  };
}

export interface CreateLeadDTO {
  full_name: string;
  phone_number: string;
  nationality: string;
  email: string;
  preferred_vehicle_type: string;
  budget_min: number;
  budget_max?: number;
  notes?: string;
}
