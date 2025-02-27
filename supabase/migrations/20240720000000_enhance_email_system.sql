
-- Create email system settings table
CREATE TABLE IF NOT EXISTS email_system_settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  max_retries INTEGER NOT NULL DEFAULT 5,
  retry_delay_ms INTEGER NOT NULL DEFAULT 200,
  max_retry_delay_ms INTEGER NOT NULL DEFAULT 30000,
  max_retry_duration_sec INTEGER NOT NULL DEFAULT 86400, -- 24 hours
  auto_handle_bounces BOOLEAN NOT NULL DEFAULT true,
  auto_unsubscribe_on_bounce BOOLEAN NOT NULL DEFAULT true,
  preferred_send_time TEXT DEFAULT '09:00',
  use_preferred_send_time BOOLEAN NOT NULL DEFAULT false,
  alert_threshold_percent INTEGER NOT NULL DEFAULT 20,
  alert_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email opt-outs table
CREATE TABLE IF NOT EXISTS email_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  opt_out_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  source TEXT, -- 'user', 'bounce', 'admin', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_opt_outs_email_idx ON email_opt_outs(email);

-- Create email sending metrics table if not exists
CREATE TABLE IF NOT EXISTS email_sending_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sent INTEGER NOT NULL DEFAULT 0,
  successful_sent INTEGER NOT NULL DEFAULT 0,
  failed_sent INTEGER NOT NULL DEFAULT 0,
  rate_limited_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date_bucket)
);

-- Create email system alerts table
CREATE TABLE IF NOT EXISTS email_system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('warning', 'critical')),
  message TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create or replace function to increment email metrics
CREATE OR REPLACE FUNCTION increment_email_metric(p_metric_type TEXT, p_count INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO email_sending_metrics (date_bucket, total_sent, successful_sent, failed_sent, rate_limited_count)
  VALUES (
    CURRENT_DATE,
    CASE WHEN p_metric_type = 'total_sent' THEN p_count ELSE 0 END,
    CASE WHEN p_metric_type = 'successful_sent' THEN p_count ELSE 0 END,
    CASE WHEN p_metric_type = 'failed_sent' THEN p_count ELSE 0 END,
    CASE WHEN p_metric_type = 'rate_limited_count' THEN p_count ELSE 0 END
  )
  ON CONFLICT (date_bucket) 
  DO UPDATE SET
    total_sent = email_sending_metrics.total_sent + 
      CASE WHEN p_metric_type = 'total_sent' THEN p_count ELSE 0 END,
    successful_sent = email_sending_metrics.successful_sent + 
      CASE WHEN p_metric_type = 'successful_sent' THEN p_count ELSE 0 END,
    failed_sent = email_sending_metrics.failed_sent + 
      CASE WHEN p_metric_type = 'failed_sent' THEN p_count ELSE 0 END,
    rate_limited_count = email_sending_metrics.rate_limited_count + 
      CASE WHEN p_metric_type = 'rate_limited_count' THEN p_count ELSE 0 END,
    updated_at = now();
  
  -- Also increment total_sent metric for successful, failed, and rate limited counts
  IF p_metric_type IN ('successful_sent', 'failed_sent', 'rate_limited_count') THEN
    UPDATE email_sending_metrics
    SET total_sent = total_sent + p_count
    WHERE date_bucket = CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle bounced emails
CREATE OR REPLACE FUNCTION handle_email_bounce(p_email TEXT, p_bounce_type TEXT, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
  v_settings RECORD;
BEGIN
  -- Get settings
  SELECT * INTO v_settings FROM email_system_settings LIMIT 1;
  
  -- If auto-unsubscribe is enabled and it's a hard bounce
  IF v_settings.auto_unsubscribe_on_bounce AND p_bounce_type = 'hard' THEN
    -- Add to opt-out list
    INSERT INTO email_opt_outs (email, reason, source)
    VALUES (p_email, p_reason, 'bounce')
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  -- Record bounce metrics
  UPDATE email_sending_metrics
  SET 
    failed_sent = failed_sent + 1,
    updated_at = now()
  WHERE date_bucket = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Add initial values to settings
INSERT INTO email_system_settings (id)
VALUES ('1')
ON CONFLICT (id) DO NOTHING;
