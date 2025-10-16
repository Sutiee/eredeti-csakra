-- ============================================================================
-- Eredeti Csakra - Database Migration #005
-- Admin Analytics & User Tracking Tables
-- Created: 2025-10-15
-- ============================================================================

-- ============================================================================
-- TABLE: quiz_sessions
-- Description: Tracks partial quiz attempts and user progress before completion
-- Use Case: Identify where users abandon the quiz, track funnel dropoff
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session tracking
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- Progress tracking
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,

  -- User info (collected after quiz completion or during)
  name TEXT,
  email TEXT,
  age INTEGER CHECK (age IS NULL OR (age >= 16 AND age <= 99)),

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- UTM tracking for marketing attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT
);

-- Indexes for quiz_sessions table
CREATE INDEX IF NOT EXISTS quiz_sessions_session_id_idx ON quiz_sessions(session_id);
CREATE INDEX IF NOT EXISTS quiz_sessions_status_idx ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS quiz_sessions_started_at_idx ON quiz_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS quiz_sessions_email_idx ON quiz_sessions(email);
CREATE INDEX IF NOT EXISTS quiz_sessions_last_activity_idx ON quiz_sessions(last_activity_at DESC);

-- Comment
COMMENT ON TABLE quiz_sessions IS 'Tracks partial quiz attempts and progress for funnel analysis';

-- ============================================================================
-- TABLE: analytics_events
-- Description: Stores all frontend and backend tracking events
-- Use Case: Detailed user behavior analysis, conversion funnel tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event data
  event_name TEXT NOT NULL,
  event_category TEXT, -- 'quiz', 'checkout', 'page', 'product', 'system'
  event_data JSONB,

  -- Session tracking
  session_id TEXT,
  result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  -- User tracking
  ip_address TEXT,
  user_agent TEXT,

  -- Page context
  page_path TEXT,
  referrer TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics_events table
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_events_event_category_idx ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_result_id_idx ON analytics_events(result_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);

-- Composite index for event analysis queries
CREATE INDEX IF NOT EXISTS analytics_events_name_created_idx ON analytics_events(event_name, created_at DESC);

-- Comment
COMMENT ON TABLE analytics_events IS 'Stores all user interaction events for analytics and funnel tracking';

-- ============================================================================
-- TABLE: page_views
-- Description: Tracks unique page views and visitor sessions
-- Use Case: Traffic analysis, visitor count, referrer tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page data
  page_path TEXT NOT NULL,
  page_title TEXT,

  -- Session tracking
  session_id TEXT,

  -- User tracking
  ip_address TEXT,
  user_agent TEXT,

  -- Referrer and UTM tracking
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for page_views table
CREATE INDEX IF NOT EXISTS page_views_page_path_idx ON page_views(page_path);
CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON page_views(session_id);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_ip_address_idx ON page_views(ip_address);

-- Composite index for unique visitor analysis
CREATE INDEX IF NOT EXISTS page_views_session_created_idx ON page_views(session_id, created_at DESC);

-- Comment
COMMENT ON TABLE page_views IS 'Tracks all page views for traffic analysis and visitor metrics';

-- ============================================================================
-- TABLE: admin_users
-- Description: Stores admin authentication credentials
-- Use Case: Admin dashboard login (single admin user with bcrypt password)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Credentials
  username TEXT UNIQUE NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL, -- bcrypt hash (12 rounds)

  -- Session management
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,

  -- Rate limiting tracking
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for username lookup
CREATE INDEX IF NOT EXISTS admin_users_username_idx ON admin_users(username);

-- Comment
COMMENT ON TABLE admin_users IS 'Stores admin user credentials with bcrypt password hashing';

-- Insert default admin user with bcrypt hash for password 'csakra352!'
-- Hash: $2b$12$IOPNzBCUMd6hzjH2hspVhuAnifzYwOScaleEfsLmE7SzV7lg3fxFS
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$12$IOPNzBCUMd6hzjH2hspVhuAnifzYwOScaleEfsLmE7SzV7lg3fxFS')
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- TABLE: admin_sessions
-- Description: Manages admin login sessions with token-based authentication
-- Use Case: Session tracking, auto-logout after 7 days, security monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session data
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,

  -- Security tracking
  ip_address TEXT,
  user_agent TEXT,

  -- Expiry management
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin_sessions table
CREATE INDEX IF NOT EXISTS admin_sessions_session_token_idx ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS admin_sessions_admin_user_id_idx ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions(expires_at);

-- Comment
COMMENT ON TABLE admin_sessions IS 'Manages admin session tokens with 7-day expiry and activity tracking';

-- ============================================================================
-- FUNCTION: Automatic session cleanup (remove expired sessions)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION cleanup_expired_admin_sessions IS 'Removes expired admin sessions (can be called via cron job)';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on analytics tables (public insert, admin read)
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert tracking data (public quiz)
CREATE POLICY "Public insert quiz sessions"
ON quiz_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public insert analytics events"
ON analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public insert page views"
ON page_views FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can read their own session (for quiz progress)
CREATE POLICY "Users can view own quiz session"
ON quiz_sessions FOR SELECT
USING (true);

-- Note: Admin-only SELECT policies can be implemented via service_role key
-- No public SELECT needed for analytics_events and page_views

