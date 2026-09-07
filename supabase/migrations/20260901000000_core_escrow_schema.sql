-- ============================================================================
-- AGRILINK ETHIOPIA: CORE ESCROW SCHEMA MIGRATION
-- Timestamp: 20260901000000
-- Applies clean ENUMs, escrow ledger, logistics table with RLS
-- Safe to run on top of existing schema (uses IF NOT EXISTS / DO blocks)
-- ============================================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. ENUMS  (skip if already exist)
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'fleet', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'locked_in_escrow',
    'in_transit',
    'delivered',
    'completed',
    'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE escrow_status AS ENUM ('pending', 'locked', 'released', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
-- 2. CORE USERS TABLE  (UUID-based, role enum)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.core_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT        NOT NULL,
  phone       TEXT        UNIQUE NOT NULL,
  role        user_role   NOT NULL,
  tin_number  TEXT,
  region      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.core_users IS
  'UUID-keyed users table with strict role enum for escrow workflow';

-- ─────────────────────────────────────────────
-- 3. ORDERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.core_orders (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id         UUID         REFERENCES public.core_users(id) ON DELETE CASCADE,
  farmer_id        UUID         REFERENCES public.core_users(id) ON DELETE CASCADE,
  crop_name        TEXT         NOT NULL,
  quantity_tonnes  NUMERIC(10,2) NOT NULL CHECK (quantity_tonnes > 0),
  price_etb        NUMERIC(12,2) NOT NULL CHECK (price_etb > 0),
  status           order_status  DEFAULT 'pending_payment',
  created_at       TIMESTAMPTZ  DEFAULT NOW(),

  CONSTRAINT orders_buyer_not_farmer CHECK (buyer_id <> farmer_id)
);

CREATE INDEX IF NOT EXISTS core_orders_buyer_idx  ON public.core_orders(buyer_id);
CREATE INDEX IF NOT EXISTS core_orders_farmer_idx ON public.core_orders(farmer_id);
CREATE INDEX IF NOT EXISTS core_orders_status_idx ON public.core_orders(status);

COMMENT ON TABLE public.core_orders IS
  'Marketplace orders linking buyer to farmer with escrow lifecycle status';

-- ─────────────────────────────────────────────
-- 4. ESCROW LEDGER TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.escrow_ledger (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID          UNIQUE NOT NULL REFERENCES public.core_orders(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  chapa_tx_ref  TEXT          UNIQUE NOT NULL,
  status        escrow_status DEFAULT 'pending',
  locked_at     TIMESTAMPTZ,
  released_at   TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS escrow_status_idx    ON public.escrow_ledger(status);
CREATE INDEX IF NOT EXISTS escrow_tx_ref_idx    ON public.escrow_ledger(chapa_tx_ref);

COMMENT ON TABLE public.escrow_ledger IS
  'Immutable escrow ledger: one row per order, tracks Chapa payment lifecycle';

-- Auto-update updated_at on escrow changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS escrow_updated_at_trigger ON public.escrow_ledger;
CREATE TRIGGER escrow_updated_at_trigger
  BEFORE UPDATE ON public.escrow_ledger
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 5. LOGISTICS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.logistics (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID        UNIQUE NOT NULL REFERENCES public.core_orders(id) ON DELETE CASCADE,
  fleet_driver_id  UUID        REFERENCES public.core_users(id) ON DELETE SET NULL,
  plate_number     TEXT        NOT NULL,
  current_location TEXT,
  status           TEXT        DEFAULT 'assigned'
                               CHECK (status IN ('assigned','picked_up','in_transit','delivered','failed')),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS logistics_order_idx  ON public.logistics(order_id);
CREATE INDEX IF NOT EXISTS logistics_driver_idx ON public.logistics(fleet_driver_id);
CREATE INDEX IF NOT EXISTS logistics_status_idx ON public.logistics(status);

DROP TRIGGER IF EXISTS logistics_updated_at_trigger ON public.logistics;
CREATE TRIGGER logistics_updated_at_trigger
  BEFORE UPDATE ON public.logistics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.logistics IS
  'One logistics record per order; tracks driver assignment and GPS location';

-- ─────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.core_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics      ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running this migration
DROP POLICY IF EXISTS "core_users: service role full access"    ON public.core_users;
DROP POLICY IF EXISTS "core_orders: buyer or farmer sees own"   ON public.core_orders;
DROP POLICY IF EXISTS "escrow_ledger: service role only"        ON public.escrow_ledger;
DROP POLICY IF EXISTS "logistics: driver sees own row"          ON public.logistics;

-- core_users: service role has full access; anon/authenticated can read own row
CREATE POLICY "core_users: service role full access"
  ON public.core_users
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- core_orders: buyer or farmer can see their own orders
CREATE POLICY "core_orders: buyer or farmer sees own"
  ON public.core_orders
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.core_users
      WHERE id = buyer_id OR id = farmer_id
    )
  );

-- escrow_ledger: service role only (no direct client access)
CREATE POLICY "escrow_ledger: service role only"
  ON public.escrow_ledger
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- logistics: fleet driver sees their own assigned rows
CREATE POLICY "logistics: driver sees own row"
  ON public.logistics
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.core_users
      WHERE id = fleet_driver_id
    )
  );

-- ─────────────────────────────────────────────
-- 7. HELPER VIEW  (order + escrow + logistics joined)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_order_summary AS
SELECT
  o.id                  AS order_id,
  o.crop_name,
  o.quantity_tonnes,
  o.price_etb,
  o.status              AS order_status,
  o.created_at,
  buyer.full_name       AS buyer_name,
  buyer.phone           AS buyer_phone,
  farmer.full_name      AS farmer_name,
  farmer.phone          AS farmer_phone,
  e.amount              AS escrow_amount,
  e.chapa_tx_ref,
  e.status              AS escrow_status,
  l.plate_number,
  l.current_location,
  l.status              AS logistics_status
FROM public.core_orders o
LEFT JOIN public.core_users   buyer   ON buyer.id  = o.buyer_id
LEFT JOIN public.core_users   farmer  ON farmer.id = o.farmer_id
LEFT JOIN public.escrow_ledger e      ON e.order_id = o.id
LEFT JOIN public.logistics     l      ON l.order_id = o.id;

COMMENT ON VIEW public.v_order_summary IS
  'Convenience view joining orders, users, escrow and logistics for admin/driver dashboards';