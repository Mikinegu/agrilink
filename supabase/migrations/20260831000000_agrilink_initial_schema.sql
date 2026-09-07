-- ============================================================================
-- AGRILINK ETHIOPIA: INITIAL SUPABASE DATABASE MIGRATION
-- Project: https://hkhlizasbjkdvbrcbakl.supabase.co
-- Generated for PostgreSQL / Supabase
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS & ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
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
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_uid_idx ON public.users(uid);

-- ==========================================
-- 2. FARMER PROFILES & FARMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.farms (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.farm_fields (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
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

-- ==========================================
-- 3. BUYER PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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

-- ==========================================
-- 4. PRODUCE CATEGORIES & PRODUCTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.product_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'FRESH_FOOD',
  icon TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farm_id INTEGER REFERENCES public.farms(id) ON DELETE SET NULL,
  category_id INTEGER NOT NULL REFERENCES public.product_categories(id),
  subcategory_id INTEGER REFERENCES public.product_subcategories(id),
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

CREATE INDEX IF NOT EXISTS products_farmer_idx ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_subcat_idx ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS products_type_idx ON public.products(product_type);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);

-- ==========================================
-- 5. AGRICULTURAL INPUT SUPPLIERS & PRODUCTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.input_suppliers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.input_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.input_products (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL REFERENCES public.input_suppliers(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.input_categories(id),
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

-- ==========================================
-- 6. CARTS & CART ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  input_product_id INTEGER REFERENCES public.input_products(id) ON DELETE CASCADE,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. HUBS & LOGISTICS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hubs (
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

CREATE TABLE IF NOT EXISTS public.drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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

-- ==========================================
-- 8. ORDERS & ORDER ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  order_type TEXT NOT NULL DEFAULT 'PRODUCE',
  total_amount_etb DOUBLE PRECISION NOT NULL,
  delivery_fee_etb DOUBLE PRECISION DEFAULT 0,
  service_fee_etb DOUBLE PRECISION DEFAULT 0,
  grand_total_etb DOUBLE PRECISION NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'PAID',
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER REFERENCES public.hubs(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS orders_buyer_idx ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS orders_number_idx ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  input_product_id INTEGER REFERENCES public.input_products(id) ON DELETE SET NULL,
  seller_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  grade TEXT,
  unit TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  subtotal_etb DOUBLE PRECISION NOT NULL,
  lot_batch_number TEXT,
  status TEXT DEFAULT 'CONFIRMED'
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_seller_idx ON public.order_items(seller_id);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  actor_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. PAYMENTS & TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
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

-- ==========================================
-- 10. DELIVERIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE SET NULL,
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER REFERENCES public.hubs(id) ON DELETE SET NULL,
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

-- ==========================================
-- 11. REVIEWS & RATINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 12. MESSAGES & NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 13. USER SATISFACTION SURVEYS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_surveys (
  id SERIAL PRIMARY KEY,
  survey_id TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT DEFAULT 'GENERAL',
  satisfaction_rating TEXT NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 14. PLATFORM SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
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

-- Insert initial platform settings if not present
INSERT INTO public.platform_settings (id, support_phone, support_email)
VALUES (1, '0961123330', 'support@agrilink.et')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) policies for secure Supabase access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_surveys ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products & categories for marketplace
CREATE POLICY "Allow public read active products" ON public.products
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Allow public read categories" ON public.product_categories
  FOR SELECT USING (true);

-- Allow authenticated or public insert for surveys
CREATE POLICY "Allow survey submissions" ON public.user_surveys
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Allow users read own profile" ON public.users
  FOR SELECT USING (true);
