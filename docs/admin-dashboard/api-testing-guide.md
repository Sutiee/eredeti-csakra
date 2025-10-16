# Admin Dashboard API - Testing Guide

## Quick Start Testing

### Prerequisites
1. Start the development server: `npm run dev`
2. Have a valid admin session (login at `/admin/login`)
3. Ensure Supabase credentials are configured in `.env.local`

## Testing Checklist

### 1. KPI Stats Endpoint
```bash
# Test default (30 days)
curl -X GET 'http://localhost:3000/api/admin/stats/kpis' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test custom date range (7 days)
curl -X GET 'http://localhost:3000/api/admin/stats/kpis?days=7' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test maximum range (365 days)
curl -X GET 'http://localhost:3000/api/admin/stats/kpis?days=365' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected Response:**
```json
{
  "totalVisitors": 0,
  "completedQuizzes": 0,
  "conversionRate": 0,
  "totalRevenue": 0,
  "averageOrderValue": 0,
  "activeSessions": 0
}
```

### 2. Time Series Endpoint
```bash
# Test visitors metric
curl -X GET 'http://localhost:3000/api/admin/stats/timeseries?days=30&metric=visitors' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test revenue metric
curl -X GET 'http://localhost:3000/api/admin/stats/timeseries?days=30&metric=revenue' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test quizzes metric
curl -X GET 'http://localhost:3000/api/admin/stats/timeseries?days=30&metric=quizzes' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test invalid metric (should return 400)
curl -X GET 'http://localhost:3000/api/admin/stats/timeseries?days=30&metric=invalid' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected Response (array of date/value pairs):**
```json
[
  { "date": "2025-10-01", "value": 0 },
  { "date": "2025-10-02", "value": 0 },
  { "date": "2025-10-03", "value": 0 }
]
```

### 3. Funnel Endpoint
```bash
# Test conversion funnel
curl -X GET 'http://localhost:3000/api/admin/stats/funnel?days=30' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected Response:**
```json
[
  { "stage": "Landing Page Visit", "count": 0, "percentage": 100 },
  { "stage": "Started Quiz", "count": 0, "percentage": 0 },
  { "stage": "Reached Q10", "count": 0, "percentage": 0 },
  { "stage": "Completed Quiz", "count": 0, "percentage": 0 },
  { "stage": "Viewed Results", "count": 0, "percentage": 0 },
  { "stage": "Viewed Checkout", "count": 0, "percentage": 0 },
  { "stage": "Initiated Payment", "count": 0, "percentage": 0 },
  { "stage": "Completed Purchase", "count": 0, "percentage": 0 }
]
```

### 4. Recent Users Endpoint
```bash
# Test default (10 users)
curl -X GET 'http://localhost:3000/api/admin/stats/recent-users' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'

# Test custom limit (50 users)
curl -X GET 'http://localhost:3000/api/admin/stats/recent-users?limit=50' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected Response:**
```json
[]
```
(Or array of user objects if data exists)

### 5. Product Stats Endpoint
```bash
# Test product breakdown
curl -X GET 'http://localhost:3000/api/admin/stats/products?days=30' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected Response:**
```json
[]
```
(Or array of product stats if purchases exist)

## Authentication Testing

### Test Unauthorized Access (No Cookie)
```bash
curl -X GET 'http://localhost:3000/api/admin/stats/kpis'
```

**Expected:** Redirect to `/admin/login` (302 or 307 status)

### Test Invalid Session Token
```bash
curl -X GET 'http://localhost:3000/api/admin/stats/kpis' \
  -H 'Cookie: admin_session=invalid_token_here'
```

**Expected:** Redirect to `/admin/login` (302 or 307 status)

## Browser Testing

### Using Browser DevTools

1. Login to admin dashboard at `http://localhost:3000/admin/login`
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Run fetch commands:

```javascript
// Test KPI stats
fetch('/api/admin/stats/kpis?days=30')
  .then(r => r.json())
  .then(console.log);

// Test time series
fetch('/api/admin/stats/timeseries?days=30&metric=visitors')
  .then(r => r.json())
  .then(console.log);

// Test funnel
fetch('/api/admin/stats/funnel?days=30')
  .then(r => r.json())
  .then(console.log);

// Test recent users
fetch('/api/admin/stats/recent-users?limit=10')
  .then(r => r.json())
  .then(console.log);

// Test products
fetch('/api/admin/stats/products?days=30')
  .then(r => r.json())
  .then(console.log);
```

## Error Scenarios

