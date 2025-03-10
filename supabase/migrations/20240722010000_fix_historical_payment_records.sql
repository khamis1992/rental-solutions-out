
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
                    AND DATE_TRUNC('month', COALESCE(up.payment_date, up.original_due_date)) = current_month
                    AND up.type = 'Income'
                ) AND NOT EXISTS (
                    SELECT 1
                    FROM unified_payments up
                    WHERE up.lease_id = agreement_record.id
                    AND DATE_TRUNC('month', up.original_due_date) = current_month
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

-- Create or replace function to handle payment recording with late fees
CREATE OR REPLACE FUNCTION public.record_payment_with_late_fee(
  p_lease_id uuid,
  p_amount numeric,
  p_amount_paid numeric,
  p_balance numeric,
  p_payment_method text,
  p_description text,
  p_payment_date timestamptz,
  p_late_fine_amount numeric,
  p_days_overdue integer,
  p_original_due_date timestamptz,
  p_existing_late_fee_id uuid
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_payment_id uuid;
  v_payment_schedule_id uuid;
BEGIN
  -- Begin transaction
  BEGIN
    -- Get the current month's payment schedule if it exists
    SELECT id INTO v_payment_schedule_id
    FROM payment_schedules
    WHERE lease_id = p_lease_id
    AND date_trunc('month', due_date) = date_trunc('month', p_original_due_date);
    
    -- Create a regular payment record
    INSERT INTO unified_payments (
      lease_id,
      amount,
      amount_paid,
      balance,
      payment_method,
      description,
      payment_date,
      status,
      type,
      payment_reference,
      original_due_date
    ) VALUES (
      p_lease_id,
      p_amount,
      p_amount_paid,
      p_balance,
      p_payment_method,
      p_description,
      p_payment_date,
      CASE WHEN p_balance <= 0 THEN 'completed' ELSE 'pending' END,
      'Income',
      v_payment_schedule_id,
      p_original_due_date
    )
    RETURNING id INTO v_payment_id;
    
    -- Handle late fee
    IF p_days_overdue > 0 THEN
      IF p_existing_late_fee_id IS NOT NULL THEN
        -- Update existing late fee record
        UPDATE unified_payments
        SET 
          late_fine_amount = p_late_fine_amount,
          days_overdue = p_days_overdue,
          status = 'completed'
        WHERE id = p_existing_late_fee_id;
      ELSE
        -- Create new late fee record
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
          p_lease_id,
          p_late_fine_amount,
          p_late_fine_amount,
          0,
          p_payment_date,
          'completed',
          'Late payment fee automatically applied',
          'LATE_PAYMENT_FEE',
          p_late_fine_amount,
          p_days_overdue,
          p_original_due_date
        );
      END IF;
    END IF;
    
    -- Update payment schedule if it exists
    IF v_payment_schedule_id IS NOT NULL THEN
      UPDATE payment_schedules
      SET 
        status = CASE WHEN p_balance <= 0 THEN 'completed' ELSE 'partial' END,
        actual_payment_date = p_payment_date
      WHERE id = v_payment_schedule_id;
    ELSE
      -- Create a payment schedule if it doesn't exist (for historical records)
      INSERT INTO payment_schedules (
        lease_id,
        amount,
        due_date,
        status,
        description,
        actual_payment_date
      ) VALUES (
        p_lease_id,
        p_amount,
        p_original_due_date,
        CASE WHEN p_balance <= 0 THEN 'completed' ELSE 'partial' END,
        'Auto-created payment schedule for ' || TO_CHAR(p_original_due_date, 'Month YYYY'),
        p_payment_date
      );
    END IF;
    
    -- Return success
    RETURN json_build_object(
      'success', true,
      'payment_id', v_payment_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Return error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$;

-- Manually run the function once to create all missing records
SELECT generate_missing_payment_records();
