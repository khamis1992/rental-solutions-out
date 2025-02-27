
/**
 * Convert a date to display format
 */
export function formatDateToDisplay(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for Supabase insertion
 */
export function formatDateForSupabase(date: Date | string | null): string | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format date for API requests
 */
export function formatDateForApi(date: Date | string | null): string | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Handle date input from HTML inputs
 */
export function handleHtmlDateInput(input: string): Date {
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input');
  }
  return date;
}

/**
 * Get relative time string (e.g. "2 days ago")
 */
export function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.abs(now.getTime() - then.getTime());
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Check if a string is a valid date format (DD/MM/YYYY)
 */
export function isValidDateFormat(dateString: string): boolean {
  // Check for DD/MM/YYYY format
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateString)) return false;
  
  const parts = dateString.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  // Create date object and check if the date is valid
  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/**
 * Parse date from display format (DD/MM/YYYY) to Date object
 */
export function parseDateFromDisplay(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Handle different display formats
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    // For DD/MM/YYYY format
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day);
        if (date instanceof Date && !isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }
  
  // Try standard parsing for other formats
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date : null;
}

/**
 * Format date from JavaScript Date to display format (DD/MM/YYYY)
 */
export function formatToDisplayDate(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // Convert both dates to milliseconds
  const d1Ms = d1.getTime();
  const d2Ms = d2.getTime();
  
  // Calculate the difference in milliseconds
  const differenceMs = Math.abs(d1Ms - d2Ms);
  
  // Convert back to days and return
  return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is within a certain range
 */
export function isDateInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return d >= start && d <= end;
}
