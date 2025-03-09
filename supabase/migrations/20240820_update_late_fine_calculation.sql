
-- Update the get_pending_payments_report function to properly calculate late fines
CREATE OR REPLACE FUNCTION public.get_pending_payments_report()
 RETURNS TABLE(agreement_number text, customer_name text, id_number text, phone_number text, pending_rent_amount numeric, late_fine_amount numeric, traffic_fine_amount numeric, total_amount numeric, license_plate text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  first_of_month date := date_trunc('month', current_date)::date;
  daily_late_fee numeric := 120; -- Default late fee per day in QAR
BEGIN
  RETURN QUERY
  WITH active_agreements AS (
    -- Get all active agreements with customer and vehicle info
    SELECT 
      l.id AS lease_id,
      l.agreement_number,
      l.rent_amount,
      p.full_name AS customer_name,
      p.driver_license AS id_number,
      p.phone_number,
      v.license_plate,
      COALESCE(l.daily_late_fee, daily_late_fee) AS daily_late_fee
    FROM leases l
    JOIN profiles p ON l.customer_id = p.id
    JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.status = 'active'
  ),
  payments_this_month AS (
    -- Calculate payments made this month with explicit column references
    SELECT 
      up.lease_id,
      COALESCE(SUM(up.amount_paid), 0) AS total_paid,
      COALESCE(SUM(up.late_fine_amount), 0) AS existing_late_fines,  -- Keep track of existing late fines
      MIN(up.payment_date) AS first_payment_date -- Get the earliest payment date this month
    FROM unified_payments up
    WHERE up.payment_date >= first_of_month
      AND up.payment_date < first_of_month + interval '1 month'
    GROUP BY up.lease_id
  ),
  late_fine_calculation AS (
    -- Calculate additional late fines based on payment dates
    SELECT
      a.lease_id,
      CASE
        -- If no payment yet this month, calculate days from 1st until today
        WHEN p.first_payment_date IS NULL THEN 
          GREATEST(0, EXTRACT(DAY FROM (current_date - first_of_month))::integer - 1) * a.daily_late_fee
        -- If payment was made after the 1st, calculate late fee for those days
        WHEN p.first_payment_date > first_of_month THEN 
          GREATEST(0, EXTRACT(DAY FROM (p.first_payment_date - first_of_month))::integer - 1) * a.daily_late_fee
        -- If payment was made on the 1st, no late fee
        ELSE 0
      END AS calculated_late_fees
    FROM active_agreements a
    LEFT JOIN payments_this_month p ON p.lease_id = a.lease_id
  ),
  unpaid_traffic_fines AS (
    -- Get unpaid traffic fines with explicit table references
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
    -- Calculate pending rent with proper COALESCE
    GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0)) AS pending_rent_amount,
    -- Combine existing late fines with calculated late fines
    COALESCE(p.existing_late_fines, 0) + COALESCE(lfc.calculated_late_fees, 0) AS late_fine_amount,
    COALESCE(tf.total_traffic_fines, 0) AS traffic_fine_amount,
    -- Total amount calculation with explicit column references and late fine update
    GREATEST(0, a.rent_amount - COALESCE(p.total_paid, 0)) + 
    COALESCE(p.existing_late_fines, 0) + 
    COALESCE(lfc.calculated_late_fees, 0) + 
    COALESCE(tf.total_traffic_fines, 0) AS total_amount,
    a.license_plate
  FROM active_agreements a
  LEFT JOIN payments_this_month p ON p.lease_id = a.lease_id
  LEFT JOIN late_fine_calculation lfc ON lfc.lease_id = a.lease_id
  LEFT JOIN unpaid_traffic_fines tf ON tf.lease_id = a.lease_id
  ORDER BY total_amount DESC;
END;
$function$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_pending_payments_report() TO anon;
GRANT EXECUTE ON FUNCTION public.get_pending_payments_report() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_payments_report() TO service_role;
