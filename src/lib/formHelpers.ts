
/**
 * Converts any Date object to a properly formatted ISO string for Supabase
 * This handles the common error: "Argument of type 'string' is not assignable to parameter of type 'Date'"
 */
export function formatDateToISO(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  // If it's already a string, return it
  if (typeof date === 'string') return date;
  
  // Convert Date to ISO string
  return date.toISOString();
}

/**
 * Handles form inputs for datetime-local by converting to proper format
 */
export function formatDateTimeInput(input: string | null | undefined): string | null {
  if (!input) return null;
  
  try {
    // Create a Date object from the HTML date input value
    const date = new Date(input);
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Return ISO string
    return date.toISOString();
  } catch (error) {
    console.error("Error formatting datetime input:", error);
    return null;
  }
}

/**
 * Creates a properly formatted call log for Supabase
 * This resolves the type error with call log insertion
 */
export function createCallLogPayload(data: {
  duration: number;
  type?: 'incoming' | 'outgoing';
  status?: 'completed' | 'scheduled' | 'missed';
  notes?: string;
  scheduled_for?: string;
  lead_id: string;
  follow_up_needed?: boolean;
  follow_up_date?: string;
}): Record<string, any> {
  return {
    duration: data.duration,
    type: data.type || 'outgoing',
    status: data.status || 'completed',
    notes: data.notes || null,
    scheduled_for: data.scheduled_for ? formatDateTimeInput(data.scheduled_for) : null,
    lead_id: data.lead_id,
    follow_up_needed: data.follow_up_needed || false,
    follow_up_date: data.follow_up_needed && data.follow_up_date
      ? formatDateTimeInput(data.follow_up_date)
      : null
  };
}

/**
 * Formats a date for loyalty program reward expiry
 */
export function createExpiryDate(monthsFromNow = 3): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toISOString();
}
