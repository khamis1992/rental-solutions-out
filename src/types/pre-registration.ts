
export interface PreRegistration {
  id: string;
  full_name: string;
  email?: string;
  phone_number: string;
  preferred_vehicle_type?: string;
  preferred_color?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_installment_period?: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist';
  created_at?: string;
  updated_at?: string;
  follow_up_date?: string;
  assigned_to?: string;
}

export interface PreRegistrationFormData {
  full_name: string;
  email: string;
  phone_number: string;
  preferred_vehicle_type: string;
  preferred_color: string;
  budget_min: number;
  budget_max: number;
  preferred_installment_period: string;
  comments: string;
}
