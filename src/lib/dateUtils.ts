
// Format date to display format (e.g., "Jan 15, 2023")
export const formatDateToDisplay = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format date to ISO string (YYYY-MM-DD)
export const formatDateToISO = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date to ISO:", error);
    return '';
  }
};

// Get relative time (e.g., "2 days ago", "in 3 hours")
export const getRelativeTime = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
    
    const intervals: Record<Intl.RelativeTimeFormatUnit, number> = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
      quarter: 7776000, // Not commonly used but added for completeness
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const value = Math.floor(diffInSeconds / secondsInUnit);
      if (Math.abs(value) >= 1) {
        return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
      }
    }
    
    return "just now";
  } catch (error) {
    console.error("Error calculating relative time:", error);
    return 'N/A';
  }
};

// Parse date from display format to a Date object
export const parseDateFromDisplay = (dateStr: string | null): Date => {
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
export const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return '';
  }
};

// Validate date string format
export const isValidDateFormat = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  
  // Try parsing the date
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Format date with time (e.g., "Jan 15, 2023 14:30")
export const formatDateWithTime = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date with time:", error);
    return 'Invalid Date';
  }
};

// Get start of month date
export const getStartOfMonth = (date: Date | string = new Date()): Date => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  } catch (error) {
    console.error("Error getting start of month:", error);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }
};

// Get end of month date
export const getEndOfMonth = (date: Date | string = new Date()): Date => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
  } catch (error) {
    console.error("Error getting end of month:", error);
    return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  }
};

// Helper function to safely convert a string to Date
export const safelyParseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date : null;
};

// Format date as a relative time or exact date depending on how far in the future/past it is
export const formatDateFriendly = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInDays = Math.abs(Math.floor((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // If date is within 7 days, show relative time
    if (diffInDays <= 7) {
      return getRelativeTime(dateObj);
    }
    
    // Otherwise show formatted date
    return formatDateToDisplay(dateObj);
  } catch (error) {
    console.error("Error formatting friendly date:", error);
    return 'Invalid Date';
  }
};
