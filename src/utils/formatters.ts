
/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  if (isNaN(value)) return "Invalid percentage";
  return `${value.toFixed(1)}%`;
};

/**
 * Format a large number with abbreviations (K, M, B)
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return "Invalid number";
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format a number with commas for thousands
 */
export const formatNumberWithCommas = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return "Invalid number";
  
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a database enum value to readable text
 */
export const formatEnumValue = (value: string): string => {
  if (!value) return "N/A";
  
  // Convert snake_case or camelCase to Title Case with spaces
  return value
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
    .trim();
};

/**
 * Safe formatter that handles null/undefined/empty values
 */
export const safelyFormat = <T, R>(
  value: T | null | undefined,
  formatter: (val: T) => R,
  fallback: R
): R => {
  if (value === null || value === undefined) return fallback;
  try {
    return formatter(value);
  } catch (error) {
    console.error("Formatting error:", error);
    return fallback;
  }
};
