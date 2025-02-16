
-- Drop all sales-related tables
DROP TABLE IF EXISTS sales_communications CASCADE;
DROP TABLE IF EXISTS sales_conversion_events CASCADE;
DROP TABLE IF EXISTS sales_documents CASCADE;
DROP TABLE IF EXISTS sales_leads CASCADE;
DROP TABLE IF EXISTS sales_performance_metrics CASCADE;
DROP TABLE IF EXISTS sales_tasks CASCADE;
DROP TABLE IF EXISTS sales_team_members CASCADE;
DROP TABLE IF EXISTS sales_vehicle_reservations CASCADE;
DROP TABLE IF EXISTS vehicle_recommendations CASCADE;
DROP TABLE IF EXISTS lead_scoring_rules CASCADE;

-- Remove sales-related enums
DROP TYPE IF EXISTS sales_lead_status;

-- Remove any related functions
DROP FUNCTION IF EXISTS update_lead_score();
DROP FUNCTION IF EXISTS generate_vehicle_recommendations();
