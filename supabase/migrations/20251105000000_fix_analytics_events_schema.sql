-- =====================================================
-- Migration: Fix Analytics Events Schema
-- Created: 2025-11-05
-- Phase: Hotfix - Add Missing Columns
-- =====================================================
--
-- Purpose:
-- Adds missing columns to analytics_events table that were defined
-- in docs but never applied to the actual Supabase instance.
--
-- Missing columns:
-- - event_category (TEXT) - Auto-categorized event type
-- - ip_address (TEXT) - Client IP address for geolocation
-- - page_path (TEXT) - Page URL where event occurred
-- - referrer (TEXT) - HTTP referrer header
--
-- This fixes the issue where the API sends these fields but
-- the database rejects them due to missing columns, causing
-- zero visitors/sessions to be tracked in the admin dashboard.
--
-- =====================================================

-- =====================================================
-- 1. Add Missing Columns
-- =====================================================

-- Add event_category column
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS event_category TEXT;

-- Add ip_address column
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add page_path column
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS page_path TEXT;

-- Add referrer column
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- =====================================================
-- 2. Add Indexes for New Columns
-- =====================================================

-- Index for filtering by event category
CREATE INDEX IF NOT EXISTS idx_analytics_events_category
  ON analytics_events(event_category);

-- Index for IP-based analytics (geolocation, fraud detection)
CREATE INDEX IF NOT EXISTS idx_analytics_events_ip
  ON analytics_events(ip_address);

-- Index for page-based analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_page
  ON analytics_events(page_path);

-- Composite index for page views analysis (page + time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_created
  ON analytics_events(page_path, created_at DESC);

-- =====================================================
-- 3. Add Column Comments
-- =====================================================

COMMENT ON COLUMN analytics_events.event_category IS
  'Auto-categorized event type (page, quiz, checkout, product, system) - inferred from event_name';

COMMENT ON COLUMN analytics_events.ip_address IS
  'Client IP address extracted from x-forwarded-for header - used for geolocation and fraud detection';

COMMENT ON COLUMN analytics_events.page_path IS
  'Page URL path where event occurred (e.g., /kviz, /eredmeny/[id]) - enables page-level analytics';

COMMENT ON COLUMN analytics_events.referrer IS
  'HTTP referrer header - tracks traffic sources and user navigation patterns';

-- =====================================================
-- 4. Update Existing NULL Values (Optional)
-- =====================================================

-- Backfill event_category for existing events based on event_name patterns
UPDATE analytics_events
SET event_category = CASE
  WHEN event_name LIKE '%page%' OR event_name LIKE '%landing%' OR event_name LIKE '%result%' THEN 'page'
  WHEN event_name LIKE '%quiz%' OR event_name LIKE '%question%' THEN 'quiz'
  WHEN event_name LIKE '%checkout%' OR event_name LIKE '%payment%' OR event_name LIKE '%purchase%' THEN 'checkout'
  WHEN event_name LIKE '%product%' OR event_name LIKE '%bundle%' THEN 'product'
  ELSE 'system'
END
WHERE event_category IS NULL;

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP INDEX IF EXISTS idx_analytics_events_category;
-- DROP INDEX IF EXISTS idx_analytics_events_ip;
-- DROP INDEX IF EXISTS idx_analytics_events_page;
-- DROP INDEX IF EXISTS idx_analytics_events_page_created;
--
-- ALTER TABLE analytics_events DROP COLUMN IF EXISTS event_category;
-- ALTER TABLE analytics_events DROP COLUMN IF EXISTS ip_address;
-- ALTER TABLE analytics_events DROP COLUMN IF EXISTS page_path;
-- ALTER TABLE analytics_events DROP COLUMN IF EXISTS referrer;
--
-- Note: Dropping columns will permanently delete tracking data.
--
-- =====================================================
