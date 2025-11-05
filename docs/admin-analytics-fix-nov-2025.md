# Admin Analytics Fix - November 2025

## Problem Statement

The admin dashboard showed **zero visitors and zero active sessions** despite the application having real traffic and users completing quizzes.

### Symptoms
- Admin dashboard KPI cards displayed `0` for:
  - "Összes Látogató" (Total Visitors)
  - "Aktív Sessionök" (Active Sessions - Last 24h)
- Time series charts showed "Nincs megjeleníthető adat" (No displayable data)
- Funnel chart showed zero users at all stages

## Root Cause Analysis

### Issue #1: Schema Mismatch (CRITICAL)

**Problem**: The `analytics_events` table in Supabase was missing critical columns that the API was trying to insert.

**Discovery**:
- API endpoint `/api/admin/events/route.ts` sends events with fields:
  - `event_name` ✅
  - `event_category` ❌ (missing in DB)
  - `event_data` ✅
  - `session_id` ✅
  - `result_id` ✅
  - `ip_address` ❌ (missing in DB)
  - `user_agent` ✅
  - `page_path` ❌ (missing in DB)
  - `referrer` ❌ (missing in DB)
  - `device_type` ✅

**Why it happened**:
- Initial migration `/supabase/migrations/20251017120000_analytics_events.sql` created a minimal schema
- Full schema exists in `/docs/database-migrations/005_admin_analytics_tables.sql` but was never migrated to Supabase
- API code evolved to send additional fields, but database schema wasn't updated

**Result**: Supabase rejected INSERT queries silently (or with errors not visible to end users), causing **zero events to be tracked**.

---

### Issue #2: Dual Tracking Systems (SECONDARY)

**Problem**: Two separate analytics tracking implementations exist in parallel.

**Systems**:
1. **New Admin System** (`lib/admin/tracking/client.ts` → `/api/admin/events`):
   - Session ID format: `{timestamp}-{random}`
   - localStorage key: `analytics_session_id`
   - Used on: Landing, Quiz, Checkout, Success pages

2. **Legacy System** (`lib/analytics/track-event.ts` → Direct Supabase):
   - Session ID format: `session_{timestamp}_{random}`
   - localStorage key: `session_id`
   - Session expiry: 30 minutes
   - Used on: Result page

**Result**: Session fragmentation, inconsistent tracking, potential double-counting or missing events.

---

### Issue #3: Unused Database Tables (MINOR)

**Problem**: Two tables were created but never populated:

1. **`page_views`** table:
   - Created in migration
   - Never receives data from client-side tracking
   - Admin APIs comment: *"FIXED: Use analytics_events instead of page_views (page_views table is empty)"*

2. **`quiz_sessions`** table:
   - Created in migration
   - No client-side code populates it
   - User stats API attempts to query it but receives no data

---

## Solution Implemented

### Fix #1: Schema Migration ✅

**File Created**: `/supabase/migrations/20251105000000_fix_analytics_events_schema.sql`

**Changes**:
- Added missing columns:
  - `event_category TEXT`
  - `ip_address TEXT`
  - `page_path TEXT`
  - `referrer TEXT`
- Added performance indexes for new columns
- Backfilled `event_category` for existing events (if any)

**Deployment**:
```bash
# Apply migration to Supabase
# Method 1: Via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy contents of supabase/migrations/20251105000000_fix_analytics_events_schema.sql
# 3. Run the SQL

# Method 2: Via Supabase CLI (if installed)
# supabase db push
```

---

### Fix #2: RLS Policy Verification ✅

**Status**: RLS policies already exist and are correct.

**Policies in place**:
```sql
-- Allow public insert for anonymous tracking (✅ EXISTS)
CREATE POLICY "Allow public insert for analytics" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated read for admin dashboard (✅ EXISTS)
CREATE POLICY "Allow authenticated read for analytics" ON analytics_events
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Verification**: Checked in `/supabase/migrations/20251017120000_analytics_events.sql` (lines 100-108).

---

## Verification Steps

After applying the migration, verify the fix:

### 1. Check Database Schema
```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'analytics_events'
ORDER BY ordinal_position;

-- Expected columns:
-- id, result_id, event_name, properties, event_data, session_id,
-- user_agent, device_type, variant_id, created_at,
-- event_category, ip_address, page_path, referrer
```

### 2. Test Event Insertion
```sql
-- Insert a test event
INSERT INTO analytics_events (
  event_name,
  event_category,
  event_data,
  session_id,
  ip_address,
  user_agent,
  page_path,
  referrer
) VALUES (
  'test_event',
  'system',
  '{"test": true}'::jsonb,
  '1699000000000-test123',
  '127.0.0.1',
  'Mozilla/5.0',
  '/test',
  'https://example.com'
);

-- Verify insertion
SELECT * FROM analytics_events WHERE event_name = 'test_event';

-- Clean up test data
DELETE FROM analytics_events WHERE event_name = 'test_event';
```

### 3. Test Client-Side Tracking
1. Open browser DevTools (Network tab)
2. Visit landing page: `https://eredeticsakra.hu/`
3. Check for POST request to `/api/admin/events`
4. Verify request payload includes:
   - `event_name: "page_view"`
   - `event_data: { page_path: "/", page_name: "landing", ... }`
   - `session_id: "1699000000000-abc123"`
   - `page_path: "/"`
