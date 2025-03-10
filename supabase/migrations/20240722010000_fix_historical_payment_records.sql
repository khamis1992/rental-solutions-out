
-- Function to create missing payment records for historical agreements
CREATE OR REPLACE FUNCTION public.generate_missing_payment_records()
 RETURNS void
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
            END IF;
            
            -- For past months, check if payment exists
            IF current_month < DATE_TRUNC('month', CURRENT_DATE) THEN
                -- Check if a payment record exists for this month
                IF NOT EXISTS (
                    SELECT 1
                    FROM unified_payments up
                    WHERE up.lease_id = agreement_record.id
                    AND DATE_TRUNC('month', up.payment_date) = current_month
                    AND up.type = 'Income'
                ) AND NOT EXISTS (
                    SELECT 1
                    FROM unified_payments up
                    WHERE up.lease_id = agreement_record.id
                    AND up.original_due_date = (current_month + ((dueDay-1) || ' days')::interval)::date
                    AND up.type = 'LATE_PAYMENT_FEE'
                ) THEN
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
                        30 * COALESCE(agreement_record.daily_late_fee, 120), -- 30 days of late fees for past months
                        30, -- Assume 30 days overdue for historical records
                        (current_month + ((dueDay-1) || ' days')::interval)::date
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$function$;

-- Create a more comprehensive view for tracking leases with missing payment records
CREATE OR REPLACE VIEW leases_missing_payments AS
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
    CASE 
        WHEN l.start_date IS NULL THEN 'Missing start date'
        WHEN (
            SELECT COUNT(*)
            FROM payment_schedules ps
            WHERE ps.lease_id = l.id
        ) = 0 THEN 'Missing payment schedules'
        WHEN (
            SELECT COUNT(*)
            FROM unified_payments up
            WHERE up.lease_id = l.id
            AND up.type = 'Income'
        ) = 0 AND l.status = 'active' AND l.start_date <= CURRENT_DATE - INTERVAL '1 month' 
        THEN 'Missing payments'
        ELSE 'OK'
    END AS status_description
FROM leases l
WHERE l.status = 'active'
AND (
    (
        SELECT COUNT(*)
        FROM payment_schedules ps
        WHERE ps.lease_id = l.id
    ) = 0
    OR
    (
        (
            SELECT COUNT(*)
            FROM unified_payments up
            WHERE up.lease_id = l.id
            AND up.type = 'Income'
        ) = 0
        AND l.status = 'active'
        AND l.start_date <= CURRENT_DATE - INTERVAL '1 month'
    )
);

-- Manually run the function once to create all missing records
SELECT generate_missing_payment_records();

-- Update the get_pending_payments_report function to better handle past due amounts
CREATE OR REPLACE FUNCTION public.get_pending_payments_report()
 RETURNS TABLE(agreement_number text, customer_name text, id_number text, phone_number text, pending_rent_amount numeric, late_fine_amount numeric, traffic_fine_amount numeric, total_amount numeric, license_plate text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  first_of_month date := date_trunc('month', current_date)::date;
BEGIN
  RETURN QUERY
  WITH active_agreements AS (
    -- Get all active agreements with customer and vehicle info
    SELECT 
      l.id AS lease_id,
      l.agreement_number,
      l.rent_amount,
      l.daily_late_fee,
      p.full_name AS customer_name,
      p.driver_license AS id_number,
      p.phone_number,
      v.license_plate,
      l.start_date
    FROM leases l
    JOIN profiles p ON l.customer_id = p.id
    JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.status = 'active'
  ),
  payments_this_month AS (
    -- Calculate payments made this month
    SELECT 
      up.lease_id,
      COALESCE(SUM(up.amount_paid) FILTER (WHERE up.type = 'Income'), 0) AS total_paid
    FROM unified_payments up
    WHERE up.payment_date >= first_of_month
      AND up.payment_date < first_of_month + interval '1 month'
    GROUP BY up.lease_id
  ),
  active_late_fees AS (
    -- Get current late fees (for all months - better handling of historical)
    SELECT
      up.lease_id,
      SUM(up.late_fine_amount) as total_late_fee_amount,
      MAX(up.days_overdue) as max_days_overdue
    FROM unified_payments up
    WHERE up.type = 'LATE_PAYMENT_FEE'
    GROUP BY up.lease_id
  ),
  missing_payment_months AS (
    -- Calculate missing payment months from start date
    SELECT
      a.lease_id,
      GREATEST(0, 
        EXTRACT(YEAR FROM age(current_date, a.start_date)) * 12 + 
        EXTRACT(MONTH FROM age(current_date, a.start_date)) - 
        COALESCE((
          SELECT COUNT(*)
          FROM unified_payments up
          WHERE up.lease_id = a.lease_id AND up.type = 'Income'
        ), 0)
      ) as missing_months
    FROM active_agreements a
    WHERE a.start_date <= current_date
  ),
  unpaid_traffic_fines AS (
    -- Get unpaid traffic fines
    SELECT
      tf.lease_id,
      COALESCE(SUM(tf.fine_amount), 0) AS total_traffic_fines
    FROM traffic_fines tf
    WHERE tf.payment_status != 'completed'
    GROUP BY tf.lease_id
  )
  SELECT
    a.agreement_number,
    a.customer_name,
    a.id_number,
    a.phone_number,
    -- Pending rent amount (consider both current month and historical missing months)
    GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0)) + 
    (COALESCE(m.missing_months, 0) * a.rent_amount) AS pending_rent_amount,
    -- Late fees from the active_late_fees CTE
    COALESCE(lf.total_late_fee_amount, 0) AS late_fine_amount,
    COALESCE(tf.total_traffic_fines, 0) AS traffic_fine_amount,
    -- Total amount calculation
    GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0)) + 
    (COALESCE(m.missing_months, 0) * a.rent_amount) +
    COALESCE(lf.total_late_fee_amount, 0) + 
    COALESCE(tf.total_traffic_fines, 0) AS total_amount,
    a.license_plate
  FROM active_agreements a
  LEFT JOIN payments_this_month p ON p.lease_id = a.lease_id
  LEFT JOIN active_late_fees lf ON lf.lease_id = a.lease_id
  LEFT JOIN missing_payment_months m ON m.lease_id = a.lease_id
  LEFT JOIN unpaid_traffic_fines tf ON tf.lease_id = a.lease_id
  ORDER BY total_amount DESC;
END;
$function$;
