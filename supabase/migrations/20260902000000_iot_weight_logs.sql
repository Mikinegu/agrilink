-- Migration: 20260902000000_iot_weight_logs.sql
-- Description: Create IoT Weight Logs table for verifiable transit cargo measurements

CREATE TABLE IF NOT EXISTS public.iot_weight_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id      TEXT        NOT NULL,
  order_id       TEXT        NOT NULL,
  weight_kg      NUMERIC(10,3) NOT NULL CHECK (weight_kg > 0),
  receipt_id     TEXT        NOT NULL UNIQUE,
  logged_at      TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_iot_weight_logs_order_id ON public.iot_weight_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_iot_weight_logs_logged_at ON public.iot_weight_logs (logged_at DESC);

-- Row Level Security
ALTER TABLE public.iot_weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON public.iot_weight_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
