-- ============================================================================
-- Eredeti Csakra v1.5 - Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================================

-- 1. CREATE PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'HUF',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for purchases
CREATE INDEX IF NOT EXISTS purchases_result_id_idx ON purchases(result_id);
CREATE INDEX IF NOT EXISTS purchases_email_idx ON purchases(email);
CREATE INDEX IF NOT EXISTS purchases_stripe_session_id_idx ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases(created_at DESC);

-- 2. CREATE MEDITATION_ACCESS TABLE
CREATE TABLE IF NOT EXISTS meditation_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID,
  email TEXT NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  product_type TEXT,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for meditation_access
CREATE INDEX IF NOT EXISTS meditation_access_email_idx ON meditation_access(email);
CREATE INDEX IF NOT EXISTS meditation_access_token_idx ON meditation_access(access_token);
CREATE INDEX IF NOT EXISTS meditation_access_expires_at_idx ON meditation_access(expires_at);

-- 3. CREATE UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER FOR PURCHASES
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. VERIFY TABLES CREATED
SELECT
  'purchases' as table_name,
  count(*) as row_count
FROM purchases
UNION ALL
SELECT
  'meditation_access' as table_name,
  count(*) as row_count
FROM meditation_access;

-- ============================================================================
-- DONE! Tables created successfully.
-- ============================================================================
