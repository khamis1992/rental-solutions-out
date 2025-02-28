
import { Json } from './json.types';

export interface PaymentHistoryView {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  customer_id?: string;
  balance?: number;
  days_overdue?: number;
  late_fine_amount?: number;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
  late_fine_amount?: number; // Added to fix type error
}

export interface PaymentView extends Payment {
  customer_name?: string;
  agreement_number?: string;
}

export type PaymentMethodType = 
  'cash' | 
  'bank_transfer' | 
  'credit_card' | 
  'debit_card' | 
  'check' | 
  'paypal' | 
  'sadad' | 
  'other';

export type PaymentStatus = 
  'pending' | 
  'completed' | 
  'failed' | 
  'refunded' | 
  'partially_paid';
