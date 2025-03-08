
/**
 * Utility functions for data transformation and formatting
 */
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";
import { isDefined } from "@/lib/queryUtils";

/**
 * Type-safe function to get a nested property value with a fallback
 */
export function getNestedValue<T, R = unknown>(
  obj: T | null | undefined,
  path: string,
  fallback: R
): R {
  if (!obj) return fallback;
  
  try {
    const keys = path.split('.');
    let value: any = obj;
    
    for (const key of keys) {
      if (value === undefined || value === null) return fallback;
      value = value[key as keyof typeof value];
    }
    
    return (value !== undefined && value !== null) ? value as R : fallback;
  } catch (error) {
    console.error(`Error getting nested value at path ${path}:`, error);
    return fallback;
  }
}

/**
 * Safely transform data using a transformer function
 * @param data Input data
 * @param transformer Function to transform the data
 * @param fallback Fallback value if transformation fails
 */
export function safeTransform<T, R>(
  data: T | null | undefined,
  transformer: (input: T) => R,
  fallback: R
): R {
  if (!isDefined(data)) return fallback;
  
  try {
    return transformer(data);
  } catch (error) {
    console.error("Transformation error:", error);
    return fallback;
  }
}

/**
 * Format a number or string value as a percentage with proper fallback
 */
export function formatSafePercentage(
  value: number | string | null | undefined,
  fallback = "N/A"
): string {
  if (value === undefined || value === null) return fallback;
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return formatPercentage(numValue);
  } catch (error) {
    return fallback;
  }
}

/**
 * Format a number or string value as currency with proper fallback
 */
export function formatSafeCurrency(
  value: number | string | null | undefined,
  currency = "QAR",
  fallback = "N/A"
): string {
  if (value === undefined || value === null) return fallback;
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return formatCurrency(numValue, currency);
  } catch (error) {
    return fallback;
  }
}

/**
 * Format a date value safely with proper fallback
 */
export function formatSafeDate(
  date: Date | string | null | undefined,
  fallback = "N/A"
): string {
  if (!date) return fallback;
  
  try {
    return formatDate(date);
  } catch (error) {
    return fallback;
  }
}

/**
 * Convert a potential null/undefined array to a safe array
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Calculate percentage change between two numbers
 */
export function calculatePercentageChange(
  current: number, 
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Format a statistic with proper growth indicator
 */
export function formatStatWithChange(
  current: number,
  previous: number,
  formatFn?: (value: number) => string
): { value: string; change: number; increasing: boolean } {
  const change = calculatePercentageChange(current, previous);
  const formatter = formatFn || ((val: number) => val.toString());
  
  return {
    value: formatter(current),
    change: Math.abs(change),
    increasing: change >= 0
  };
}
