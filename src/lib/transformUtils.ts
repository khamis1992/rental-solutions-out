
/**
 * Safely transform data with error handling, allowing for a default value if transformation fails
 * 
 * @param data Input data to transform
 * @param transformer Function to transform the data
 * @param defaultValue Default value to return if transformation fails
 * @returns Transformed data or default value
 */
export function safeTransform<TInput, TOutput>(
  data: TInput,
  transformer: (input: TInput) => TOutput,
  defaultValue: TOutput
): TOutput {
  try {
    return transformer(data);
  } catch (error) {
    console.error('Error transforming data:', error);
    return defaultValue;
  }
}

/**
 * Safely transform an array of data with error handling
 * 
 * @param dataArray Array of input data
 * @param transformer Function to transform each item
 * @returns Array of transformed items, filtering out any that failed transformation
 */
export function safeTransformArray<TInput, TOutput>(
  dataArray: TInput[] | null | undefined,
  transformer: (input: TInput) => TOutput
): TOutput[] {
  if (!dataArray || !Array.isArray(dataArray)) {
    return [];
  }
  
  return dataArray
    .map(item => {
      try {
        return {
          success: true,
          result: transformer(item)
        };
      } catch (error) {
        console.error('Error transforming array item:', error);
        return {
          success: false,
          result: null
        };
      }
    })
    .filter(result => result.success)
    .map(result => result.result as TOutput);
}

/**
 * Pick specific properties from an object
 * 
 * @param obj The source object
 * @param keys Array of keys to pick
 * @returns New object with only the picked properties
 */
export function pick<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omit specific properties from an object
 * 
 * @param obj The source object
 * @param keys Array of keys to omit
 * @returns New object without the omitted properties
 */
export function omit<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Safely access nested properties in an object
 * 
 * @param obj The source object
 * @param path Path to the property, using dot notation
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export function getNestedProperty<T>(
  obj: Record<string, any> | null | undefined,
  path: string,
  defaultValue: T
): T {
  if (!obj) return defaultValue;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return (current as unknown as T) ?? defaultValue;
}

/**
 * Convert object keys from camelCase to snake_case
 * 
 * @param obj The source object
 * @returns New object with snake_case keys
 */
export function camelToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Recursively process nested objects
    const newValue = value && typeof value === 'object' && !Array.isArray(value)
      ? camelToSnakeCase(value)
      : value;
      
    result[snakeKey] = newValue;
    return result;
  }, {} as Record<string, any>);
}

/**
 * Convert object keys from snake_case to camelCase
 * 
 * @param obj The source object
 * @returns New object with camelCase keys
 */
export function snakeToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Recursively process nested objects
    const newValue = value && typeof value === 'object' && !Array.isArray(value)
      ? snakeToCamelCase(value)
      : value;
      
    result[camelKey] = newValue;
    return result;
  }, {} as Record<string, any>);
}
