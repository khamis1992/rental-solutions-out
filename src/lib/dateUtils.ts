
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
