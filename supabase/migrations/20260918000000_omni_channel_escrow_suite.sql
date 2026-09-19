-- ============================================================================
-- AGRILINK OMNI-CHANNEL ESCROW & PAYMENT SUITE
-- Migration: 20260918000000_omni_channel_escrow_suite.sql
-- Supported Channels: Visa, Mastercard, CBE Mobile Banking, CBE Birr, 
--                    Telebirr, Bank of Abyssinia, Awash, Dashen (Amole)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Supported Rails
DO $$ BEGIN
    CREATE TYPE omni_payment_rail_enum AS ENUM (
        'VISA_MASTERCARD',       -- Automated (Card)
        'CBE_MOBILE_BANKING',    -- Manual / Semi-automated (FT/Journal Ref + Receipt)
        'CBE_BIRR',              -- Manual / USSD (Tx ID + Receipt)
        'TELEBIRR_DIRECT',       -- Automated API Gateway
        'TELEBIRR_MANUAL',       -- P2P / Merchant Transfer (Tx ID + Receipt)
        'BANK_OF_ABYSSINIA',     -- BOA Mobile / Internet Banking
        'AWASH_BIRR',            -- Awash Bank Transfer
        'DASHEN_AMOLE'           -- Dashen Bank / Amole
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE verification_flow_enum AS ENUM (
        'AUTOMATED_GATEWAY',      -- Webhook-driven (Instant)
        'MANUAL_PROOF_SUBMITTED', -- Buyer uploaded receipt
        'OCR_CROSSCHECKED',       -- AI/OCR verified receipt text
        'FINANCE_AUDITED',        -- Platform team approved
        'REJECTED'                -- Invalid ID or fake receipt
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Master Table of Platform Receivers (Where Buyers Send Money)
CREATE TABLE IF NOT EXISTS public.platform_payment_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail omni_payment_rail_enum NOT NULL,
    account_or_merchant_name VARCHAR(120) NOT NULL, -- e.g. "Agrilink Escrow Account"
    account_number VARCHAR(100) NOT NULL,            -- e.g. "1000284719283" or shortcode
    branch_or_bank_name VARCHAR(100),
    instructions_am TEXT,                           -- Amharic instructions
    instructions_en TEXT,                           -- English instructions
    qr_code_image_url TEXT,                         -- Scannable QR code
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed Agrilink's Official Receiving Endpoints (Idempotent)
INSERT INTO public.platform_payment_endpoints (rail, account_or_merchant_name, account_number, branch_or_bank_name, instructions_en)
SELECT 'CBE_MOBILE_BANKING', 'Agrilink Escrow Vault', '1000492819281', 'Finfinnee Branch', 'Transfer using CBE Mobile Banking app. Copy the FT transaction number and take a screenshot.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_payment_endpoints WHERE rail = 'CBE_MOBILE_BANKING' AND account_number = '1000492819281');

INSERT INTO public.platform_payment_endpoints (rail, account_or_merchant_name, account_number, branch_or_bank_name, instructions_en)
SELECT 'CBE_BIRR', 'Agrilink Tech Escrow', '0911002233', 'CBE Birr', 'Send via CBE Birr to mobile number or pay bill code. Save the SMS or receipt.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_payment_endpoints WHERE rail = 'CBE_BIRR' AND account_number = '0911002233');

INSERT INTO public.platform_payment_endpoints (rail, account_or_merchant_name, account_number, branch_or_bank_name, instructions_en)
SELECT 'TELEBIRR_MANUAL', 'Agrilink Technologies PLC', '849201', 'Ethio Telecom Merchant', 'Pay via telebirr Merchant Code 849201. Submit the 10-character transaction number.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_payment_endpoints WHERE rail = 'TELEBIRR_MANUAL' AND account_number = '849201');

INSERT INTO public.platform_payment_endpoints (rail, account_or_merchant_name, account_number, branch_or_bank_name, instructions_en)
SELECT 'BANK_OF_ABYSSINIA', 'Agrilink Escrow Vault', '84928102', 'Bole Branch', 'Transfer using BoA Mobile App. Enter the reference number shown on the receipt.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_payment_endpoints WHERE rail = 'BANK_OF_ABYSSINIA' AND account_number = '84928102');

-- 3. Comprehensive Payment Audit & Receipt Submissions
CREATE TABLE IF NOT EXISTS public.payment_proof_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    payer_id TEXT NOT NULL,
    rail omni_payment_rail_enum NOT NULL,
    
    -- Transaction Identifiers
    tx_reference_number VARCHAR(100),                -- FT number, Telebirr Tx ID, or Card Ref
    normalized_ref VARCHAR(100) UNIQUE,             -- Prevents re-using the same transaction twice
    
    -- Receipt Storage & Duplication Guard
    receipt_image_url TEXT,
    receipt_image_sha256 VARCHAR(64) UNIQUE,        -- Prevents reusing the exact same screenshot
    
    -- Financial Audit Fields
    expected_amount_etb NUMERIC(12,2) NOT NULL,
    claimed_amount_etb NUMERIC(12,2) NOT NULL,
    detected_amount_etb NUMERIC(12,2),
    
    -- Verification State Machine
    verification_flow verification_flow_enum DEFAULT 'MANUAL_PROOF_SUBMITTED',
    rejection_code VARCHAR(50),                     -- 'INVALID_TX_ID', 'AMOUNT_MISMATCH', 'DUPLICATE_RECEIPT'
    admin_reviewed_by TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_proof_sub_normalized ON public.payment_proof_submissions (normalized_ref);
CREATE INDEX IF NOT EXISTS idx_proof_sub_sha256 ON public.payment_proof_submissions (receipt_image_sha256);
CREATE INDEX IF NOT EXISTS idx_proof_sub_flow ON public.payment_proof_submissions (verification_flow, rail, created_at);
