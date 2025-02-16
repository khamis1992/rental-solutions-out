
export type VehicleMatchStatus = 'pending' | 'contacted' | 'interested' | 'not_interested' | 'test_drive_scheduled' | 'converted';

export interface VehicleMatch {
  id: string;
  lead_id: string;
  vehicle_id: string;
  match_score: number;
  status: VehicleMatchStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleLeadPreferences {
  id: string;
  lead_id: string;
  preferred_colors: string[];
  required_features: Record<string, any>;
  min_year?: number;
  max_year?: number;
  availability_needed_from?: string;
  availability_needed_until?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleTestDrive {
  id: string;
  lead_id: string;
  vehicle_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  interest_level?: 'high' | 'medium' | 'low' | 'none';
  created_at: string;
  updated_at: string;
}
