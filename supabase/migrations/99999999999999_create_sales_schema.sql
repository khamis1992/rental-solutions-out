
-- Create enums for status tracking
CREATE TYPE sales_lead_status AS ENUM (
  'new',
  'document_collection',
  'vehicle_selection',
  'agreement_draft',
  'ready_for_signature',
  'onboarding',
  'completed',
  'cancelled'
);

-- Create sales_leads table
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  nationality TEXT,
  email TEXT,
  preferred_vehicle_type TEXT,
  budget_min NUMERIC DEFAULT 1400,
  budget_max NUMERIC,
  notes TEXT,
  status sales_lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_progress JSONB DEFAULT '{"initial_payment": false, "agreement_creation": false, "customer_conversion": false}'::jsonb,
  onboarding_date TIMESTAMPTZ,
  customer_id UUID REFERENCES profiles(id)
);

-- Create sales_vehicle_types table
CREATE TABLE sales_vehicle_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sales_onboarding table
CREATE TABLE sales_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES sales_leads(id),
  agreement_name TEXT NOT NULL,
  first_payment_amount NUMERIC,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ
);

-- Add indexes for better query performance
CREATE INDEX idx_sales_leads_status ON sales_leads(status);
CREATE INDEX idx_sales_leads_customer_id ON sales_leads(customer_id);
CREATE INDEX idx_sales_onboarding_lead_id ON sales_onboarding(lead_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_leads_updated_at
    BEFORE UPDATE ON sales_leads
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sales_vehicle_types_updated_at
    BEFORE UPDATE ON sales_vehicle_types
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sales_onboarding_updated_at
    BEFORE UPDATE ON sales_onboarding
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
