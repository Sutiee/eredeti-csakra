-- =====================================================
-- Migration: Gift Purchases System
-- Created: 2025-10-30
-- Phase: v2.5 - Gift Bundle Upsell Feature
-- =====================================================
--
-- Purpose:
-- Creates gift_purchases table for tracking gift product purchases,
-- coupon codes, and redemption status.
--
-- Gift Flow:
-- 1. User purchases gift on success page (modal upsell)
-- 2. System generates unique gift code + Stripe coupon
-- 3. Gift code stored with status 'active'
-- 4. Recipient receives email with gift code
-- 5. Recipient redeems gift (completes quiz, applies code)
-- 6. Status updated to 'redeemed', linked to actual purchase
--
-- =====================================================

-- =====================================================
-- 1. Create gift_purchases Table
-- =====================================================

CREATE TABLE IF NOT EXISTS gift_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Buyer information
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  -- Recipient information (optional - can be anonymous gift)
  recipient_email TEXT,
  recipient_name TEXT,
  gift_message TEXT,

  -- Product details
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'HUF',

  -- Pricing variant tracking (A/B/C test attribution)
  variant_id CHAR(1) DEFAULT 'a' CHECK (variant_id IN ('a', 'b', 'c')),

  -- Stripe references
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_coupon_id TEXT UNIQUE NOT NULL,
  stripe_promo_code_id TEXT UNIQUE NOT NULL,

  -- Gift code (customer-facing)
  gift_code TEXT UNIQUE NOT NULL,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Payment processing
    'active',       -- Gift code ready for redemption
    'redeemed',     -- Gift has been claimed
    'expired',      -- 30 days passed without redemption
    'cancelled'     -- Gift purchase refunded/cancelled
  )),

  -- Redemption tracking
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by_result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,
  redeemed_purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Create Indexes
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_gift_purchases_gift_code
  ON gift_purchases(gift_code);

CREATE INDEX IF NOT EXISTS idx_gift_purchases_buyer_email
  ON gift_purchases(buyer_email);

CREATE INDEX IF NOT EXISTS idx_gift_purchases_recipient_email
  ON gift_purchases(recipient_email);

-- Stripe integration indexes
CREATE INDEX IF NOT EXISTS idx_gift_purchases_stripe_session_id
  ON gift_purchases(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_gift_purchases_stripe_coupon_id
  ON gift_purchases(stripe_coupon_id);

CREATE INDEX IF NOT EXISTS idx_gift_purchases_stripe_promo_code_id
  ON gift_purchases(stripe_promo_code_id);

-- Status and expiration indexes
CREATE INDEX IF NOT EXISTS idx_gift_purchases_status
  ON gift_purchases(status);

CREATE INDEX IF NOT EXISTS idx_gift_purchases_expires_at
  ON gift_purchases(expires_at);

-- Variant tracking index (A/B/C test analysis)
CREATE INDEX IF NOT EXISTS idx_gift_purchases_variant_id
  ON gift_purchases(variant_id);

-- Composite index for redemption queries
CREATE INDEX IF NOT EXISTS idx_gift_purchases_status_expires
  ON gift_purchases(status, expires_at);

-- Composite index for variant analysis
CREATE INDEX IF NOT EXISTS idx_gift_purchases_product_variant
  ON gift_purchases(product_id, variant_id);

-- =====================================================
-- 3. Create updated_at Trigger
-- =====================================================

-- Trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to gift_purchases
CREATE TRIGGER update_gift_purchases_updated_at
  BEFORE UPDATE ON gift_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Row Level Security (RLS)
-- =====================================================

ALTER TABLE gift_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (gift purchase creation via API)
CREATE POLICY "Allow public insert for gift purchases"
  ON gift_purchases
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public select for gift code validation
-- (Restricted to specific columns via API layer)
CREATE POLICY "Allow public select for gift validation"
  ON gift_purchases
  FOR SELECT
  USING (true);

-- Policy: Allow public update for redemption
-- (Restricted to status transitions via API layer)
CREATE POLICY "Allow public update for gift redemption"
  ON gift_purchases
  FOR UPDATE
  USING (true);

-- =====================================================
-- 5. Add Comments
-- =====================================================

COMMENT ON TABLE gift_purchases IS
  'Tracks gift product purchases, coupon codes, and redemption status for the gift upsell feature';

COMMENT ON COLUMN gift_purchases.gift_code IS
  'Unique customer-facing gift code (e.g., GIFT-ABC123XY)';

COMMENT ON COLUMN gift_purchases.stripe_coupon_id IS
  'Stripe Coupon ID (100% off, single-use, 30-day expiration)';

COMMENT ON COLUMN gift_purchases.stripe_promo_code_id IS
  'Stripe Promotion Code ID linked to the coupon';

COMMENT ON COLUMN gift_purchases.status IS
  'Gift status: pending → active → redeemed/expired/cancelled';

COMMENT ON COLUMN gift_purchases.variant_id IS
  'Pricing variant (a/b/c) used for this gift purchase - enables A/B/C test analysis';

COMMENT ON COLUMN gift_purchases.expires_at IS
  '30 days from creation - after this date, gift code cannot be redeemed';

COMMENT ON COLUMN gift_purchases.redeemed_purchase_id IS
  'Links to the actual purchase record created when gift is redeemed';

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS update_gift_purchases_updated_at ON gift_purchases;
-- DROP POLICY IF EXISTS "Allow public insert for gift purchases" ON gift_purchases;
-- DROP POLICY IF EXISTS "Allow public select for gift validation" ON gift_purchases;
-- DROP POLICY IF EXISTS "Allow public update for gift redemption" ON gift_purchases;
-- DROP TABLE IF EXISTS gift_purchases CASCADE;
--
-- Note: Dropping the table will permanently delete all gift purchase data.
-- Consider exporting data before rollback if needed.
--
-- =====================================================
