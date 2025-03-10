
-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run at midnight on the 1st of every month
SELECT cron.schedule(
  'process-monthly-rent-payments',
  '0 0 1 * *',
  $$
  SELECT net.http_post(
    url:='https://vqdlsidkucrownbfuouq.supabase.co/functions/v1/process-rent-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Add cron job to run at midnight on the 25th of every month to prepare next month's payments
SELECT cron.schedule(
  'process-rent-schedules',
  '0 0 25 * *',
  $$
  SELECT net.http_post(
    url:='https://vqdlsidkucrownbfuouq.supabase.co/functions/v1/process-rent-schedules',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Add another cron job to run daily to update overdue payment calculations
SELECT cron.schedule(
  'update-late-fees',
  '0 1 * * *', -- Run at 1 AM every day
  $$
  SELECT process_overdue_rentals();
  $$
);

-- Update the process_overdue_rentals function to handle daily updates
CREATE OR REPLACE FUNCTION public.process_overdue_rentals()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    first_of_month DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    today DATE := CURRENT_DATE;
    days_passed INTEGER;
BEGIN
    -- Calculate how many days have passed in the current month
    days_passed := EXTRACT(DAY FROM today) - 1;
    
    -- Only proceed if we have at least one day passed (after the 1st)
    IF days_passed > 0 THEN
        -- For each active agreement that hasn't paid this month
        INSERT INTO unified_payments (
            lease_id,
            amount,
            amount_paid,
            balance,
            payment_date,
            status,
            description,
            type,
            late_fine_amount,
            days_overdue,
            original_due_date
        )
        SELECT 
            l.id,
            l.rent_amount,
            0, -- No payment made
            l.rent_amount, -- Full balance due
            NULL, -- No payment date
            'pending'::text,
            'Auto-generated late payment record for ' || to_char(first_of_month, 'Month YYYY'),
            'LATE_PAYMENT_FEE',
            days_passed * COALESCE(l.daily_late_fee, 120), -- Calculate late fee based on days passed
            days_passed,
            first_of_month
        FROM leases l
        LEFT JOIN unified_payments up ON 
            l.id = up.lease_id AND 
            up.payment_date >= first_of_month AND 
            up.payment_date < first_of_month + INTERVAL '1 month' AND
            up.type = 'Income'
        WHERE l.status = 'active'
        AND up.id IS NULL -- No payment made this month
        AND NOT EXISTS ( -- Ensure we don't duplicate auto-generated records
            SELECT 1 FROM unified_payments 
            WHERE lease_id = l.id 
            AND type = 'LATE_PAYMENT_FEE'
            AND original_due_date = first_of_month
        );
        
        -- Update existing late fee records with current days_overdue calculation
        UPDATE unified_payments
        SET 
            days_overdue = days_passed,
            late_fine_amount = days_passed * COALESCE(
                (SELECT daily_late_fee FROM leases WHERE id = lease_id),
                120
            )
        WHERE 
            type = 'LATE_PAYMENT_FEE' 
            AND original_due_date = first_of_month
            AND days_overdue < days_passed;
    END IF;
END;
$function$;
