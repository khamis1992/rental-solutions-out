
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
    p.id IS NULL;
END;
$$ LANGUAGE plpgsql;
