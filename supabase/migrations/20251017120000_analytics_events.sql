-- =====================================================
-- Migration: Analytics Events Table
-- Created: 2025-10-17
-- Phase: v2.1 - Phase 4 (Analytics & Tracking System)
-- =====================================================
--
-- Purpose:
-- Creates the analytics_events table for tracking user behavior
-- throughout the quiz result and checkout funnel.
--
-- Event Types Supported:
-- - accordion_open: User expands chakra detail accordion
-- - sticky_show: Sticky CTA bar appears in viewport
-- - sticky_click: User clicks sticky CTA button
-- - softupsell_click: User clicks soft upsell link
-- - pricing_select: User selects a product card
-- - checkout_start: User initiates checkout flow
-- - purchase: Successful purchase completion
--
-- Example Event Properties (JSONB):
-- accordion_open: {"chakra": "Gyökércsakra", "position": 0, "score": 8}
-- sticky_show: {"trigger": "scroll", "trigger_value": 30, "scroll_depth_px": 1200}
-- sticky_click: {"copy_variant": "Egyensúlyt kérek", "blocked_count": 3}
-- softupsell_click: {"position": "top", "time_on_page": 32}
-- pricing_select: {"product_id": "bundle_complete", "is_decoy": true, "price": 6990}
-- checkout_start: {"product_id": "bundle_complete", "source": "sticky", "funnel_time": 145}
-- purchase: {"product_id": "bundle_complete", "amount": 6990, "funnel_time": 298}
--
-- =====================================================

-- =====================================================
-- 1. Create analytics_events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to quiz result (nullable for non-result events)
  result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,

  -- Event metadata
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,

  -- Session tracking
  session_id TEXT,

  -- Device/browser information
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Create Performance Indexes
-- =====================================================

-- Index for filtering by result_id (most common query)
CREATE INDEX IF NOT EXISTS idx_analytics_events_result
  ON analytics_events(result_id);

-- Index for filtering by event_name
CREATE INDEX IF NOT EXISTS idx_analytics_events_name
  ON analytics_events(event_name);

-- Index for time-based queries (DESC for recent events first)
CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON analytics_events(created_at DESC);

-- Index for device analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_device
  ON analytics_events(device_type);

-- Composite index for common analytics queries (event type + time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);

-- Index for session-based analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON analytics_events(session_id);

-- GIN index for JSONB properties (enables fast property queries)
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties
  ON analytics_events USING GIN (properties);

-- =====================================================
-- 3. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS Policies
-- =====================================================

-- Policy: Allow public insert for anonymous tracking
-- Rationale: Users don't need authentication to track behavior
CREATE POLICY "Allow public insert for analytics" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated read for admin dashboard
-- Rationale: Only authenticated users (admins) should query analytics
CREATE POLICY "Allow authenticated read for analytics" ON analytics_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. Add Table Comments
-- =====================================================

COMMENT ON TABLE analytics_events IS
  'Stores user behavior analytics events throughout the quiz result and checkout funnel';

COMMENT ON COLUMN analytics_events.result_id IS
  'Links event to specific quiz result (nullable for non-result events)';

COMMENT ON COLUMN analytics_events.event_name IS
  'Event type identifier (e.g., accordion_open, sticky_click, purchase)';

COMMENT ON COLUMN analytics_events.properties IS
  'Event-specific metadata stored as JSON (e.g., chakra name, product_id, price)';

COMMENT ON COLUMN analytics_events.session_id IS
  'Browser session identifier for tracking user journeys';

COMMENT ON COLUMN analytics_events.user_agent IS
  'Browser user agent string for device/browser detection';

COMMENT ON COLUMN analytics_events.device_type IS
  'Detected device category (mobile, tablet, desktop)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
--
-- To rollback this migration, run:
--
-- DROP TABLE IF EXISTS analytics_events CASCADE;
--
-- Warning: This will permanently delete all analytics data.
-- Consider exporting data before rollback if needed.
--
-- =====================================================
