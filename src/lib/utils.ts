
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