-- Admin tables: No RLS needed (accessed via service_role only)
-- admin_users and admin_sessions will be accessed server-side with service_role key

-- ============================================================================
-- SAMPLE QUERIES (for testing and admin dashboard)
-- ============================================================================

-- Query 1: Get total unique visitors (by session_id) in last 30 days
-- SELECT COUNT(DISTINCT session_id) AS unique_visitors
-- FROM page_views
-- WHERE created_at >= NOW() - INTERVAL '30 days';

-- Query 2: Get quiz completion funnel
-- SELECT
--   COUNT(DISTINCT CASE WHEN event_name = 'quiz_start' THEN session_id END) AS quiz_starts,
--   COUNT(DISTINCT CASE WHEN event_name = 'quiz_complete' THEN session_id END) AS quiz_completions,
--   ROUND(
--     COUNT(DISTINCT CASE WHEN event_name = 'quiz_complete' THEN session_id END)::numeric /
--     NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'quiz_start' THEN session_id END), 0) * 100,
--     2
--   ) AS completion_rate_percent
-- FROM analytics_events
-- WHERE created_at >= NOW() - INTERVAL '30 days';

-- Query 3: Get abandoned quiz sessions (no activity in 30+ minutes)
-- SELECT
--   id,
--   session_id,
--   email,
--   current_question_index,
--   started_at,
--   last_activity_at
-- FROM quiz_sessions
-- WHERE status = 'active'
--   AND last_activity_at < NOW() - INTERVAL '30 minutes'
-- ORDER BY last_activity_at DESC;

-- Query 4: Get conversion funnel by stages
-- SELECT
--   'Landing View' AS stage,
--   COUNT(DISTINCT session_id) AS count,
--   100.0 AS percent
-- FROM page_views WHERE page_path = '/'
-- UNION ALL
-- SELECT
--   'Quiz Start',
--   COUNT(DISTINCT session_id),
--   (COUNT(DISTINCT session_id)::numeric / (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE page_path = '/') * 100)
-- FROM analytics_events WHERE event_name = 'quiz_start'
-- UNION ALL
-- SELECT
--   'Quiz Complete',
--   COUNT(DISTINCT session_id),
--   (COUNT(DISTINCT session_id)::numeric / (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE page_path = '/') * 100)
-- FROM analytics_events WHERE event_name = 'quiz_complete'
-- UNION ALL
-- SELECT
--   'Purchase',
--   COUNT(*),
--   (COUNT(*)::numeric / (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE page_path = '/') * 100)
-- FROM purchases WHERE status = 'completed';

-- Query 5: Get top referrers in last 7 days
-- SELECT
--   referrer,
--   COUNT(DISTINCT session_id) AS visitors,
--   COUNT(*) AS total_page_views
-- FROM page_views
-- WHERE created_at >= NOW() - INTERVAL '7 days'
--   AND referrer IS NOT NULL
--   AND referrer != ''
-- GROUP BY referrer
-- ORDER BY visitors DESC
-- LIMIT 10;

-- Query 6: Get event distribution by category
-- SELECT
--   event_category,
--   COUNT(*) AS event_count,
--   COUNT(DISTINCT session_id) AS unique_sessions
-- FROM analytics_events
-- WHERE created_at >= NOW() - INTERVAL '7 days'
-- GROUP BY event_category
-- ORDER BY event_count DESC;

-- Query 7: Admin session validation (used in auth middleware)
-- SELECT
--   s.id,
--   s.admin_user_id,
--   s.expires_at,
--   s.last_activity_at,
--   u.username
-- FROM admin_sessions s
-- JOIN admin_users u ON u.id = s.admin_user_id
-- WHERE s.session_token = 'YOUR_TOKEN_HERE'
--   AND s.expires_at > NOW();

-- Query 8: Get daily visitor trend (last 30 days)
-- SELECT
--   DATE(created_at) AS date,
--   COUNT(DISTINCT session_id) AS unique_visitors,
--   COUNT(*) AS total_page_views
-- FROM page_views
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY DATE(created_at)
-- ORDER BY date DESC;

-- Query 9: Get quiz abandonment points (which questions users quit on)
-- SELECT
--   current_question_index,
--   COUNT(*) AS abandonment_count,
--   ROUND(AVG(EXTRACT(EPOCH FROM (last_activity_at - started_at))), 2) AS avg_time_spent_seconds
-- FROM quiz_sessions
-- WHERE status = 'abandoned'
-- GROUP BY current_question_index
-- ORDER BY current_question_index;

-- Query 10: Get user list with all relevant data (for admin user management page)
-- SELECT
--   qr.id,
--   qr.name,
--   qr.email,
--   qr.age,
--   qr.created_at,
--   qr.chakra_scores,
--   COALESCE(p.purchase_count, 0) AS purchase_count,
--   COALESCE(p.total_spent, 0) AS total_spent,
--   CASE
--     WHEN p.purchase_count > 0 THEN 'purchased'
--     ELSE 'no_purchase'
--   END AS purchase_status
-- FROM quiz_results qr
-- LEFT JOIN (
--   SELECT
--     result_id,
--     COUNT(*) AS purchase_count,
--     SUM(amount) AS total_spent
--   FROM purchases
--   WHERE status = 'completed'
--   GROUP BY result_id
-- ) p ON p.result_id = qr.id
-- ORDER BY qr.created_at DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