### 1. Database Connection Error
If Supabase is unreachable, should return:
```json
{
  "error": "Failed to fetch [endpoint name]"
}
```
Status: 500

### 2. Invalid Parameters
```bash
# Invalid days parameter (negative)
curl -X GET 'http://localhost:3000/api/admin/stats/kpis?days=-5' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected:** Clamped to minimum value (1 day)

```bash
# Invalid days parameter (too large)
curl -X GET 'http://localhost:3000/api/admin/stats/kpis?days=1000' \
  -H 'Cookie: admin_session=YOUR_SESSION_TOKEN'
```

**Expected:** Clamped to maximum value (365 days)

## Performance Testing

### Response Time Benchmarks
Expected response times (with empty database):
- KPI Stats: < 500ms
- Time Series: < 800ms
- Funnel: < 1000ms
- Recent Users: < 300ms
- Products: < 300ms

### Load Testing (Optional)
```bash
# Install Apache Bench
# brew install apache2 (macOS)

# Test 100 requests with concurrency of 10
ab -n 100 -c 10 -H "Cookie: admin_session=YOUR_TOKEN" \
  http://localhost:3000/api/admin/stats/kpis
```

## Debugging Tips

### Enable Verbose Logging
Set `NODE_ENV=development` in `.env.local` to see all debug logs.

### Check Database Records
```sql
-- Check if tables have data
SELECT COUNT(*) FROM page_views;
SELECT COUNT(*) FROM quiz_results;
SELECT COUNT(*) FROM purchases;
SELECT COUNT(*) FROM quiz_sessions;
SELECT COUNT(*) FROM analytics_events;
```

### Common Issues

**Issue:** All stats return 0
**Solution:** Database tables are empty. Add test data or wait for real user activity.

**Issue:** "Missing Supabase environment variables" error
**Solution:** Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Issue:** Redirect to login when accessing APIs
**Solution:** Admin session expired or invalid. Re-login at `/admin/login`

**Issue:** TypeScript errors during build
**Solution:** Run `npx tsc --noEmit` to check for type errors

## Automated Testing (Future)

Suggested test framework: Jest + Supertest

```typescript
describe('Admin Stats API', () => {
  it('should return KPI stats', async () => {
    const response = await request(app)
      .get('/api/admin/stats/kpis?days=30')
      .set('Cookie', `admin_session=${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalVisitors');
    expect(response.body).toHaveProperty('conversionRate');
  });

  it('should reject unauthorized requests', async () => {
    const response = await request(app)
      .get('/api/admin/stats/kpis');

    expect(response.status).toBe(302); // Redirect
  });
});
```

## Test Data Setup (Optional)

To populate test data, run these SQL queries in Supabase:

```sql
-- Insert test page views
INSERT INTO page_views (session_id, page_path, created_at)
VALUES
  (gen_random_uuid()::text, '/', NOW() - INTERVAL '5 days'),
  (gen_random_uuid()::text, '/', NOW() - INTERVAL '4 days'),
  (gen_random_uuid()::text, '/kviz', NOW() - INTERVAL '3 days');

-- Insert test quiz results
INSERT INTO quiz_results (name, email, age, chakra_scores, created_at)
VALUES
  ('Test User', 'test@example.com', 30, '{"root": 70, "sacral": 60}', NOW() - INTERVAL '2 days');

-- Insert test purchases
INSERT INTO purchases (email, product_id, amount, status, created_at)
VALUES
  ('test@example.com', 'detailed_pdf', 4990, 'completed', NOW() - INTERVAL '1 day');
```

## Integration with Frontend

Once frontend components are ready, test the complete flow:

1. Login to admin dashboard
2. Navigate to `/admin/dashboard`
3. Verify all charts and stats load correctly
4. Test date range selectors
5. Test metric switchers (for time series)
6. Verify error states display properly
7. Test loading skeletons appear during data fetching

## Production Readiness Checklist

- [ ] All endpoints return expected data structure
- [ ] Authentication works correctly
- [ ] Error handling is comprehensive
- [ ] Logging provides useful debugging info
- [ ] Performance is acceptable under load
- [ ] TypeScript compilation succeeds
- [ ] No console errors in browser
- [ ] Rate limiting configured (if needed)
- [ ] API documentation complete
- [ ] Frontend integration tested

## Support

For issues or questions about the API implementation, refer to:
- Implementation details: `/docs/admin-dashboard/api-implementation-summary.md`
- Database schema: `/docs/supabase-schema.sql`
- Admin auth: `/lib/admin/auth.ts`
