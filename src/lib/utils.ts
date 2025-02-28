import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a string contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}
