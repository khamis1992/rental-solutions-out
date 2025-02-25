
-- Reset schema to basic structure
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Basic types
CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'bank_transfer', 'cheque');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE lease_status AS ENUM ('pending_payment', 'active', 'completed', 'terminated', 'cancelled');
CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance', 'retired');

-- Core tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    vin TEXT NOT NULL UNIQUE,
    status vehicle_status DEFAULT 'available',
    mileage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id),
    vehicle_id UUID REFERENCES vehicles(id),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    rent_amount NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    status lease_status DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID REFERENCES leases(id),
    amount NUMERIC NOT NULL,
    payment_method payment_method_type,
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Basic RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policy
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
    FOR SELECT USING (true);

-- Vehicles policy
CREATE POLICY "Vehicles are viewable by everyone." ON vehicles
    FOR SELECT USING (true);

-- Leases policy
CREATE POLICY "Leases are viewable by customer" ON leases
    FOR SELECT USING (auth.uid() = customer_id);

-- Payments policy
CREATE POLICY "Payments are viewable by lease customer" ON payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT customer_id FROM leases WHERE id = lease_id
        )
    );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_leases_updated_at
    BEFORE UPDATE ON leases
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
