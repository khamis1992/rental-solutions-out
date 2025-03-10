
-- Function to create missing payment records for historical agreements
CREATE OR REPLACE FUNCTION public.generate_missing_payment_records()
 RETURNS SETOF leases_missing_payments
 LANGUAGE plpgsql
AS $function$
DECLARE
    agreement_record RECORD;
    schedule_start DATE;
    schedule_end DATE;
    current_month DATE;
    month_diff INTEGER;
    dueDay INTEGER;
    i INTEGER;
    created_records INTEGER := 0;
    processed_leases INTEGER := 0;
    v_result leases_missing_payments;
BEGIN
    -- Process each active agreement
    FOR agreement_record IN 
        SELECT 
            l.id,
            l.agreement_number,
            l.rent_amount,
            l.daily_late_fee,
            l.start_date,
            COALESCE(l.rent_due_day, 1) AS rent_due_day
        FROM leases l
        WHERE l.status = 'active'
        AND l.start_date IS NOT NULL
        AND l.start_date <= CURRENT_DATE
    LOOP
        processed_leases := processed_leases + 1;
        
        -- Calculate start and end dates
        schedule_start := DATE_TRUNC('month', agreement_record.start_date::date);
        schedule_end := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
        dueDay := COALESCE(agreement_record.rent_due_day, 1);
        
        -- Calculate number of months to process
        month_diff := EXTRACT(YEAR FROM schedule_end) * 12 + EXTRACT(MONTH FROM schedule_end) - 
                     (EXTRACT(YEAR FROM schedule_start) * 12 + EXTRACT(MONTH FROM schedule_start));
        
        -- Create payment schedules for each month if not exists
        FOR i IN 0..month_diff LOOP
            current_month := schedule_start + (i || ' months')::interval;
            
            -- Skip if a schedule already exists for this month
            IF NOT EXISTS (
                SELECT 1
                FROM payment_schedules ps
                WHERE ps.lease_id = agreement_record.id
                AND DATE_TRUNC('month', ps.due_date) = current_month
            ) THEN
                -- Create payment schedule record
                INSERT INTO payment_schedules (
                    lease_id,
                    amount,
                    due_date,
                    status,
                    description
                ) VALUES (
                    agreement_record.id,
                    agreement_record.rent_amount,
                    (current_month + ((dueDay-1) || ' days')::interval)::date,
                    'pending',
                    'Auto-generated payment schedule for ' || TO_CHAR(current_month, 'Month YYYY')
                );
                
                created_records := created_records + 1;
            END IF;
            
            -- For past months, check if payment exists
            IF current_month < DATE_TRUNC('month', CURRENT_DATE) THEN
                -- Check if a payment record exists for this month
                IF NOT EXISTS (
                    SELECT 1
                    FROM unified_payments up
                    WHERE up.lease_id = agreement_record.id
                    AND (
                        (up.type = 'Income' AND DATE_TRUNC('month', COALESCE(up.payment_date, up.original_due_date)) = current_month)
                        OR 
                        (up.type = 'LATE_PAYMENT_FEE' AND DATE_TRUNC('month', up.original_due_date) = current_month)
                    )
                ) THEN
                    -- Calculate appropriate days overdue based on month
                    DECLARE
                        v_days_overdue INTEGER;
                        v_late_fee_amount NUMERIC;
                        v_months_ago INTEGER;
                    BEGIN
                        -- Calculate how many months ago this was
                        v_months_ago := EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 
                                      (EXTRACT(YEAR FROM current_month) * 12 + EXTRACT(MONTH FROM current_month));
                        
                        -- For recent months (1-3 months ago), use actual days in month
                        IF v_months_ago <= 3 THEN
                            v_days_overdue := EXTRACT(DAY FROM 
                                (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') -- Last day of previous month
                                - current_month);
                        ELSE
                            -- For older months, use a standard 30 days
                            v_days_overdue := 30;
                        END IF;
                        
                        -- Calculate late fee based on days overdue
                        v_late_fee_amount := v_days_overdue * COALESCE(agreement_record.daily_late_fee, 120);

                        -- No payment exists, create late fee record
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
                        ) VALUES (
                            agreement_record.id,
                            agreement_record.rent_amount,
                            0, -- No payment made
                            agreement_record.rent_amount, -- Full balance due
                            NULL, -- No payment date
                            'pending',
                            'Auto-generated late payment record for ' || TO_CHAR(current_month, 'Month YYYY'),
                            'LATE_PAYMENT_FEE',
                            v_late_fee_amount,
                            v_days_overdue,
                            (current_month + ((dueDay-1) || ' days')::interval)::date
                        );
                        
                        created_records := created_records + 1;
                    END;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Return records from the view to show status
    FOR v_result IN 
        SELECT * FROM leases_missing_payments
    LOOP
        RETURN NEXT v_result;
    END LOOP;
    
    -- If no records to return, at least return processing counts
    IF NOT FOUND THEN
        v_result.agreement_number := 'PROCESSING_SUMMARY';
        v_result.status_description := 'Processed ' || processed_leases || ' leases, created ' || created_records || ' records';
        RETURN NEXT v_result;
    END IF;
    
    RETURN;
