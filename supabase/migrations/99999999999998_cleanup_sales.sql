
-- Drop existing tables in correct order
DROP TABLE IF EXISTS sales_communications CASCADE;
DROP TABLE IF EXISTS sales_conversion_events CASCADE;
DROP TABLE IF EXISTS sales_documents CASCADE;
DROP TABLE IF EXISTS sales_vehicle_reservations CASCADE;
DROP TABLE IF EXISTS sales_onboarding CASCADE;
DROP TABLE IF EXISTS sales_vehicle_types CASCADE;
DROP TABLE IF EXISTS sales_performance_metrics CASCADE;
DROP TABLE IF EXISTS sales_tasks CASCADE;
DROP TABLE IF EXISTS sales_team_members CASCADE;
DROP TABLE IF EXISTS vehicle_recommendations CASCADE;
DROP TABLE IF EXISTS lead_scoring_rules CASCADE;
DROP TABLE IF EXISTS sales_leads CASCADE;

-- Drop existing enum
DROP TYPE IF EXISTS sales_lead_status;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_lead_score() CASCADE;
DROP FUNCTION IF EXISTS generate_vehicle_recommendations() CASCADE;
