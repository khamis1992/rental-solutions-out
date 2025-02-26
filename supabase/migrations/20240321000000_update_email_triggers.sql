
-- Update the process_email_rule_triggers function to only handle new records
CREATE OR REPLACE FUNCTION public.process_email_rule_triggers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    rule RECORD;
    should_trigger BOOLEAN;
    current_cutoff TIMESTAMP;
BEGIN
    -- Set cutoff timestamp to current time
    current_cutoff := CURRENT_TIMESTAMP;

    -- Loop through all active rules
    FOR rule IN 
        SELECT * FROM email_automation_rules 
        WHERE is_active = true
    LOOP
        should_trigger := false;
        
        -- Check each rule type and only trigger for new records
        CASE rule.trigger_type
            -- Welcome trigger - only for new customers
            WHEN 'welcome' THEN
                IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' AND
                   NEW.created_at >= current_cutoff THEN
                    should_trigger := true;
                END IF;
            
            -- Contract signing trigger    
            WHEN 'contract_confirmation' THEN
                IF TG_TABLE_NAME = 'leases' AND 
                   TG_OP = 'INSERT' AND
                   NEW.created_at >= current_cutoff THEN
                    should_trigger := true;
                END IF;
            
            -- Payment reminder trigger
            WHEN 'payment_reminder' THEN
                IF TG_TABLE_NAME = 'unified_payments' AND 
                   NEW.status = 'pending' AND
                   NEW.due_date IS NOT NULL AND
                   NEW.created_at >= current_cutoff AND
                   NEW.due_date - CURRENT_TIMESTAMP <= (rule.timing_value || ' days')::interval THEN
                    should_trigger := true;
                END IF;
            
            -- Late payment trigger    
            WHEN 'late_payment' THEN
                IF TG_TABLE_NAME = 'unified_payments' AND 
                   NEW.status = 'pending' AND
                   NEW.created_at >= current_cutoff AND
                   NEW.days_overdue > 0 THEN
                    should_trigger := true;
                END IF;
            
            -- Insurance renewal trigger    
            WHEN 'insurance_renewal' THEN
                IF TG_TABLE_NAME = 'vehicle_insurance' AND 
                   NEW.created_at >= current_cutoff AND
                   NEW.end_date - CURRENT_TIMESTAMP <= (rule.timing_value || ' days')::interval THEN
                    should_trigger := true;
                END IF;
            
            -- Legal notice trigger    
            WHEN 'legal_notice' THEN
                IF TG_TABLE_NAME = 'unified_payments' AND 
                   NEW.status = 'pending' AND
                   NEW.created_at >= current_cutoff AND
                   NEW.days_overdue >= 30 THEN
                    should_trigger := true;
                END IF;
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

-- Update relevant triggers if they exist
DROP TRIGGER IF EXISTS email_rules_leases_trigger ON leases;
DROP TRIGGER IF EXISTS email_rules_payments_trigger ON unified_payments;
DROP TRIGGER IF EXISTS email_rules_insurance_trigger ON vehicle_insurance;

-- Recreate the triggers
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
