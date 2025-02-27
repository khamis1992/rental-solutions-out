
// Format date to display format (e.g., "Jan 15, 2023")
export const formatDateToDisplay = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Format date to ISO string (YYYY-MM-DD)
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get relative time (e.g., "2 days ago", "in 3 hours")
export const getRelativeTime = (date: Date): string => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const value = Math.floor(diffInSeconds / (secondsInUnit as number));
    if (Math.abs(value) >= 1) {
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
    }
  }
  
  return "just now";
};

// Parse date from display format to a Date object
export const parseDateFromDisplay = (dateStr: string): Date => {
  // Handle empty or invalid input
  if (!dateStr) return new Date();
  
  // Try parsing with built-in Date parser
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Fallback to current date if parsing fails
  return new Date();
};

// Format date for API calls (YYYY-MM-DD)
export const formatDateForApi = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

// Validate date string format
export const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  // Try parsing the date
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Format date with time (e.g., "Jan 15, 2023 14:30")
export const formatDateWithTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get start of month date
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get end of month date
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};
