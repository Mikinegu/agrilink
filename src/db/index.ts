import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import { supabase, getSupabase, testSupabaseConnection } from '../lib/supabase.ts';

// SQL statement to create all core tables if running in embedded PostgreSQL mode
export const INIT_SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  region TEXT NOT NULL,
  zone TEXT,
  woreda TEXT,
  total_area_hectares DOUBLE PRECISION DEFAULT 1.0,
  primary_crops TEXT[],
  farming_experience_years INTEGER DEFAULT 3,
  national_id_number TEXT,
  cooperative_membership TEXT,
  bank_account_number TEXT,
  bank_name TEXT DEFAULT 'Commercial Bank of Ethiopia',
  bio TEXT,
  rating DOUBLE PRECISION DEFAULT 5.0,
  completed_orders_count INTEGER DEFAULT 0,
  total_produce_sold_tons DOUBLE PRECISION DEFAULT 0,
  is_certified_organic BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  size_hectares DOUBLE PRECISION DEFAULT 2.5,
  soil_type TEXT DEFAULT 'Clay Loam',
  irrigation_type TEXT DEFAULT 'Drip & Rainfed',
  certifications TEXT[],
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_fields (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  area_hectares DOUBLE PRECISION NOT NULL,
  current_crop TEXT NOT NULL,
  variety TEXT,
  planting_date TEXT,
  expected_harvest_date TEXT,
  status TEXT DEFAULT 'GROWING',
  health_score INTEGER DEFAULT 95,
  soil_moisture_percent INTEGER DEFAULT 68,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  buyer_type TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  company_name TEXT,
  tin_number TEXT,
  vat_registered BOOLEAN DEFAULT FALSE,
  delivery_address TEXT,
  preferred_payment_method TEXT DEFAULT 'CHAPA',
  credit_limit_etb DOUBLE PRECISION DEFAULT 0,
  preferred_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS product_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'FRESH_FOOD',
  icon TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  farm_id INTEGER,
  category_id INTEGER NOT NULL,
  subcategory_id INTEGER,
  name TEXT NOT NULL,
  subcategory TEXT,
  product_type TEXT NOT NULL DEFAULT 'FRESH_FOOD',
  variety TEXT,
  description TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'GRADE_A',
  quality_grade TEXT DEFAULT 'GRADE_A',
  price_per_unit_etb DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ETB',
  unit TEXT NOT NULL DEFAULT 'KG',
  available_quantity DOUBLE PRECISION NOT NULL DEFAULT 100,
  min_order_quantity DOUBLE PRECISION NOT NULL DEFAULT 10,
  max_order_quantity DOUBLE PRECISION,
  harvest_date TEXT NOT NULL,
  production_date TEXT,
  expiration_date TEXT,
  freshness_status TEXT DEFAULT 'AVAILABLE_NOW',
  expected_availability TEXT DEFAULT 'Immediate',
  farm_location TEXT NOT NULL,
  region TEXT NOT NULL,
  zone TEXT,
  woreda TEXT,
  town_city TEXT,
  altitude_meters INTEGER,
  origin_details TEXT,
  processing_method TEXT,
  harvest_year INTEGER DEFAULT 2026,
  storage_requirements TEXT,
  packaging_type TEXT,
  ingredients TEXT,
  is_live_animal BOOLEAN DEFAULT FALSE,
  animal_breed TEXT,
  veterinary_certificate TEXT,
  images TEXT[],
  lot_batch_number TEXT NOT NULL,
  quality_score INTEGER DEFAULT 96,
  certifications TEXT[],
  is_organic BOOLEAN DEFAULT FALSE,
  is_verified_farmer BOOLEAN DEFAULT TRUE,
  delivery_availability TEXT DEFAULT 'ALL_ETHIOPIA',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  shelf_life_days INTEGER DEFAULT 14,
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS input_suppliers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  warehouse_location TEXT NOT NULL,
  region TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  rating DOUBLE PRECISION DEFAULT 4.9,
  total_products_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS input_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS input_products (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  price_etb DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL DEFAULT 'BAG',
  stock_quantity INTEGER NOT NULL DEFAULT 50,
  min_order_quantity INTEGER DEFAULT 1,
  specifications TEXT,
  application_guide TEXT,
  images TEXT[],
  is_certified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER,
  input_product_id INTEGER,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity_tons DOUBLE PRECISION DEFAULT 500,
  current_storage_tons DOUBLE PRECISION DEFAULT 120,
  manager_name TEXT,
  contact_phone TEXT,
  cold_storage_available BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_plate_number TEXT NOT NULL,
  capacity_tons DOUBLE PRECISION NOT NULL DEFAULT 3.5,
  has_refrigeration BOOLEAN DEFAULT FALSE,
  region TEXT NOT NULL,
  current_status TEXT DEFAULT 'AVAILABLE',
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating DOUBLE PRECISION DEFAULT 4.9,
  total_deliveries INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id INTEGER NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'PRODUCE',
  total_amount_etb DOUBLE PRECISION NOT NULL,
  delivery_fee_etb DOUBLE PRECISION DEFAULT 0,
  service_fee_etb DOUBLE PRECISION DEFAULT 0,
  grand_total_etb DOUBLE PRECISION NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'PAID',
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER,
  delivery_address TEXT NOT NULL,
  delivery_region TEXT NOT NULL,
  delivery_zone TEXT,
  delivery_woreda TEXT,
  national_id_number TEXT,
  tin_number TEXT,
  payer_account_number TEXT,
  delivery_contact_name TEXT NOT NULL,
  delivery_contact_phone TEXT NOT NULL,
  requested_delivery_date TEXT,
  actual_delivery_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER,
  input_product_id INTEGER,
  seller_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grade TEXT,
  unit TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  subtotal_etb DOUBLE PRECISION NOT NULL,
  lot_batch_number TEXT,
  status TEXT DEFAULT 'CONFIRMED'
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  actor_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount_etb DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ETB',
  provider TEXT NOT NULL DEFAULT 'CHAPA',
  transaction_ref TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'CARD_MOBILE_MONEY',
  payer_account_number TEXT,
  payment_details JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE,
  driver_id INTEGER,
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
  estimated_arrival TEXT,
  actual_delivered_at TIMESTAMPTZ,
  proof_of_delivery_url TEXT,
  proof_notes TEXT,
  recipient_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_movements (
  id SERIAL PRIMARY KEY,
  hub_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  quantity_units DOUBLE PRECISION NOT NULL,
  notes TEXT,
  operator_id INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,
  order_id INTEGER,
  batch_number TEXT NOT NULL DEFAULT 'BATCH-DEFAULT',
  inspector_id INTEGER,
  inspector_name TEXT NOT NULL DEFAULT 'QA Inspector',
  inspection_date TEXT NOT NULL DEFAULT '2026-01-01',
  grade_assigned TEXT NOT NULL DEFAULT 'GRADE_A',
  moisture_content_percent DOUBLE PRECISION,
  defect_rate_percent DOUBLE PRECISION DEFAULT 1.2,
  appearance_score INTEGER DEFAULT 95,
  status TEXT NOT NULL DEFAULT 'PASSED',
  report_summary TEXT NOT NULL DEFAULT 'Quality check passed',
  certificate_url TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_applications (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  institution_id INTEGER,
  loan_type TEXT NOT NULL DEFAULT 'INPUT_FINANCING',
  amount_requested_etb DOUBLE PRECISION NOT NULL,
  purpose TEXT NOT NULL,
  farm_id INTEGER,
  target_crop TEXT NOT NULL DEFAULT 'General Crops',
  expected_yield_tons DOUBLE PRECISION NOT NULL DEFAULT 0,
  expected_revenue_etb DOUBLE PRECISION NOT NULL DEFAULT 0,
  repayment_period_months INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  approved_amount_etb DOUBLE PRECISION,
  interest_rate_percent DOUBLE PRECISION DEFAULT 9.5,
  review_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  document_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id SERIAL PRIMARY KEY,
  business_buyer_id INTEGER NOT NULL,
  seller_id INTEGER,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  requested_quantity DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL DEFAULT 'TON',
  requested_grade TEXT DEFAULT 'GRADE_1_EXPORT',
  target_price_etb DOUBLE PRECISION,
  delivery_date TEXT NOT NULL DEFAULT '2026-12-31',
  delivery_location TEXT NOT NULL DEFAULT 'Addis Ababa',
  status TEXT NOT NULL DEFAULT 'PENDING',
  offer_price_etb DOUBLE PRECISION,
  offer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  previous_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_surveys (
  id SERIAL PRIMARY KEY,
  survey_id TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  user_email TEXT,
  user_role TEXT DEFAULT 'GENERAL',
  satisfaction_rating TEXT NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  platform_fee_percent DOUBLE PRECISION DEFAULT 2.0,
  escrow_hold_hours INTEGER DEFAULT 24,
  min_order_amount_etb DOUBLE PRECISION DEFAULT 500.0,
  currency TEXT DEFAULT 'ETB',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  support_phone TEXT DEFAULT '0961123330',
  support_email TEXT DEFAULT 'support@agrilink.et',
  tax_rate_percent DOUBLE PRECISION DEFAULT 0.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

declare global {
  var _dbInstance: any | undefined;
  var _pgliteClient: PGlite | undefined;
  var _dbInitialized: boolean | undefined;
}

const remoteUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

export const getDb = () => {
  if (!global._dbInstance) {
    if (remoteUrl) {
      const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15000,
      });
      global._dbInstance = drizzleNodePg(pool, { schema });
    } else {
      if (!global._pgliteClient) {
        global._pgliteClient = new PGlite();
      }
      global._dbInstance = drizzlePglite(global._pgliteClient, { schema });
    }
  }
  return global._dbInstance;
};

export const initDatabase = async () => {
  if (global._dbInitialized) return;
  if (!remoteUrl) {
    if (!global._pgliteClient) {
      global._pgliteClient = new PGlite();
    }
    await global._pgliteClient.waitReady;
    await global._pgliteClient.exec(INIT_SCHEMA_SQL);
  }
  global._dbInitialized = true;
};

export const db = getDb();
export { supabase, getSupabase, testSupabaseConnection };
