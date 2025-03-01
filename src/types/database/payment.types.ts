
/**
 * Payment Type Definitions
 * 
 * This file contains TypeScript interfaces for payment-related data structures.
 * These types are used throughout the application to ensure type safety when
 * working with payment information from the database.
 */

import { Json } from './json.types';

/**
 * Represents a payment history view from the database
 * This is typically used for displaying payment history with computed fields
 */
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

/**
 * Represents a base payment record from the database
 * Contains core payment information
 */
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

/**
 * Extends the Payment interface with additional view-specific fields
 * Used for displaying payments with related entity information
 */
export interface PaymentView extends Payment {
  customer_name?: string;
  agreement_number?: string;
}

/**
 * Defines all possible payment method types in the system
 * These values should match the enum values in the database
 */
export type PaymentMethodType = 
  'cash' | 
  'bank_transfer' | 
  'credit_card' | 
  'debit_card' | 
  'check' | 
  'paypal' | 
  'sadad' | 
  'other';

/**
 * Defines all possible payment status values in the system
 * These values should match the enum values in the database
 */
export type PaymentStatus = 
  'pending' | 
  'completed' | 
  'failed' | 
  'refunded' | 
  'partially_paid';
