
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

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'status_changed' | 'note_added' | 'email_sent' | 'call_made' | 'updated';
  description: string | null;
  performed_by: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
