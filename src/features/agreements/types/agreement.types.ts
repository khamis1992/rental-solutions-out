
import { Database } from "@/integrations/supabase/types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

// Re-export types from the original file
export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus;
  total_amount: number;
  initial_mileage: number;
  return_mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  rent_amount: number;
  remaining_amount: number;
  daily_late_fee: number;
  payment_status: PaymentStatus;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string;
  template_id?: string;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email?: string | null;
    status?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  remaining_amounts?: {
    remaining_amount: number;
  }[];
}
