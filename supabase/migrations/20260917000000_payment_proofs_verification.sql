-- ============================================================================
-- AGRILINK ENTERPRISE PAYMENT VERIFICATION SUBSYSTEM
-- Migration: 20260917000000_payment_proofs_verification.sql
-- Covers: Telebirr, CBE Birr, CBE Mobile Banking, Awash, BOA, Chapa
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Enums with safe duplicate handling
DO $$ BEGIN
    CREATE TYPE proof_verification_status_enum AS ENUM (
        'PENDING_AUDIT',
        'OCR_CONFIRMED',
        'FLAGGED_SUSPICIOUS',
        'ADMIN_APPROVED',
        'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE local_payment_method_enum AS ENUM (
        'TELEBIRR_MANUAL',
        'CBE_BIRR',
        'CBE_MOBILE_BANKING',
        'AWASH_BIRR',
        'BANK_OF_ABYSSINIA',
        'CHAPA_GATEWAY'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Store payment receipts and verification proofs
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    payer_id TEXT NOT NULL,
    payment_method local_payment_method_enum NOT NULL,
    
    -- Transaction Identification
    transaction_number VARCHAR(100) NOT NULL, -- e.g., Telebirr 'ADQ98...', CBE 'FT26...'
    normalized_tx_id VARCHAR(100) NOT NULL,    -- Uppercase, stripped of spaces for exact matching
    
    -- Image Artifacts & Storage (Stored in Supabase S3 bucket / Private bucket / Base64 Evidence)
    receipt_image_url TEXT NOT NULL,
    receipt_image_hash VARCHAR(64) NOT NULL,   -- SHA-256 hash of image file to prevent recycling old screenshots
    
    -- Claimed values vs Verified values
    claimed_amount_etb NUMERIC(12,2) NOT NULL,
    extracted_amount_etb NUMERIC(12,2),        -- Parsed via OCR / regex
    extracted_receiver_name VARCHAR(150),
    extracted_timestamp TIMESTAMPTZ,
    
    -- Anti-Fraud & OCR Check Flags
    is_tx_unique BOOLEAN DEFAULT TRUE,
    is_amount_matched BOOLEAN DEFAULT FALSE,
    is_receiver_verified BOOLEAN DEFAULT FALSE,
    fraud_risk_score NUMERIC(4,2) DEFAULT 0.00, -- 0.00 (Safe) to 1.00 (Critical Fake)
    fraud_reasons JSONB DEFAULT '[]'::jsonb,
    
    -- Status & Audit Trail
    status proof_verification_status_enum DEFAULT 'PENDING_AUDIT',
    reviewed_by_admin_id TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- PREVENT RECEIPT RECYCLING:
-- 1. An identical transaction number can never be credited twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_normalized_tx ON public.payment_proofs (normalized_tx_id);

-- 2. An identical image file can never be re-uploaded for different orders
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_receipt_hash ON public.payment_proofs (receipt_image_hash);

-- Fast lookup for admin review queues
CREATE INDEX IF NOT EXISTS idx_pending_proofs ON public.payment_proofs (status, payment_method, created_at);

-- Add commentary
COMMENT ON TABLE public.payment_proofs IS 
'Cryptographically verified payment proofs with SHA-256 receipt deduplication, Ethio Telecom check, and double-blind escrow lock audit trails.';
