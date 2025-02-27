
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
