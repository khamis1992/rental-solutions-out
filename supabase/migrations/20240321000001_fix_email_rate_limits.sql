
-- Add a new table to track email sends to prevent duplicates
CREATE TABLE IF NOT EXISTS public.email_send_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL,
    trigger_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(recipient_id, trigger_type, source_id)
);

-- Update the process_email_rule_triggers function with rate limiting and deduplication
CREATE OR REPLACE FUNCTION public.process_email_rule_triggers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    rule RECORD;
    should_trigger BOOLEAN;
    current_cutoff TIMESTAMP;
    recent_email_count INTEGER;
BEGIN
    -- Set cutoff timestamp to current time
    current_cutoff := CURRENT_TIMESTAMP;

    -- Check if we've sent too many emails in the last second (rate limiting)
    SELECT COUNT(*) INTO recent_email_count
    FROM email_notification_queue
    WHERE created_at >= NOW() - INTERVAL '1 second';

    -- If we've sent more than 1 email in the last second, delay this one
    IF recent_email_count >= 1 THEN
        -- Add a small delay to prevent rate limiting
        PERFORM pg_sleep(1);
    END IF;

    -- Loop through all active rules
    FOR rule IN 
        SELECT * FROM email_automation_rules 
        WHERE is_active = true
    LOOP
        should_trigger := false;
        
        -- Check each rule type and only trigger for new records
        CASE rule.trigger_type
            WHEN 'welcome' THEN
                IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' AND
                   NEW.created_at >= current_cutoff AND
                   NOT EXISTS (
                       SELECT 1 FROM email_send_tracking
                       WHERE recipient_id = NEW.id
                       AND trigger_type = 'welcome'
                       AND source_id = NEW.id
                   ) THEN
                    should_trigger := true;
                END IF;
            
            -- ... keep existing code (other WHEN clauses for different trigger types)
            
        END CASE;

        -- If rule should trigger, create notification and tracking record
        IF should_trigger THEN
            -- First insert tracking record
            INSERT INTO email_send_tracking (
                recipient_id,
                trigger_type,
                source_id
            )
            VALUES (
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
                rule.trigger_type,
                NEW.id
            );

            -- Then queue the email
            INSERT INTO email_notification_queue (
                template_id,
                rule_id,
                recipient_id,
                recipient_email,
                scheduled_for,
                status,
                metadata
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
                CASE
                    WHEN rule.timing_type = 'before' THEN 
                        CASE 
                            WHEN TG_TABLE_NAME = 'unified_payments' THEN NEW.due_date - (rule.timing_value || ' days')::interval
                            WHEN TG_TABLE_NAME = 'vehicle_insurance' THEN NEW.end_date - (rule.timing_value || ' days')::interval
                            ELSE CURRENT_TIMESTAMP
                        END
                    WHEN rule.timing_type = 'after' THEN 
                        CURRENT_TIMESTAMP + (rule.timing_value || ' days')::interval
                    ELSE CURRENT_TIMESTAMP
                END,
                'pending',
                jsonb_build_object(
                    'trigger_type', rule.trigger_type,
                    'source_table', TG_TABLE_NAME,
                    'source_id', NEW.id
                );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$function$;

-- Update triggers to use the new function
DROP TRIGGER IF EXISTS email_rules_leases_trigger ON leases;
DROP TRIGGER IF EXISTS email_rules_payments_trigger ON unified_payments;
DROP TRIGGER IF EXISTS email_rules_insurance_trigger ON vehicle_insurance;

CREATE TRIGGER email_rules_leases_trigger
    AFTER INSERT OR UPDATE ON leases
    FOR EACH ROW
    EXECUTE FUNCTION process_email_rule_triggers();

CREATE TRIGGER email_rules_payments_trigger
    AFTER INSERT OR UPDATE ON unified_payments
    FOR EACH ROW
    EXECUTE FUNCTION process_email_rule_triggers();

CREATE TRIGGER email_rules_insurance_trigger
    AFTER INSERT OR UPDATE ON vehicle_insurance
    FOR EACH ROW
    EXECUTE FUNCTION process_email_rule_triggers();
