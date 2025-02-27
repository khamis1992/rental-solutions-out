
-- Create email bounce tracking table
CREATE TABLE IF NOT EXISTS email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  bounce_type TEXT NOT NULL,
  bounce_sub_type TEXT,
  diagnostic_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_bounces_email_idx ON email_bounces(recipient_email);

-- Create function to process bounced emails
CREATE OR REPLACE FUNCTION process_email_bounce(
  p_recipient_email TEXT,
  p_bounce_type TEXT,
  p_bounce_sub_type TEXT,
  p_diagnostic_code TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Record the bounce
  INSERT INTO email_bounces (
    recipient_email,
    bounce_type,
    bounce_sub_type,
    diagnostic_code
  )
  VALUES (
    LOWER(p_recipient_email),
    p_bounce_type,
    p_bounce_sub_type,
    p_diagnostic_code
  );
  
  -- Handle the bounce based on type
  IF p_bounce_type = 'Permanent' THEN
    -- Handle hard bounce - add to opt-out list
    INSERT INTO email_opt_outs (
      email,
      reason,
      source
    )
    VALUES (
      LOWER(p_recipient_email),
      'Hard bounce: ' || COALESCE(p_bounce_sub_type, '') || ' - ' || COALESCE(p_diagnostic_code, ''),
      'bounce'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Update any pending emails to this recipient
    UPDATE email_notification_queue
    SET 
      status = 'failed',
      error_message = 'Recipient email has hard bounced'
    WHERE 
      recipient_email = LOWER(p_recipient_email)
      AND status = 'pending';
  END IF;
  
  -- Update metrics
  UPDATE email_sending_metrics
  SET 
    failed_sent = failed_sent + 1
  WHERE date_bucket = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle SMTP or API responses 
CREATE OR REPLACE FUNCTION handle_email_response(
  p_message_id TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update the email notification log
  UPDATE email_notification_logs
  SET 
    status = p_status,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{response}',
      COALESCE(p_details, '{}'::jsonb)
    ),
    updated_at = now()
  WHERE message_id = p_message_id;
  
  -- Update metrics based on status
  IF p_status = 'delivered' THEN
    -- No action needed, already counted as successful
    NULL;
  ELSIF p_status = 'opened' THEN
    -- Track email open
    INSERT INTO email_opens (message_id)
    VALUES (p_message_id)
    ON CONFLICT (message_id) DO NOTHING;
  ELSIF p_status = 'clicked' THEN
    -- Track email click
    INSERT INTO email_clicks (
      message_id,
      link_url
    )
    VALUES (
      p_message_id,
      p_details->>'link_url'
    )
    ON CONFLICT (message_id) DO NOTHING;
  ELSIF p_status IN ('bounced', 'rejected', 'failed') THEN
    -- Count as failure
    UPDATE email_sending_metrics
    SET 
      failed_sent = failed_sent + 1
    WHERE date_bucket = CURRENT_DATE;
    
    -- If it's a bounce, process it
    IF p_status = 'bounced' AND p_details->>'recipient' IS NOT NULL THEN
      PERFORM process_email_bounce(
        p_details->>'recipient',
        p_details->>'bounce_type',
        p_details->>'bounce_sub_type',
        p_details->>'diagnostic_code'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create email metrics tables
CREATE TABLE IF NOT EXISTS email_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL UNIQUE,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  location JSONB
);

CREATE TABLE IF NOT EXISTS email_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  location JSONB,
  UNIQUE(message_id, link_url)
);
