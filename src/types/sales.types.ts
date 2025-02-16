
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
  status: 'new' | 'document_collection' | 'vehicle_selection' | 'agreement_draft' | 'ready_for_signature' | 'onboarding' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  onboarding_progress: {
    initial_payment: boolean;
    agreement_creation: boolean;
    customer_conversion: boolean;
  };
  onboarding_date: string | null;
  customer_id: string | null;
}

export interface VehicleType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}
