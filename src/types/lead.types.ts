
export interface LeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  created_by?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
  notes?: LeadNote[];
}
