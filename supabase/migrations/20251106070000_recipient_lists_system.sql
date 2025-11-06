-- =====================================================
-- Migration: Saved Recipient Lists System
-- Created: 2025-11-06
-- Phase: v2.5 - Marketing Automation
-- =====================================================
--
-- Purpose:
-- Creates recipient_lists and recipients tables for managing
-- reusable email recipient lists with A/B/C variant distribution.
-- Enables admins to save and reuse segmented audiences for campaigns.
--
-- Recipient List Flow:
-- 1. Admin creates list via dashboard (name, description)
-- 2. Admin uploads CSV with recipients (name, email)
-- 3. System automatically assigns A/B/C variants (balanced distribution)
-- 4. List can be selected in newsletter campaigns as recipient source
-- 5. Supports multiple lists per admin (max 20)
-- 6. Variants enable A/B/C testing without regenerating lists
--
-- =====================================================

-- =====================================================
-- 1. Create recipient_lists Table
-- =====================================================

CREATE TABLE IF NOT EXISTS recipient_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- List metadata
  name TEXT NOT NULL,
  description TEXT,

  -- Recipient tracking
  total_recipients INTEGER NOT NULL DEFAULT 0,
  variant_distribution JSONB NOT NULL DEFAULT '{"a": 0, "b": 0, "c": 0}'::jsonb,

  -- Admin tracking (simple TEXT field - no FK, for future auth integration)
  created_by TEXT,

  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (total_recipients >= 0),
  CHECK (jsonb_typeof(variant_distribution) = 'object')
);

-- =====================================================
-- 2. Create recipients Table
-- =====================================================

CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- List reference
  recipient_list_id UUID NOT NULL REFERENCES recipient_lists(id) ON DELETE CASCADE,

  -- Recipient information
  name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Variant assignment (balanced distribution: a/b/c)
  variant CHAR(1) NOT NULL CHECK (variant IN ('a', 'b', 'c')),

  -- Optional quiz result reference (for personalized campaigns)
  result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  -- Standard timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Email uniqueness within each list (prevent duplicates)
  UNIQUE(recipient_list_id, email)
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Recipient list indexes
CREATE INDEX IF NOT EXISTS idx_recipient_lists_created_at
  ON recipient_lists(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipient_lists_created_by
  ON recipient_lists(created_by);

-- Recipient indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_recipients_list_id
  ON recipients(recipient_list_id);

CREATE INDEX IF NOT EXISTS idx_recipients_email
  ON recipients(email);

CREATE INDEX IF NOT EXISTS idx_recipients_variant
  ON recipients(variant);

-- Composite index for list-variant queries
CREATE INDEX IF NOT EXISTS idx_recipients_list_variant
  ON recipients(recipient_list_id, variant);

-- Composite index for email lookup across lists
CREATE INDEX IF NOT EXISTS idx_recipients_email_list
  ON recipients(email, recipient_list_id);

-- =====================================================
-- 4. Create updated_at Trigger
-- =====================================================

-- Reuse existing trigger function (from gift_purchases migration)
-- If it doesn't exist, create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to recipient_lists
CREATE TRIGGER update_recipient_lists_updated_at
  BEFORE UPDATE ON recipient_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Create Constraint Function
-- =====================================================

-- Function to enforce max 20 lists per admin user
CREATE OR REPLACE FUNCTION check_recipient_lists_per_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    IF (
      SELECT COUNT(*)
      FROM recipient_lists
      WHERE created_by = NEW.created_by
    ) >= 20 THEN
      RAISE EXCEPTION 'Maximum 20 recipient lists allowed per admin user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply constraint trigger (runs BEFORE INSERT)
CREATE TRIGGER enforce_recipient_lists_limit
  BEFORE INSERT ON recipient_lists
  FOR EACH ROW
  EXECUTE FUNCTION check_recipient_lists_per_admin();

-- =====================================================
-- 6. Row Level Security (RLS)
-- =====================================================

-- Disable RLS - Server-side admin access only
-- Security model: Only service_role key can access these tables
-- No public access required - admin dashboard uses server-side API routes

ALTER TABLE recipient_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- No policies defined - defaults to DENY for anon/authenticated roles
-- Only service_role key (server-side) can INSERT/SELECT/UPDATE/DELETE

COMMENT ON TABLE recipient_lists IS
  'RLS enabled but no policies - server-side admin access only via service_role key';

COMMENT ON TABLE recipients IS
  'RLS enabled but no policies - server-side admin access only via service_role key';

-- =====================================================
-- 7. Add Comments
-- =====================================================

COMMENT ON TABLE recipient_lists IS
  'Stores reusable email recipient lists for newsletter campaigns - enables saved audience segmentation';

COMMENT ON TABLE recipients IS
  'Individual recipients within a saved list - tracks variant assignment and optional quiz result reference';

COMMENT ON COLUMN recipient_lists.name IS
  'Human-readable list name (e.g., "Legjobb 1000 - 2025 Nov")';

COMMENT ON COLUMN recipient_lists.description IS
  'Optional description explaining list purpose or segmentation criteria';

COMMENT ON COLUMN recipient_lists.total_recipients IS
  'Cached count of recipients in this list - updated via trigger or application logic';

COMMENT ON COLUMN recipient_lists.variant_distribution IS
  'JSONB object tracking A/B/C variant distribution (e.g., {"a": 333, "b": 333, "c": 334})';

COMMENT ON COLUMN recipient_lists.created_by IS
  'Admin user who created the list (simple TEXT field for future auth integration)';

COMMENT ON COLUMN recipients.recipient_list_id IS
  'Foreign key to recipient_lists - CASCADE DELETE removes all recipients when list is deleted';

COMMENT ON COLUMN recipients.variant IS
  'Variant assignment (a/b/c) - automatically assigned for balanced distribution in A/B/C tests';

COMMENT ON COLUMN recipients.result_id IS
  'Optional FK to quiz_results - enables personalized campaigns based on chakra scores';

COMMENT ON COLUMN recipients.email IS
  'Recipient email address - must be unique within each recipient_list_id';

-- =====================================================
-- 8. Performance & Maintenance Notes
-- =====================================================

-- Query patterns optimized by indexes:
--
-- 1. List all recipient lists for admin:
--    SELECT * FROM recipient_lists
--    WHERE created_by = $1
--    ORDER BY created_at DESC;
--    → Uses idx_recipient_lists_created_by + idx_recipient_lists_created_at
--
-- 2. Get all recipients in a list:
--    SELECT * FROM recipients
--    WHERE recipient_list_id = $1;
--    → Uses idx_recipients_list_id
--
-- 3. Get recipients by variant for campaign:
--    SELECT * FROM recipients
--    WHERE recipient_list_id = $1 AND variant = 'a';
--    → Uses idx_recipients_list_variant (composite)
--
-- 4. Check email exists in list:
--    SELECT EXISTS (
--      SELECT 1 FROM recipients
--      WHERE recipient_list_id = $1 AND email = $2
--    );
--    → Uses idx_recipients_email_list (composite)
--
-- 5. Count variants in list:
--    SELECT variant, COUNT(*) AS count
--    FROM recipients
--    WHERE recipient_list_id = $1
--    GROUP BY variant;
--    → Uses idx_recipients_list_variant
--
-- Maintenance:
-- - Consider partitioning recipients by recipient_list_id if lists exceed 100K+ recipients
-- - Add VACUUM ANALYZE schedule for both tables after bulk imports
-- - Archive old/unused lists to separate table after 180 days
-- - Monitor constraint trigger performance if many admins create lists concurrently

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS enforce_recipient_lists_limit ON recipient_lists;
-- DROP TRIGGER IF EXISTS update_recipient_lists_updated_at ON recipient_lists;
-- DROP FUNCTION IF EXISTS check_recipient_lists_per_admin();
-- DROP TABLE IF EXISTS recipients CASCADE;
-- DROP TABLE IF EXISTS recipient_lists CASCADE;
--
-- Note: Dropping tables will permanently delete all saved recipient lists and recipients.
-- Consider exporting data before rollback if needed:
--
-- COPY recipient_lists TO '/tmp/recipient_lists_backup.csv' CSV HEADER;
-- COPY recipients TO '/tmp/recipients_backup.csv' CSV HEADER;
--
-- =====================================================
