
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';

export interface SalesLead {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  preferred_vehicle_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  follow_up_date: string | null;
  lead_source: string | null;
  last_contacted_at: string | null;
}
