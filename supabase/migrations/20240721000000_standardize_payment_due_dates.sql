
-- This migration standardizes all payment due dates to the 1st of each month

-- Set default rent_due_day to 1 for all agreements
ALTER TABLE leases 
ALTER COLUMN rent_due_day SET DEFAULT 1;

-- Update all existing agreements to have rent_due_day=1
UPDATE leases 
SET rent_due_day = 1
WHERE rent_due_day IS NULL OR rent_due_day != 1;

-- Add index to improve performance of payment queries
CREATE INDEX IF NOT EXISTS idx_leases_rent_due_day ON leases(rent_due_day);

-- Update any existing payment schedules to align with the 1st of month
UPDATE payment_schedules ps
SET due_date = DATE_TRUNC('MONTH', ps.due_date)::DATE
FROM leases l
WHERE ps.lease_id = l.id
AND EXTRACT(DAY FROM ps.due_date) != 1
AND ps.status = 'pending';

-- Create a standardized view of payments due on the 1st
CREATE OR REPLACE VIEW monthly_payments_view AS
SELECT 
  l.id AS lease_id,
  l.agreement_number,
  l.rent_amount,
  l.rent_due_day,
  DATE_TRUNC('MONTH', CURRENT_DATE)::DATE AS current_month_date,
  (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 month')::DATE AS next_month_date,
  p.id AS payment_id,
  p.payment_date,
  p.amount,
  p.status AS payment_status,
  CASE 
    WHEN p.id IS NOT NULL THEN 'paid'
    WHEN CURRENT_DATE >= DATE_TRUNC('MONTH', CURRENT_DATE)::DATE AND
         CURRENT_DATE <= (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '30 days')::DATE
         THEN 'due'
    WHEN CURRENT_DATE > (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '30 days')::DATE
         THEN 'overdue'
    ELSE 'upcoming'
  END AS month_status
FROM leases l
LEFT JOIN unified_payments p ON 
  l.id = p.lease_id AND 
  DATE_TRUNC('MONTH', p.payment_date) = DATE_TRUNC('MONTH', CURRENT_DATE)
WHERE l.status = 'active'
ORDER BY l.agreement_number;

-- Drop existing function if it exists to avoid errors
DROP FUNCTION IF EXISTS get_pending_payments_report();

-- Create or replace the function to include all active agreements in the report
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
      l.start_date,
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
      COALESCE(SUM(up.amount_paid), 0) AS total_paid,
      COALESCE(SUM(up.late_fine_amount), 0) AS total_late_fines
    FROM unified_payments up
    WHERE up.payment_date >= first_of_month
      AND up.payment_date < first_of_month + interval '1 month'
    GROUP BY up.lease_id
  ),
  historical_late_fines AS (
    -- Get accumulated late fines from previous months
    SELECT
      up.lease_id,
      COALESCE(SUM(up.late_fine_amount), 0) AS accumulated_late_fines
    FROM unified_payments up
    WHERE up.payment_date < first_of_month
      AND up.balance > 0  -- Only include unpaid late fines
    GROUP BY up.lease_id
  ),
  unpaid_traffic_fines AS (
    -- Get unpaid traffic fines
    SELECT
      tf.lease_id,
      COALESCE(SUM(tf.fine_amount), 0) AS total_traffic_fines
    FROM traffic_fines tf
    WHERE tf.payment_status != 'completed'
    GROUP BY tf.lease_id
  ),
  payment_schedules_data AS (
    -- Get payment schedules for agreements without payments
    SELECT
      ps.lease_id,
      ps.amount AS scheduled_amount
    FROM payment_schedules ps
    WHERE ps.due_date >= first_of_month
      AND ps.due_date < first_of_month + interval '1 month'
      AND ps.status = 'pending'
  )
  SELECT
    a.agreement_number,
    a.customer_name,
    a.id_number,
    a.phone_number,
    -- Pending rent amount - use scheduled amount if available, otherwise use rent_amount
    -- Only include agreement if start_date is in the past or current month
    CASE 
      WHEN a.start_date IS NULL OR a.start_date <= (first_of_month + interval '1 month')::date THEN
        COALESCE(
          GREATEST(0, ps.scheduled_amount - COALESCE(p.total_paid, 0)),
          GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0))
        )
      ELSE 0
    END AS pending_rent_amount,
    -- Combined late fines (current month + historical)
    (COALESCE(p.total_late_fines, 0) + COALESCE(h.accumulated_late_fines, 0)) AS late_fine_amount,
    COALESCE(tf.total_traffic_fines, 0) AS traffic_fine_amount,
    -- Total amount calculation
    CASE 
      WHEN a.start_date IS NULL OR a.start_date <= (first_of_month + interval '1 month')::date THEN
        COALESCE(
          GREATEST(0, ps.scheduled_amount - COALESCE(p.total_paid, 0)),
          GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0))
        ) + 
        COALESCE(p.total_late_fines, 0) + 
        COALESCE(h.accumulated_late_fines, 0) + 
        COALESCE(tf.total_traffic_fines, 0)
      ELSE
        COALESCE(tf.total_traffic_fines, 0)
    END AS total_amount,
    a.license_plate
  FROM active_agreements a
  LEFT JOIN payments_this_month p ON p.lease_id = a.lease_id
  LEFT JOIN historical_late_fines h ON h.lease_id = a.lease_id
  LEFT JOIN unpaid_traffic_fines tf ON tf.lease_id = a.lease_id
  LEFT JOIN payment_schedules_data ps ON ps.lease_id = a.lease_id
  -- Only include in report if there's an amount due or it's an active agreement in the current month
  WHERE (
    (a.start_date IS NULL OR a.start_date <= (first_of_month + interval '1 month')::date) OR
    COALESCE(tf.total_traffic_fines, 0) > 0
  )
  ORDER BY total_amount DESC;
END;
$function$;

-- Create a function to check for late payments that should have been due on the 1st
CREATE OR REPLACE FUNCTION check_late_payments()
RETURNS TABLE (
  lease_id UUID,
  agreement_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  due_date DATE,
  days_late INTEGER,
  rent_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id AS lease_id,
    l.agreement_number,
    c.full_name AS customer_name,
    c.email AS customer_email,
    DATE_TRUNC('MONTH', CURRENT_DATE)::DATE AS due_date,
    EXTRACT(DAY FROM CURRENT_DATE)::INTEGER AS days_late,
    l.rent_amount
  FROM leases l
  JOIN profiles c ON l.customer_id = c.id
  LEFT JOIN unified_payments p ON 
    l.id = p.lease_id AND 
    DATE_TRUNC('MONTH', p.payment_date) = DATE_TRUNC('MONTH', CURRENT_DATE)
  WHERE 
    l.status = 'active' AND
    l.rent_due_day = 1 AND
    EXTRACT(DAY FROM CURRENT_DATE) > l.rent_due_day AND
    p.id IS NULL AND
    (l.start_date IS NULL OR l.start_date <= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
