-- Supabase Migration: AgriFlow Rescue & B2B Commodity Exchange
-- Copy of scripts/migrate-salvage-schema.sql for Supabase migration runner

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'FARMER',
        'INDUSTRIAL_BUYER',
        'LOGISTICS_CARRIER',
        'PLATFORM_ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE crop_salvage_status_enum AS ENUM (
        'ACTIVE_LISTED',
        'UNDER_NEGOTIATION',
        'DEAL_ACCEPTED',
        'IN_TRANSIT',
        'QA_APPROVED',
        'EXPIRED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE defect_type_enum AS ENUM (
        'HAIL_IMPACT',
        'SUNSCALD',
        'TRANSIT_BRUISING',
        'SKIN_SPLITTING',
        'AESTHETIC_BLEMISH'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE negotiation_status_enum AS ENUM (
        'PROPOSED_BY_BUYER',
        'COUNTERED_BY_FARMER',
        'ACCEPTED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE freight_status_enum AS ENUM (
        'SCHEDULED',
        'DISPATCHED',
        'IN_TRANSIT',
        'AT_GATE_QA',
        'DELIVERED',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status_enum AS ENUM (
        'HELD_IN_VAULT',
        'RELEASED_TO_FARMER',
        'REFUNDED_TO_BUYER',
        'DISPUTED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'FARMER',
    avatar_url TEXT,
    organization_name TEXT,
    region TEXT DEFAULT 'Oromia',
    zone TEXT,
    woreda TEXT,
    national_id_number TEXT,
    tin_number TEXT,
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industrial_buyer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    factory_type TEXT NOT NULL,
    min_acceptable_brix NUMERIC(4, 2) NOT NULL DEFAULT 4.50 CHECK (min_acceptable_brix >= 0),
    max_defect_tolerance_pct NUMERIC(5, 2) NOT NULL DEFAULT 35.00 CHECK (max_defect_tolerance_pct >= 0 AND max_defect_tolerance_pct <= 100),
    receiving_dock_address TEXT NOT NULL,
    dock_contact_name TEXT,
    dock_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salvage_crop_lots (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    commodity_name TEXT NOT NULL,
    target_industry TEXT NOT NULL,
    total_weight_kg NUMERIC(12, 2) NOT NULL CHECK (total_weight_kg > 0),
    benchmark_price_per_kg NUMERIC(10, 2) NOT NULL CHECK (benchmark_price_per_kg > 0),
    defect_type defect_type_enum NOT NULL,
    defect_severity_pct NUMERIC(5, 2) NOT NULL CHECK (defect_severity_pct >= 0 AND defect_severity_pct <= 100),
    brix_level NUMERIC(4, 2) NOT NULL CHECK (brix_level >= 0),
    moisture_pct NUMERIC(5, 2) CHECK (moisture_pct >= 0 AND moisture_pct <= 100),
    status crop_salvage_status_enum NOT NULL DEFAULT 'ACTIVE_LISTED',
    harvest_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    degradation_deadline TIMESTAMPTZ NOT NULL,
    origin_packhouse TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salvage_negotiations (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER NOT NULL REFERENCES salvage_crop_lots(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    proposed_discount_pct NUMERIC(5, 2) NOT NULL CHECK (proposed_discount_pct >= 0 AND proposed_discount_pct <= 100),
    effective_unit_price NUMERIC(10, 2) NOT NULL CHECK (effective_unit_price >= 0),
    gross_farmer_payout NUMERIC(12, 2) NOT NULL CHECK (gross_farmer_payout >= 0),
    factory_savings NUMERIC(12, 2) NOT NULL,
    last_turn_by user_role_enum NOT NULL,
    status negotiation_status_enum NOT NULL DEFAULT 'PROPOSED_BY_BUYER',
    counter_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    expiration_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS freight_shipments (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER NOT NULL REFERENCES salvage_crop_lots(id) ON DELETE CASCADE,
    negotiation_id INTEGER REFERENCES salvage_negotiations(id) ON DELETE SET NULL,
    carrier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vehicle_type TEXT NOT NULL DEFAULT 'TEMPERATURE_CONTROLLED_REEFER',
    target_temperature_celsius NUMERIC(4, 1) DEFAULT 3.0,
    telemetry_readings JSONB NOT NULL DEFAULT '[]'::jsonb,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    pickup_coordinates JSONB,
    dropoff_coordinates JSONB,
    freight_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (freight_fee >= 0),
    status freight_status_enum NOT NULL DEFAULT 'SCHEDULED',
    bol_number TEXT UNIQUE NOT NULL,
    driver_name TEXT,
    plate_number TEXT,
    proof_of_delivery_url TEXT,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_vault (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER NOT NULL REFERENCES salvage_crop_lots(id) ON DELETE CASCADE,
    negotiation_id INTEGER REFERENCES salvage_negotiations(id) ON DELETE SET NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    carrier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    gross_hold_amount NUMERIC(12, 2) NOT NULL CHECK (gross_hold_amount >= 0),
    net_farmer_allocation NUMERIC(12, 2) NOT NULL CHECK (net_farmer_allocation >= 0),
    carrier_freight_allocation NUMERIC(10, 2) NOT NULL CHECK (carrier_freight_allocation >= 0),
    platform_fee NUMERIC(10, 2) NOT NULL CHECK (platform_fee >= 0),
    escrow_status escrow_status_enum NOT NULL DEFAULT 'HELD_IN_VAULT',
    deposit_transaction_ref TEXT,
    disbursement_transaction_ref TEXT,
    qa_inspector_notes TEXT,
    qa_pass_timestamp TIMESTAMPTZ,
    release_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salvage_crop_lots_farmer_id ON salvage_crop_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_salvage_crop_lots_status ON salvage_crop_lots(status);
CREATE INDEX IF NOT EXISTS idx_salvage_crop_lots_degradation_deadline ON salvage_crop_lots(degradation_deadline);
CREATE INDEX IF NOT EXISTS idx_salvage_crop_lots_industry ON salvage_crop_lots(target_industry);

CREATE INDEX IF NOT EXISTS idx_salvage_negotiations_lot_id ON salvage_negotiations(lot_id);
CREATE INDEX IF NOT EXISTS idx_salvage_negotiations_status ON salvage_negotiations(status);
CREATE INDEX IF NOT EXISTS idx_salvage_negotiations_farmer_buyer ON salvage_negotiations(farmer_id, buyer_id);

CREATE INDEX IF NOT EXISTS idx_freight_shipments_lot_id ON freight_shipments(lot_id);
CREATE INDEX IF NOT EXISTS idx_freight_shipments_carrier_id ON freight_shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_freight_shipments_status ON freight_shipments(status);

CREATE INDEX IF NOT EXISTS idx_escrow_vault_lot_id ON escrow_vault(lot_id);
CREATE INDEX IF NOT EXISTS idx_escrow_vault_status ON escrow_vault(escrow_status);
CREATE INDEX IF NOT EXISTS idx_escrow_vault_negotiation_id ON escrow_vault(negotiation_id);

INSERT INTO users (id, uid, email, full_name, phone, role, organization_name, region, zone, woreda, is_verified)
VALUES
    (1, 'uid-wonji-farmer-01', 'farmer.wonji@agrilink.et', 'Ato Bekele Tadesse', '+251911456780', 'FARMER', 'Wonji Horizon Farms', 'Oromia', 'East Shewa', 'Wonji', true),
    (2, 'uid-redgold-proc-02', 'procurement@redgoldfoods.et', 'Dr. Henok Haile', '+251922334455', 'INDUSTRIAL_BUYER', 'RedGold Cannery & Puree Co.', 'Oromia', 'East Shewa', 'Adama Industrial Zone', true),
    (3, 'uid-swiftreefer-03', 'dispatch@swiftreefer.et', 'Captain Yared Solomon', '+251933556677', 'LOGISTICS_CARRIER', 'SwiftReefer Cold-Chain Logistics', 'Addis Ababa', 'Akaki-Kality', 'Freight Hub #4', true),
    (4, 'uid-compliance-04', 'compliance@agrilink.et', 'W/ro Selamawit Desta', '+251944778899', 'PLATFORM_ADMIN', 'AgriLink Platform Compliance Desk', 'Addis Ababa', 'Bole', 'Sub-city Center', true)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    organization_name = EXCLUDED.organization_name,
    is_verified = true;

SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 10) FROM users));

INSERT INTO industrial_buyer_profiles (user_id, factory_type, min_acceptable_brix, max_defect_tolerance_pct, receiving_dock_address)
VALUES
    (2, 'Ketchup & Puree Cannery', 4.50, 40.00, 'Plot 18, Adama Industrial Agro-Park, Oromia')
ON CONFLICT (user_id) DO UPDATE SET
    factory_type = EXCLUDED.factory_type,
    min_acceptable_brix = EXCLUDED.min_acceptable_brix,
    max_defect_tolerance_pct = EXCLUDED.max_defect_tolerance_pct;
