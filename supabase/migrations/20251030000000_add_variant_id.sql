-- =====================================================
-- Migration: Add Variant ID for A/B/C Pricing Tests
-- Created: 2025-10-30
-- Phase: v1.6 - A/B/C Pricing Variant Testing
-- =====================================================
--
-- Purpose:
-- Adds variant_id column to analytics_events and purchases tables
-- to track which pricing variant (A/B/C) was shown to the user.
--
-- Variant IDs:
-- - 'a': Control group (baseline pricing: AI 990 Ft, Workbook 3,990 Ft)
-- - 'b': Mid-tier test (AI 1,990 Ft, Workbook 4,990 Ft)
-- - 'c': Premium test (AI 2,990 Ft, Workbook 5,990 Ft)
--
-- =====================================================

-- =====================================================
-- 1. Add variant_id to analytics_events
-- =====================================================

ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS variant_id CHAR(1) DEFAULT 'a'
CHECK (variant_id IN ('a', 'b', 'c'));

-- Index for filtering by variant
CREATE INDEX IF NOT EXISTS idx_analytics_events_variant
  ON analytics_events(variant_id);

-- Composite index for event analysis by variant
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_variant
  ON analytics_events(event_name, variant_id);

COMMENT ON COLUMN analytics_events.variant_id IS
  'Pricing variant ID (a/b/c) for A/B/C testing attribution';

-- =====================================================
-- 2. Add variant_id to purchases
-- =====================================================

ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS variant_id CHAR(1) DEFAULT 'a'
CHECK (variant_id IN ('a', 'b', 'c'));

-- Index for conversion rate analysis by variant
CREATE INDEX IF NOT EXISTS idx_purchases_variant
  ON purchases(variant_id);

-- Composite index for product performance by variant
CREATE INDEX IF NOT EXISTS idx_purchases_product_variant
  ON purchases(product_id, variant_id);

COMMENT ON COLUMN purchases.variant_id IS
  'Pricing variant ID (a/b/c) used for this purchase - enables A/B/C test analysis';

-- =====================================================
-- 3. Add variant_id to quiz_results (for reference)
-- =====================================================

ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS variant_id CHAR(1) DEFAULT 'a'
CHECK (variant_id IN ('a', 'b', 'c'));

-- Index for variant distribution analysis
CREATE INDEX IF NOT EXISTS idx_quiz_results_variant
  ON quiz_results(variant_id);

COMMENT ON COLUMN quiz_results.variant_id IS
  'Pricing variant ID (a/b/c) assigned when quiz was completed';

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP INDEX IF EXISTS idx_analytics_events_variant;
-- DROP INDEX IF EXISTS idx_analytics_events_name_variant;
-- DROP INDEX IF EXISTS idx_purchases_variant;
-- DROP INDEX IF EXISTS idx_purchases_product_variant;
-- DROP INDEX IF EXISTS idx_quiz_results_variant;
--
-- ALTER TABLE analytics_events DROP COLUMN IF EXISTS variant_id;
-- ALTER TABLE purchases DROP COLUMN IF EXISTS variant_id;
-- ALTER TABLE quiz_results DROP COLUMN IF EXISTS variant_id;
--
-- Note: Dropping columns will permanently delete variant tracking data.
--
-- =====================================================
