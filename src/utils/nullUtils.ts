
/**
 * Safely access properties from potentially null/undefined objects
 * @param obj The object to access properties from
 * @param defaultValue Default value to return if object is null/undefined
 * @returns The object or default value
 */
export function safeObject<T>(obj: T | null | undefined, defaultValue: T): T {
  return obj !== null && obj !== undefined ? obj : defaultValue;
}

/**
 * Safely access a string property from potentially null/undefined objects
 * @param value The string to check
 * @param defaultValue Default value to return if string is null/undefined/empty
 * @returns The string or default value
 */
export function safeString(value: string | null | undefined, defaultValue: string = ''): string {
  return value !== null && value !== undefined && value !== '' ? value : defaultValue;
}

/**
 * Safely parse a JSON string
 * @param jsonString The JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Type guard to check if an object is not null or undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
