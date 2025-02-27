
// Types for custom Supabase tables that aren't directly typed
export const CUSTOM_TABLES = {
  EMAIL_SENDING_METRICS: 'email_sending_metrics',
  EMAIL_OPT_OUTS: 'email_opt_outs',
  EMAIL_SYSTEM_SETTINGS: 'email_system_settings',
  LATEST_USER_LOCATIONS: 'latest_user_locations',
  AUDIT_LOGS_WITH_USERS: 'audit_logs_with_users'
} as const;

export type CustomTable = typeof CUSTOM_TABLES[keyof typeof CUSTOM_TABLES];

// Email metrics
export interface EmailMetrics {
  total_sent: number;
  failed_sent: number;
  rate_limited_count: number;
  date_bucket: string;
}

// Email settings
export interface EmailSettings {
  id: string;
  max_retries: number;
  retry_delay_ms: number;
  max_retry_delay_ms: number;
  max_retry_duration_sec: number;
  auto_handle_bounces: boolean;
  auto_unsubscribe_on_bounce: boolean;
  preferred_send_time: string;
  use_preferred_send_time: boolean;
  alert_threshold_percent: number;
  alert_email: string;
}

// Email opt-outs
export interface EmailOptOut {
  id: string;
  email: string;
  opt_out_date: string;
  reason: string;
  source: string;
}

// User call logs
export interface CallLog {
  id: string;
  lead_id: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'missed';
  type: 'incoming' | 'outgoing';
  notes: string | null;
  scheduled_for: string | null;
  follow_up_needed: boolean;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  performed_by: string | null;
  completed_at: string | null;
}

// Used for type compatibility with different data formats
export interface CallLogInput {
  duration: number;
  status?: 'completed' | 'scheduled' | 'missed';
  type?: 'incoming' | 'outgoing';
  notes?: string;
  scheduled_for?: string | Date;
  lead_id: string;
  follow_up_needed?: boolean;
  follow_up_date?: string | Date;
  performed_by?: string;
}
