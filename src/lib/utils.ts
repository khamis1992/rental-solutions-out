
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "QAR") {
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPP');
}

export function isRTL(): boolean {
  // This can be expanded to check document.dir or other configuration
  return true; // For now, always return true to force RTL layout
}

export function getRTLClass(baseClass: string, rtlClass: string): string {
  return isRTL() ? rtlClass : baseClass;
}

// Add RTL utility functions
export const rtlUtils = {
  // Get the appropriate border class for RTL layouts
  getBorderClass: () => isRTL() ? 'border-l' : 'border-r',
  
  // Get the appropriate shadow class for RTL layouts
  getShadowClass: () => isRTL() ? 'shadow-[-2px_0_5px_rgba(0,0,0,0.05)]' : 'shadow-[2px_0_5px_rgba(0,0,0,0.05)]',
  
  // Get the appropriate padding class for RTL layouts
  getPaddingClass: () => isRTL() ? 'pl-4 sm:pl-6 lg:pl-8 pr-0' : 'pr-4 sm:pr-6 lg:pr-8 pl-0',
  
  // Get the appropriate flex direction for RTL layouts
  getFlexDirection: () => isRTL() ? 'flex-row-reverse' : 'flex-row',
}
