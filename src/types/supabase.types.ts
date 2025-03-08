
import type { PostgrestFilterBuilder, PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Type-safe table types from Supabase Database definition
export type Tables = Database['public']['Tables'];

// Type-safe table row types
export type Vehicle = Tables['vehicles']['Row'];
export type Profile = Tables['profiles']['Row'];
export type Agreement = Tables['leases']['Row'];
export type Payment = Tables['unified_payments']['Row'];
export type Maintenance = Tables['maintenance']['Row'];
export type TrafficFine = Tables['traffic_fines']['Row'];
export type PaymentHistoryView = Tables['payment_history_view']['Row'];
export type CustomerTier = Tables['customer_tiers']['Row'];
export type LoyaltyPoints = Tables['loyalty_points']['Row'];
export type VehicleDocument = Tables['vehicle_documents']['Row'];
export type VehicleInsurance = Tables['vehicle_insurance']['Row'];

// Enums
export type VehicleStatus = Database['public']['Enums']['vehicle_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethodType = Database['public']['Enums']['payment_method_type']; 
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type MaintenanceStatus = Database['public']['Enums']['maintenance_status'];
export type CustomerStatusType = Database['public']['Enums']['customer_status_type'];

// Type-safe PostgrestFilterBuilder with proper return types
export type TypedQuery<T> = PostgrestFilterBuilder<any, any, T[]>;

// Helper type for query responses
export type QueryResponse<T> = PostgrestSingleResponse<T>;

// Helper type for query result with error handling
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Type for aggregation results
export interface AggregationResult {
  count?: number;
  sum?: number;
  avg?: number;
  min?: number;
  max?: number;
}

// Type for relational data queries
export interface RelationalQueryOptions {
  includes?: string[];
  nested?: {
    [key: string]: {
      fields: string[];
      filter?: Record<string, any>;
    };
  };
}

// Expanded customer interface with better typing
export interface CustomerWithRelations extends Profile {
  agreements?: Agreement[];
  loyalty_points?: LoyaltyPoints;
}

// Expanded vehicle interface with relations
export interface VehicleWithRelations extends Vehicle {
  documents?: VehicleDocument[];
  insurance?: VehicleInsurance;
  maintenance?: Maintenance[];
}

// Expanded agreement interface with relations
export interface AgreementWithRelations extends Agreement {
  customer: Profile;
  vehicle: Vehicle;
  payments?: Payment[];
  traffic_fines?: TrafficFine[];
}

// Helper type for common database operations
export interface DbOperationResult {
  success: boolean;
  error?: string;
  data?: any;
  count?: number;
}
