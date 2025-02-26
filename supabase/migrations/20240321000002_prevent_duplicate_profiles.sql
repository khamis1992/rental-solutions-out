
-- Add a unique constraint on email in profiles table
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_email UNIQUE (email);

-- Create a table to track welcome emails sent by email address
CREATE TABLE IF NOT EXISTS public.welcome_email_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update the process_email_rule_triggers function to check welcome_email_tracking
CREATE OR REPLACE FUNCTION public.process_email_rule_triggers()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    rule RECORD;
    should_trigger BOOLEAN;
    current_cutoff TIMESTAMP;
    last_sent TIMESTAMPTZ;
BEGIN
    -- Get the last email sent timestamp with row lock
    SELECT last_email_sent INTO last_sent
    FROM email_rate_limiting
    WHERE id = '00000000-0000-0000-0000-000000000000'
    FOR UPDATE;

    -- If less than 0.5 seconds has passed since last email, skip this trigger
    IF last_sent + INTERVAL '500 milliseconds' > NOW() THEN
        RETURN NEW;
    END IF;

    -- Update the last sent timestamp
    UPDATE email_rate_limiting
    SET last_email_sent = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000000';

    -- Set cutoff timestamp
    current_cutoff := CURRENT_TIMESTAMP;

    -- Loop through active rules
    FOR rule IN 
        SELECT * FROM email_automation_rules 
        WHERE is_active = true
    LOOP
        should_trigger := false;
        
        -- Check rule type
        CASE rule.trigger_type
            WHEN 'welcome' THEN
                IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' AND
                   NOT EXISTS (
                       SELECT 1 FROM welcome_email_tracking
                       WHERE email = NEW.email
                   ) THEN
                    should_trigger := true;
                    
                    -- Insert into welcome_email_tracking atomically
                    INSERT INTO welcome_email_tracking (email)
                    VALUES (NEW.email)
                    ON CONFLICT (email) DO NOTHING;
                END IF;
            
            -- ... keep existing code for other trigger types
            
        END CASE;

        -- If rule should trigger, create notification
        IF should_trigger THEN
            INSERT INTO email_notification_queue (
                template_id,
                rule_id,
                recipient_id,
                recipient_email,
                scheduled_for,
                status,
                metadata,
                attempts,
                last_attempt
            )
            SELECT 
                rule.template_id,
                rule.id,
                CASE 
                    WHEN TG_TABLE_NAME = 'profiles' THEN NEW.id
                    WHEN TG_TABLE_NAME = 'leases' THEN NEW.customer_id
                    WHEN TG_TABLE_NAME = 'unified_payments' THEN (SELECT customer_id FROM leases WHERE id = NEW.lease_id)
                    WHEN TG_TABLE_NAME = 'vehicle_insurance' THEN (
                        SELECT l.customer_id 
                        FROM leases l 
                        WHERE l.vehicle_id = NEW.vehicle_id 
                        AND l.status = 'active'
                        LIMIT 1
                    )
                END,
                CASE 
                    WHEN TG_TABLE_NAME = 'profiles' THEN NEW.email
                    ELSE (
                        SELECT p.email 
                        FROM profiles p 
                        WHERE p.id = CASE 
                            WHEN TG_TABLE_NAME = 'leases' THEN NEW.customer_id
                            WHEN TG_TABLE_NAME = 'unified_payments' THEN (SELECT customer_id FROM leases WHERE id = NEW.lease_id)
                            WHEN TG_TABLE_NAME = 'vehicle_insurance' THEN (
                                SELECT l.customer_id 
                                FROM leases l 
                                WHERE l.vehicle_id = NEW.vehicle_id 
                                AND l.status = 'active'
                                LIMIT 1
                            )
                        END
                    )
                END,
                CURRENT_TIMESTAMP,
                'pending',
                jsonb_build_object(
                    'trigger_type', rule.trigger_type,
                    'source_table', TG_TABLE_NAME,
                    'source_id', NEW.id
                ),
                0,
                NULL;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- Insert initial rate limiting record if it doesn't exist
INSERT INTO email_rate_limiting (id, last_email_sent)
VALUES ('00000000-0000-0000-0000-000000000000', NOW())
ON CONFLICT (id) DO NOTHING;

-- Function to handle merging duplicate profiles
CREATE OR REPLACE FUNCTION public.merge_duplicate_profiles(target_profile_id UUID, source_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update all references from source to target profile
    UPDATE leases SET customer_id = target_profile_id WHERE customer_id = source_profile_id;
    UPDATE unified_payments SET recipient_id = target_profile_id WHERE recipient_id = source_profile_id;
    UPDATE legal_cases SET customer_id = target_profile_id WHERE customer_id = source_profile_id;
    UPDATE customer_notes SET customer_id = target_profile_id WHERE customer_id = source_profile_id;
    
    -- Mark the source profile as merged
    UPDATE profiles 
    SET merged_into = target_profile_id,
        status = 'merged'
    WHERE id = source_profile_id;
END;
$$;

