
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Type-safe helper for handling Supabase query results
 * @param result Supabase query result with data and error properties
 * @param defaultValue Optional default value to return if there's an error
 * @returns The data from the query or the default value if there was an error
 */
export function handleQueryResult<T>(
  result: PostgrestSingleResponse<T>,
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

/**
 * Handle collection of query results with proper type safety
 */
export function mapDbEntitiesToModels<TDb, TModel>(
  entities: TDb[] | null,
  mapper: (entity: TDb) => TModel
): TModel[] {
  if (!entities || entities.length === 0) return [];
  
  return entities
    .map(entity => {
      try {
        return mapper(entity);
      } catch (error) {
        console.error('Error mapping entity to model:', error);
        return null;
      }
    })
    .filter(isDefined);
}

/**
 * Extract count from a Supabase count query
 */
export function extractCount(
  result: { count: number | null; error: PostgrestError | null },
  defaultValue: number = 0
): number {
  if (result.error) {
    console.error('Supabase count query error:', result.error);
    return defaultValue;
  }
  return result.count ?? defaultValue;
}

/**
 * Safe parsing for JSON stored in the database
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON from database:', error);
    return defaultValue;
  }
}

/**
 * Type guard to ensure we have all required properties in an object
 */
export function hasRequiredProperties<T>(
  obj: unknown,
  properties: (keyof T)[]
): obj is T {
  if (typeof obj !== 'object' || obj === null) return false;
  
  return properties.every(prop => 
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

/**
 * Convert nullable values to their non-null counterparts with defaults
 */
export function withDefaults<T>(
  obj: Partial<T> | null | undefined, 
  defaults: T
): T {
  if (!obj) return defaults;
  return { ...defaults, ...obj };
}

/**
 * Type-safe helper to ensure proper Supabase response handling for tables with relations
 */
export function processRelationalResponse<T, R>(
  response: PostgrestSingleResponse<any>,
  transformer: (data: any) => T[]
): T[] {
  if (response.error) {
    console.error('Supabase query error:', response.error);
    return [];
  }
  
  try {
    return transformer(response.data || []);
  } catch (error) {
    console.error('Error transforming relational data:', error);
    return [];
  }
}

/**
 * Helper function to safely merge object with a default object
 */
export function mergeSafelyWithDefaults<T extends Record<string, any>>(
  obj: Partial<T> | null | undefined,
  defaults: T
): T {
  if (!obj) return { ...defaults };
  
  const result = { ...defaults };
  
  // Only copy properties that exist in the defaults object
  Object.keys(defaults).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  
  return result;
}
