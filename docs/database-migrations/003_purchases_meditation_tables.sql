-- ============================================================================
-- Eredeti Csakra - Database Migration #003
-- Purchases & Meditation Access Tables
-- Created: 2025-10-14
-- ============================================================================

-- ============================================================================
-- TABLE: purchases
-- Description: Stores all product purchases made through Stripe
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,

  -- Customer Info
  email TEXT NOT NULL,

  -- Product Details
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- In HUF (not cents)
  currency TEXT DEFAULT 'HUF',

  -- Stripe References
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Delivery
  pdf_url TEXT, -- Link to generated PDF (if applicable)

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for purchases table
CREATE INDEX IF NOT EXISTS purchases_result_id_idx ON purchases(result_id);
CREATE INDEX IF NOT EXISTS purchases_email_idx ON purchases(email);
CREATE INDEX IF NOT EXISTS purchases_stripe_session_id_idx ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases(created_at DESC);

-- ============================================================================
-- TABLE: meditation_access
-- Description: Tracks meditation package access for users
-- ============================================================================
CREATE TABLE IF NOT EXISTS meditation_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys (using result_id temporarily, will reference purchases.id later)
  purchase_id UUID, -- Will be updated to reference purchases(id) after purchase is created

  -- Access Info
  email TEXT NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = lifetime access

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for meditation_access table
CREATE INDEX IF NOT EXISTS meditation_access_email_idx ON meditation_access(email);
CREATE INDEX IF NOT EXISTS meditation_access_token_idx ON meditation_access(access_token);
CREATE INDEX IF NOT EXISTS meditation_access_expires_at_idx ON meditation_access(expires_at);

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchases table
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS (Optional - adjust based on your RLS policies)
-- ============================================================================
-- Note: These grants assume service_role has full access
-- For production, implement Row Level Security (RLS) policies

-- Grant access to authenticated users (adjust as needed)
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meditation_access ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (commented out - implement when ready):
-- CREATE POLICY "Users can view their own purchases"
--   ON purchases FOR SELECT
--   USING (auth.jwt() ->> 'email' = email);

-- CREATE POLICY "Users can view their own meditation access"
--   ON meditation_access FOR SELECT
--   USING (auth.jwt() ->> 'email' = email);

-- ============================================================================
-- SAMPLE QUERIES (for testing)
-- ============================================================================

-- Get all purchases for a specific result
-- SELECT * FROM purchases WHERE result_id = 'YOUR_RESULT_UUID';

-- Get meditation access for a user
-- SELECT * FROM meditation_access WHERE email = 'user@example.com';

-- Check if meditation access is still valid
-- SELECT * FROM meditation_access
-- WHERE access_token = 'YOUR_TOKEN'
-- AND (expires_at IS NULL OR expires_at > NOW());

-- Get purchase history with meditation access
-- SELECT
--   p.*,
--   ma.access_token,
--   ma.expires_at
-- FROM purchases p
-- LEFT JOIN meditation_access ma ON ma.email = p.email
-- WHERE p.email = 'user@example.com'
-- ORDER BY p.created_at DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
