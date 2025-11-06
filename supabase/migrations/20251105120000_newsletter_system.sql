-- =====================================================
-- Migration: Newsletter Campaign System
-- Created: 2025-11-05
-- Phase: v2.5 - Marketing Automation
-- =====================================================
--
-- Purpose:
-- Creates newsletter_campaigns and newsletter_sends tables for
-- managing email marketing campaigns with A/B/C variant testing
-- and comprehensive audit trails.
--
-- Newsletter Campaign Flow:
-- 1. Admin creates campaign via dashboard (name, subject, variant)
-- 2. System calculates total recipients from quiz_results
-- 3. Campaign status: draft → sending → completed/failed
-- 4. Individual sends tracked in newsletter_sends (audit trail)
-- 5. Real-time progress tracking via sent_count/failed_count
-- 6. Resend API integration for delivery + bounce tracking
--
-- =====================================================

-- =====================================================
-- 1. Create newsletter_campaigns Table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign metadata
  name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  email_template_variant CHAR(1) NOT NULL CHECK (email_template_variant IN ('a', 'b', 'c')),

  -- Recipient tracking
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,

  -- Admin tracking (simple TEXT field - no FK, for future auth integration)
  admin_user_id TEXT,

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',      -- Campaign created but not started
    'sending',    -- Currently sending emails
    'completed',  -- All emails sent successfully
    'failed'      -- Campaign failed (critical error)
  )),

  -- Execution timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Create newsletter_sends Table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign reference
  campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,

  -- Recipient information
  email TEXT NOT NULL,
  name TEXT,

  -- Variant tracking (denormalized for analysis)
  variant_id CHAR(1) NOT NULL CHECK (variant_id IN ('a', 'b', 'c')),

  -- Quiz result reference (optional - for personalization)
  result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Queued for sending
    'sent',       -- Successfully sent via Resend API
    'failed',     -- Send attempt failed (API error)
    'bounced'     -- Email bounced (invalid recipient)
  )),

  -- Resend API tracking
  resend_email_id TEXT,

  -- Error tracking
  error_message TEXT,

  -- Delivery timestamp
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Standard timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status
  ON newsletter_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at
  ON newsletter_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_admin_user
  ON newsletter_campaigns(admin_user_id);

-- Send indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_id
  ON newsletter_sends(campaign_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_email
  ON newsletter_sends(email);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_status
  ON newsletter_sends(status);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_created_at
  ON newsletter_sends(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_result_id
  ON newsletter_sends(result_id);

-- Composite index for campaign progress queries
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_status
  ON newsletter_sends(campaign_id, status);

-- Composite index for variant analysis
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_variant
  ON newsletter_sends(campaign_id, variant_id);

-- Composite index for time-based analysis
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_variant_sent_at
  ON newsletter_sends(variant_id, sent_at);

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

-- Apply trigger to newsletter_campaigns
CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

-- Disable RLS - Server-side admin access only
-- Security model: Only service_role key can access these tables
-- No public access required - admin dashboard uses server-side API routes

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- No policies defined - defaults to DENY for anon/authenticated roles
-- Only service_role key (server-side) can INSERT/SELECT/UPDATE/DELETE

COMMENT ON TABLE newsletter_campaigns IS
  'RLS enabled but no policies - server-side admin access only via service_role key';

COMMENT ON TABLE newsletter_sends IS
  'RLS enabled but no policies - server-side admin access only via service_role key';

-- =====================================================
-- 6. Add Comments
-- =====================================================

COMMENT ON TABLE newsletter_campaigns IS
  'Tracks newsletter email campaigns with A/B/C variant testing and progress monitoring';

COMMENT ON TABLE newsletter_sends IS
  'Audit trail for individual email sends - tracks delivery status, errors, and Resend API responses';

COMMENT ON COLUMN newsletter_campaigns.email_template_variant IS
  'Email template variant (a/b/c) used for this campaign - enables A/B/C test analysis';

COMMENT ON COLUMN newsletter_campaigns.total_recipients IS
  'Total number of recipients calculated at campaign creation';

COMMENT ON COLUMN newsletter_campaigns.sent_count IS
  'Real-time counter - incremented as emails are sent successfully';

COMMENT ON COLUMN newsletter_campaigns.failed_count IS
  'Real-time counter - incremented when email sends fail';

COMMENT ON COLUMN newsletter_campaigns.admin_user_id IS
  'Admin user who created the campaign (simple TEXT field for future auth integration)';

COMMENT ON COLUMN newsletter_sends.variant_id IS
  'Denormalized variant ID for fast analysis queries without JOIN';

COMMENT ON COLUMN newsletter_sends.result_id IS
  'Optional FK to quiz_results - enables personalized email content based on chakra scores';

COMMENT ON COLUMN newsletter_sends.resend_email_id IS
  'Resend API email ID for tracking delivery, opens, clicks (future feature)';

COMMENT ON COLUMN newsletter_sends.error_message IS
  'Detailed error message from Resend API or internal processing error';

-- =====================================================
-- 7. Performance & Maintenance Notes
-- =====================================================

-- Query patterns optimized by indexes:
--
-- 1. Campaign dashboard queries:
--    SELECT * FROM newsletter_campaigns
--    WHERE status = 'sending'
--    ORDER BY created_at DESC;
--    → Uses idx_newsletter_campaigns_status + idx_newsletter_campaigns_created_at
--
-- 2. Campaign progress tracking:
--    SELECT sent_count, failed_count, total_recipients
--    FROM newsletter_campaigns WHERE id = $1;
--    → Uses PRIMARY KEY (id)
--
-- 3. Individual send audit:
--    SELECT * FROM newsletter_sends
--    WHERE campaign_id = $1 AND status = 'failed';
--    → Uses idx_newsletter_sends_campaign_status (composite)
--
-- 4. Variant performance analysis:
--    SELECT variant_id, COUNT(*), AVG(sent_at - created_at) AS avg_latency
--    FROM newsletter_sends
--    WHERE campaign_id = $1 AND status = 'sent'
--    GROUP BY variant_id;
--    → Uses idx_newsletter_sends_campaign_variant
--
-- 5. Email lookup (bounce tracking):
--    SELECT * FROM newsletter_sends
--    WHERE email = $1 AND status = 'bounced';
--    → Uses idx_newsletter_sends_email
--
-- Maintenance:
-- - Consider partitioning newsletter_sends by campaign_id or created_at
--   if campaign volume exceeds 1M+ sends
-- - Archive completed campaigns older than 90 days to separate table
-- - Add VACUUM ANALYZE schedule for both tables

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS update_newsletter_campaigns_updated_at ON newsletter_campaigns;
-- DROP TABLE IF EXISTS newsletter_sends CASCADE;
-- DROP TABLE IF EXISTS newsletter_campaigns CASCADE;
--
-- Note: Dropping tables will permanently delete all campaign data and audit trails.
-- Consider exporting data before rollback if needed:
--
-- COPY newsletter_campaigns TO '/tmp/newsletter_campaigns_backup.csv' CSV HEADER;
-- COPY newsletter_sends TO '/tmp/newsletter_sends_backup.csv' CSV HEADER;
--
-- =====================================================