5. Check response: Should be `200 OK` with `{ data: { success: true }, error: null }`

### 4. Verify Admin Dashboard
1. Log in to admin dashboard: `https://eredeticsakra.hu/admin`
2. Wait 10 seconds for data to populate
3. Check KPI cards:
   - "Összes Látogató" should show non-zero count
   - "Aktív Sessionök" should show sessions from last 24 hours
4. Check Time Series chart:
   - Should display visitor trend line
5. Check Funnel chart:
   - Should show visitors at each stage

### 5. Query Analytics Data
```sql
-- Check recent events (last hour)
SELECT
  event_name,
  event_category,
  session_id,
  page_path,
  created_at
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 20;

-- Count unique visitors (last 30 days)
SELECT COUNT(DISTINCT session_id) AS unique_visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Count active sessions (last 24 hours)
SELECT COUNT(DISTINCT session_id) AS active_sessions
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

---

## Expected Results After Fix

| Metric | Before Fix | After Fix |
|--------|-----------|-----------|
| Total Visitors (30d) | 0 | ~50-200 (depends on traffic) |
| Active Sessions (24h) | 0 | ~5-30 (depends on current traffic) |
| Completed Quizzes | May work | Works correctly |
| Conversion Rate | N/A (0/0) | Calculated correctly |
| Funnel Stages | All zeros | Correct dropoff percentages |
| Time Series Chart | "No data" | Shows daily trends |

---

## Future Improvements

### Short Term (Recommended)
1. **Consolidate Tracking Systems** - Migrate Result page to use new admin tracking system
2. **Monitor Error Rates** - Add Sentry/error tracking to catch silent failures
3. **Add Data Validation** - Validate analytics_events insertions and log failures

### Long Term (Optional)
1. **Remove Unused Tables** - Drop `page_views` and `quiz_sessions` or migrate logic to use them
2. **Add Session Expiry** - Implement server-side session management with 30-minute expiry
3. **Implement Data Retention** - Archive/delete old analytics data (e.g., >90 days)
4. **Add Real-Time Dashboard** - WebSocket/polling for live visitor count
5. **Cross-Device Tracking** - Use email-based identification once user completes quiz

---

## Technical Details

### API Endpoint
**File**: `/app/api/admin/events/route.ts`

**Request Body**:
```typescript
{
  event_name: string;
  event_data?: Record<string, any>;
  session_id?: string;
  result_id?: string;
  page_path?: string;
  referrer?: string;
}
```

**Server-Side Enhancement**:
- Extracts `ip_address` from headers (`x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`)
- Extracts `user_agent` from request headers
- Auto-infers `event_category` based on event_name patterns

---

### Dashboard KPI Query
**File**: `/app/api/admin/stats/kpis/route.ts`

**Total Visitors Calculation**:
```typescript
// Query unique session_ids from last N days
const { data: visitorData } = await supabase
  .from('analytics_events')
  .select('session_id')
  .gte('created_at', startDateStr);

// Count unique non-null sessions
const totalVisitors = visitorData
  ? new Set(visitorData.map(v => v.session_id).filter(Boolean)).size
  : 0;
```

**Active Sessions Calculation**:
```typescript
// Query unique session_ids from last 24 hours
const { data: activeSessionsData } = await supabase
  .from('analytics_events')
  .select('session_id')
  .gte('created_at', last24HoursStr);

// Count unique non-null sessions
const activeSessions = activeSessionsData
  ? new Set(activeSessionsData.map(v => v.session_id).filter(Boolean)).size
  : 0;
```

---

## Lessons Learned

1. **Always verify migrations are applied** - Documentation migrations in `/docs` don't auto-apply
2. **Monitor database schema drift** - API evolved but schema didn't, causing silent failures
3. **Test event insertion end-to-end** - Check Supabase directly, not just API responses
4. **Consolidate tracking systems early** - Parallel systems cause fragmentation and complexity
5. **Add comprehensive error logging** - Silent failures in analytics make debugging difficult

---

## Related Files

### Migration Files
- `/supabase/migrations/20251017120000_analytics_events.sql` - Initial (incomplete) schema
- `/supabase/migrations/20251105000000_fix_analytics_events_schema.sql` - **Fix migration** (new)
- `/docs/database-migrations/005_admin_analytics_tables.sql` - Full schema (never applied)

### API Routes
- `/app/api/admin/events/route.ts` - Event tracking endpoint
- `/app/api/admin/stats/kpis/route.ts` - KPI calculation
- `/app/api/admin/stats/timeseries/route.ts` - Time series data
- `/app/api/admin/stats/funnel/route.ts` - Conversion funnel

### Client Tracking
- `/lib/admin/tracking/client.ts` - New tracking system (useAnalytics hook)
- `/lib/analytics/track-event.ts` - Legacy tracking system

### UI Components
- `/components/admin/KPICards.tsx` - Dashboard KPI display
- `/components/admin/TimeSeriesChart.tsx` - Visitor trend chart
- `/components/admin/FunnelChart.tsx` - Conversion funnel visualization

---

**Fix Applied**: November 5, 2025
**Status**: ✅ Migration created, awaiting Supabase deployment
**Impact**: High - Restores all visitor/session tracking functionality
