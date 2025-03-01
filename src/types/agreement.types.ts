
/**
 * Agreement Type Definitions
 * 
 * This file contains TypeScript interfaces and types for agreement-related data structures.
 * These types ensure consistent typing throughout the application when working with
 * agreement data from the database or API calls.
 */

import { Database } from "@/integrations/supabase/types";

/**
 * Enum types imported from the database schema
 * These represent the possible values for various agreement fields
 */
export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

/**
 * Represents text styling options for agreement templates
 */
export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Represents a table structure in an agreement template
 */
export interface Table {
  rows: {
    cells: {
      content: string;
      style: TextStyle;
    }[];
  }[];
  style?: {
    width: string;
    borderCollapse: string;
    borderSpacing: string;
  };
}

/**
 * Represents an agreement template
 * Templates are used to generate new agreements with standardized content
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  agreement_type: AgreementType;
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_structure: {
    textStyle: TextStyle;
    tables: Table[];
  };
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

/**
 * Primary interface for Agreement data
 * This represents a lease/rental agreement in the system
 */
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
  // Related entity data
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

/**
 * Extended Agreement interface with additional relation data
 * Used for detailed views and processing that requires complete data
 */
export interface AgreementWithRelations extends Agreement {
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    nationality: string | null;
    driver_license: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string | null;
    license_plate: string;
    vin: string;
  };
  agreement_templates?: {
    content: string;
  };
}
