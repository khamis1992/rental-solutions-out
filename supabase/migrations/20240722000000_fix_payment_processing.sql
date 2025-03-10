
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
      payment_reference
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
      v_payment_schedule_id
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

-- Create or replace function to get properly calculated pending payments
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
      v.license_plate
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
    -- Get current late fees (only most recent per agreement for this month)
    SELECT DISTINCT ON (up.lease_id)
      up.lease_id,
      up.late_fine_amount,
      up.days_overdue
    FROM unified_payments up
    WHERE up.type = 'LATE_PAYMENT_FEE'
      AND up.original_due_date = first_of_month
    ORDER BY up.lease_id, up.days_overdue DESC
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
    -- Pending rent amount (capped at rent_amount)
    LEAST(a.rent_amount, GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0))) AS pending_rent_amount,
    -- Late fees from the active_late_fees CTE
    COALESCE(lf.late_fine_amount, 0) AS late_fine_amount,
    COALESCE(tf.total_traffic_fines, 0) AS traffic_fine_amount,
    -- Total amount calculation
    LEAST(a.rent_amount, GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0))) + 
    COALESCE(lf.late_fine_amount, 0) + 
    COALESCE(tf.total_traffic_fines, 0) AS total_amount,
    a.license_plate
  FROM active_agreements a
  LEFT JOIN payments_this_month p ON p.lease_id = a.lease_id
  LEFT JOIN active_late_fees lf ON lf.lease_id = a.lease_id
  LEFT JOIN unpaid_traffic_fines tf ON tf.lease_id = a.lease_id
  ORDER BY total_amount DESC;
END;
$function$;
