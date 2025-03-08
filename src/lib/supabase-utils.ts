
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder, PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Generic type for database records
 */
export type DbRecord = Record<string, any>;

/**
 * Function to handle errors from Supabase operations
 */
export const handleSupabaseError = (error: Error, message: string = "Operation failed"): void => {
  console.error(`Supabase error: ${error.message}`, error);
  toast.error(message);
};

/**
 * Handle Supabase responses in a type-safe way
 */
export async function executeQuery<T>(
  query: Promise<PostgrestResponse<T>>,
  errorMessage: string = "Database operation failed"
): Promise<T[] | null> {
  try {
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, errorMessage);
      return null;
    }
    
    return data;
  } catch (error) {
    handleSupabaseError(error as Error, errorMessage);
    return null;
  }
}

/**
 * Safely execute a single record query
 */
export async function executeSingleQuery<T>(
  query: Promise<PostgrestSingleResponse<T>>,
  errorMessage: string = "Database operation failed"
): Promise<T | null> {
  try {
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, errorMessage);
      return null;
    }
    
    return data;
  } catch (error) {
    handleSupabaseError(error as Error, errorMessage);
    return null;
  }
}

/**
 * Create a record in the database
 */
export async function createRecord<T extends DbRecord>(
  table: string,
  record: T,
  errorMessage: string = "Failed to create record"
): Promise<T | null> {
  return executeSingleQuery(
    supabase.from(table).insert(record).select().single(),
    errorMessage
  );
}

/**
 * Update a record in the database
 */
export async function updateRecord<T extends DbRecord>(
  table: string,
  id: string,
  updates: Partial<T>,
  errorMessage: string = "Failed to update record"
): Promise<T | null> {
  return executeSingleQuery(
    supabase.from(table).update(updates).eq('id', id).select().single(),
    errorMessage
  );
}

/**
 * Delete a record from the database
 */
export async function deleteRecord(
  table: string,
  id: string,
  errorMessage: string = "Failed to delete record"
): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (error) {
      handleSupabaseError(error, errorMessage);
      return false;
    }
    
    return true;
  } catch (error) {
    handleSupabaseError(error as Error, errorMessage);
    return false;
  }
}

/**
 * Get a record by ID
 */
export async function getRecordById<T>(
  table: string,
  id: string,
  errorMessage: string = "Failed to fetch record"
): Promise<T | null> {
  return executeSingleQuery(
    supabase.from(table).select().eq('id', id).single(),
    errorMessage
  );
}

/**
 * Fetch records with pagination
 */
export async function fetchPaginatedRecords<T>(
  table: string,
  page: number,
  pageSize: number,
  orderBy: string = 'created_at',
  ascending: boolean = false,
  filter?: (query: PostgrestFilterBuilder<any>) => PostgrestFilterBuilder<any>,
  errorMessage: string = "Failed to fetch records"
): Promise<{ data: T[] | null; count: number }> {
  try {
    // Get total count
    let countQuery = supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (filter) {
      countQuery = filter(countQuery);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      handleSupabaseError(countError, errorMessage);
      return { data: null, count: 0 };
    }
    
    // Get paginated data
    let query = supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (filter) {
      query = filter(query);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, errorMessage);
      return { data: null, count: 0 };
    }
    
    return { data, count: count || 0 };
  } catch (error) {
    handleSupabaseError(error as Error, errorMessage);
    return { data: null, count: 0 };
  }
}
