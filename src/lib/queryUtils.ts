
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type-safe helper for handling Supabase query results
 * @param result Supabase query result with data and error properties
 * @param defaultValue Optional default value to return if there's an error
 * @returns The data from the query or the default value if there was an error
 */
export function handleQueryResult<T>(
  result: { data: T | null; error: PostgrestError | null },
  defaultValue: T | null = null
): T | null {
  if (result.error) {
    console.error('Supabase query error:', result.error);
    return defaultValue;
  }
  return result.data;
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Helper to safely transform data between types
 * Useful when database types and frontend types need mapping
 */
export function mapDbEntityToModel<TDb, TModel>(
  entity: TDb | null,
  mapper: (entity: TDb) => TModel
): TModel | null {
  if (!entity) return null;
  try {
    return mapper(entity);
  } catch (error) {
    console.error('Error mapping entity to model:', error);
    return null;
  }
}
