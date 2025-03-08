
import { supabase } from "@/integrations/supabase/client";
import { TypedQuery } from "@/types/supabase.types";

/**
 * Apply filters to a Supabase query with proper type support
 * @param query The base query
 * @param filters Object with filter conditions
 * @returns Filtered query builder
 */
export function applyFilters<T>(
  query: TypedQuery<T>,
  filters: Record<string, any>
): TypedQuery<T> {
  let filteredQuery = query;
  
  Object.entries(filters).forEach(([field, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    
    // Handle arrays for "in" queries
    if (Array.isArray(value)) {
      if (value.length > 0) {
        filteredQuery = filteredQuery.in(field, value);
      }
      return;
    }
    
    // Handle objects for custom operators
    if (typeof value === 'object') {
      if ('gt' in value) filteredQuery = filteredQuery.gt(field, value.gt);
      if ('gte' in value) filteredQuery = filteredQuery.gte(field, value.gte);
      if ('lt' in value) filteredQuery = filteredQuery.lt(field, value.lt);
      if ('lte' in value) filteredQuery = filteredQuery.lte(field, value.lte);
      if ('like' in value) filteredQuery = filteredQuery.like(field, `%${value.like}%`);
      if ('ilike' in value) filteredQuery = filteredQuery.ilike(field, `%${value.ilike}%`);
      if ('not' in value) filteredQuery = filteredQuery.not(field, 'eq', value.not);
      return;
    }
    
    // Default is exact match
    filteredQuery = filteredQuery.eq(field, value);
  });
  
  return filteredQuery;
}

/**
 * Apply pagination to a Supabase query
 * @param query The base query
 * @param page Page number (0-indexed)
 * @param pageSize Items per page
 * @returns Paginated query
 */
export function applyPagination<T>(
  query: TypedQuery<T>,
  page: number,
  pageSize: number
): TypedQuery<T> {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  return query.range(start, end);
}

/**
 * Apply sorting to a Supabase query
 * @param query The base query
 * @param sortField Field to sort by
 * @param sortDirection Direction to sort (ascending or descending)
 * @returns Sorted query
 */
export function applySorting<T>(
  query: TypedQuery<T>,
  sortField: string,
  sortDirection: 'asc' | 'desc' = 'asc'
): TypedQuery<T> {
  return query.order(sortField, { ascending: sortDirection === 'asc' });
}

/**
 * Build a complete query with filters, sorting, and pagination
 * @param baseQuery The starting query
 * @param options Query options
 * @returns Complete query builder
 */
export function buildQuery<T>(
  baseQuery: TypedQuery<T>,
  options: {
    filters?: Record<string, any>;
    sort?: { field: string; direction?: 'asc' | 'desc' };
    page?: number;
    pageSize?: number;
    includes?: string[];
  }
): TypedQuery<T> {
  let query = baseQuery;
  
  // Apply select fields if provided
  if (options.includes && options.includes.length > 0) {
    query = query.select(options.includes.join(','));
  }
  
  // Apply filters
  if (options.filters) {
    query = applyFilters(query, options.filters);
  }
  
  // Apply sorting
  if (options.sort) {
    query = applySorting(query, options.sort.field, options.sort.direction);
  }
  
  // Apply pagination
  if (options.page !== undefined && options.pageSize !== undefined) {
    query = applyPagination(query, options.page, options.pageSize);
  }
  
  return query;
}

/**
 * Create a typed function to check if a query contains errors
 */
export function isQueryError<T>(result: any): result is { error: true } {
  return result && typeof result === 'object' && 'error' in result && result.error === true;
}

/**
 * Helper function to run a database RPC function with proper typing
 * @param functionName The RPC function name
 * @param params Function parameters
 * @returns Promise with typed result
 */
export async function callDatabaseFunction<T, P = Record<string, any>>(
  functionName: string,
  params?: P
): Promise<T | null> {
  try {
    const { data, error } = await supabase.rpc(functionName, params || {});
    
    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error(`Exception in ${functionName}:`, err);
    return null;
  }
}

/**
 * Execute a database transaction with proper error handling
 * @param operations Array of operations to perform
 * @returns Promise with success status and errors if any
 */
export async function executeTransaction(
  operations: Array<() => Promise<any>>
): Promise<{ success: boolean; errors: Error[] }> {
  const errors: Error[] = [];
  let hasSucceeded = true;
  
  for (const operation of operations) {
    try {
      await operation();
    } catch (error) {
      hasSucceeded = false;
      errors.push(error as Error);
    }
  }
  
  return { 
    success: hasSucceeded && errors.length === 0,
    errors
  };
}