END;
$function$;

-- Create a more comprehensive view for tracking leases with missing payment records
DROP VIEW IF EXISTS public.leases_missing_payments;
CREATE VIEW public.leases_missing_payments AS
SELECT 
    l.id,
    l.agreement_number,
    l.status,
    l.rent_amount,
    l.start_date,
    DATE_TRUNC('month', CURRENT_DATE) AS current_month,
    (
        SELECT COUNT(*)
        FROM payment_schedules ps
        WHERE ps.lease_id = l.id
    ) AS schedule_count,
    (
        SELECT COUNT(*)
        FROM unified_payments up
        WHERE up.lease_id = l.id
        AND up.type = 'Income'
    ) AS payment_count,
    (
        SELECT COUNT(DISTINCT DATE_TRUNC('month', ps.due_date))
        FROM payment_schedules ps
        WHERE ps.lease_id = l.id
    ) AS distinct_months_scheduled,
    (
        SELECT COUNT(DISTINCT DATE_TRUNC('month', COALESCE(up.payment_date, up.original_due_date)))
        FROM unified_payments up
        WHERE up.lease_id = l.id
        AND up.type IN ('Income', 'LATE_PAYMENT_FEE')
    ) AS distinct_months_paid,
    (
        CASE 
            WHEN l.start_date IS NULL THEN 0
            ELSE EXTRACT(YEAR FROM age(CURRENT_DATE, l.start_date)) * 12 + 
                EXTRACT(MONTH FROM age(CURRENT_DATE, l.start_date)) + 1
        END
    ) AS total_months_due,
    CASE 
        WHEN l.start_date IS NULL THEN 'Missing start date'
        WHEN (
            SELECT COUNT(*)
            FROM payment_schedules ps
            WHERE ps.lease_id = l.id
        ) = 0 THEN 'Missing payment schedules'
        WHEN (
            SELECT COUNT(DISTINCT DATE_TRUNC('month', COALESCE(up.payment_date, up.original_due_date)))
            FROM unified_payments up
            WHERE up.lease_id = l.id
            AND up.type IN ('Income', 'LATE_PAYMENT_FEE')
        ) < (
            CASE 
                WHEN l.start_date IS NULL THEN 0
                ELSE EXTRACT(YEAR FROM age(CURRENT_DATE, l.start_date)) * 12 + 
                    EXTRACT(MONTH FROM age(CURRENT_DATE, l.start_date)) + 1
            END
        ) THEN 'Missing payments'
        ELSE 'OK'
    END AS status_description
FROM leases l
WHERE l.status = 'active'
AND (
    l.start_date IS NULL
    OR
    (
        SELECT COUNT(DISTINCT DATE_TRUNC('month', COALESCE(up.payment_date, up.original_due_date)))
        FROM unified_payments up
        WHERE up.lease_id = l.id
        AND up.type IN ('Income', 'LATE_PAYMENT_FEE')
    ) < (
        CASE 
            WHEN l.start_date IS NULL THEN 0
            ELSE EXTRACT(YEAR FROM age(CURRENT_DATE, l.start_date)) * 12 + 
                EXTRACT(MONTH FROM age(CURRENT_DATE, l.start_date)) + 1
        END
    )
);

-- Manually run the function once to create all missing records
SELECT generate_missing_payment_records();
