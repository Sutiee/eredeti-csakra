-- Migration 004: Meditation Access Table
-- Purpose: Token-based access control for meditation audio files
-- Created: 2025-10-14
-- Dependencies: 003_purchases_meditation_tables.sql

-- ============================================================================
-- TABLE: meditation_access
-- ============================================================================
-- Stores access tokens for meditation audio after purchase
-- Each purchase generates a unique token that grants lifetime access

CREATE TABLE IF NOT EXISTS meditation_access (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Purchase reference (optional - for tracking)
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,

  -- User identification
  email TEXT NOT NULL,

  -- Unique access token (used in URL)
  access_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,

  -- Product information
  product_type TEXT NOT NULL CHECK (product_type IN ('meditations', 'handbook', 'bundle')),

  -- Access control
  is_active BOOLEAN DEFAULT true NOT NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = lifetime access

  -- Usage tracking
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  access_count INTEGER DEFAULT 0 NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Index for fast token lookup (main use case)
CREATE INDEX IF NOT EXISTS meditation_access_token_idx
  ON meditation_access(access_token);

-- Index for email lookups (customer support)
CREATE INDEX IF NOT EXISTS meditation_access_email_idx
  ON meditation_access(email);

-- Index for purchase reference
CREATE INDEX IF NOT EXISTS meditation_access_purchase_id_idx
  ON meditation_access(purchase_id);

-- Index for active tokens
CREATE INDEX IF NOT EXISTS meditation_access_active_idx
  ON meditation_access(is_active) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS (currently disabled for simplicity, but prepare for future)
-- ALTER TABLE meditation_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access tokens
-- CREATE POLICY "Users can view own tokens"
--   ON meditation_access FOR SELECT
--   USING (email = auth.email());

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meditation_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meditation_access_updated_at_trigger
  BEFORE UPDATE ON meditation_access
  FOR EACH ROW
  EXECUTE FUNCTION update_meditation_access_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get meditation access by token
CREATE OR REPLACE FUNCTION get_meditation_access(token UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  product_type TEXT,
  is_active BOOLEAN,
  access_granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ma.id,
    ma.email,
    ma.product_type,
    ma.is_active,
    ma.access_granted_at,
    ma.expires_at,
    (ma.is_active AND (ma.expires_at IS NULL OR ma.expires_at > timezone('utc'::text, now())))::BOOLEAN as is_valid
  FROM meditation_access ma
  WHERE ma.access_token = token;
END;
$$ LANGUAGE plpgsql;

-- Function: Track access (update last_accessed_at and increment counter)
CREATE OR REPLACE FUNCTION track_meditation_access(token UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE meditation_access
  SET
    last_accessed_at = timezone('utc'::text, now()),
    access_count = access_count + 1
  WHERE access_token = token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Revoke access
CREATE OR REPLACE FUNCTION revoke_meditation_access(token UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE meditation_access
  SET is_active = false
  WHERE access_token = token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (for development)
-- ============================================================================
-- Uncomment to insert test data

/*
INSERT INTO meditation_access (email, product_type, access_token) VALUES
  ('test@example.com', 'meditations', '550e8400-e29b-41d4-a716-446655440000'),
  ('demo@eredeticsakra.hu', 'bundle', '550e8400-e29b-41d4-a716-446655440001');
*/

-- ============================================================================
-- GRANTS
-- ============================================================================
-- Grant access to service role (Supabase functions)
-- GRANT ALL ON meditation_access TO service_role;

-- Grant select to anon role (for public access via tokens)
-- GRANT SELECT ON meditation_access TO anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE meditation_access IS 'Token-based access control for meditation audio files';
COMMENT ON COLUMN meditation_access.access_token IS 'Unique UUID token used in meditation page URL';
COMMENT ON COLUMN meditation_access.expires_at IS 'NULL means lifetime access (default for purchased content)';
COMMENT ON COLUMN meditation_access.product_type IS 'Type of product: meditations, handbook, or bundle';
COMMENT ON COLUMN meditation_access.access_count IS 'Number of times the meditation page was accessed';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify table creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meditation_access') THEN
    RAISE NOTICE 'Migration 004: meditation_access table created successfully';
  ELSE
    RAISE EXCEPTION 'Migration 004: Failed to create meditation_access table';
  END IF;
END $$;
