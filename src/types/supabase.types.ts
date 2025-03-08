
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
