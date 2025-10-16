# Eredeti Csakra - Admin Rendszer Fejlesztési Terv

**Verzió**: v1.6 (Admin Dashboard & Analytics)
**Állapot**: Tervezési fázis
**Dátum**: 2025-10-15

---

## 🎯 Áttekintés

Admin dashboard az Eredeti Csakra webalkalmazáshoz, amely lehetővé teszi:
- **Felhasználó követés**: Quiz kitöltések nyomon követése (részleges és teljes)
- **Analytics**: Látogatók, konverziós funnel, termék értékesítések
- **Event tracking**: Részletes felhasználói interakciók mérése
- **Simple Auth**: Egyszerű jelszó-védelem (`csakra352!`)

---

## 📊 Funkcionális Követelmények

### 1. Felhasználó Kezelő (User Management)

**Megjeleníthető adatok per felhasználó:**
- ✅ Név, email, kor
- ✅ Kitöltés dátuma (`created_at`)
- ✅ Quiz állapot: `completed`, `partial`, `abandoned`
- ✅ Hanyadik kérdésig jutott (0-28)
- ✅ Válaszok listája (`answers` array)
- ✅ Csakra pontszámok (ha befejezett)
- ✅ Vásárolt termékek (`purchases` tábla join)
- ✅ Email státusz (PDF elküldve, meditáció hozzáférés)

**Szűrési és keresési opciók:**
- 📅 Dátum tartomány (utolsó 7/30/90 nap, egyedi)
- 🎯 Quiz állapot filter (befejezett / részleges / elhagyott)
- 💰 Vásárlás filter (vásárolt / nem vásárolt)
- 🔍 Email vagy név alapú keresés
- 📊 Rendezés: dátum, név, quiz progress

**Exportálási lehetőségek:**
- 📥 CSV export (összes adat vagy szűrt lista)
- 📥 Excel export (formázott, több sheet)

### 2. Analytics Dashboard

**Főbb Metrikák (KPI Cards):**
- 👥 Összes látogató (egyedi IP/session alapján)
- 📝 Quiz indítások száma
- ✅ Quiz befejezések száma
- 💰 Vásárlások száma
- 💵 Bevétel (HUF)
- 📊 Konverziós ráta (látogató → vásárlás)

**Időbeli Trendek (Charts):**
- 📈 Látogatók időbeli alakulása (napi/heti/havi bontás)
- 📈 Quiz befejezések időbeli alakulása
- 📈 Vásárlások időbeli alakulása
- 📈 Bevétel időbeli alakulása

**Funnel Analytics (Conversion Funnel):**
```
Landing Page View       →  100%
Quiz Started            →  X%
Quiz Q7 Reached         →  X%
Quiz Q14 Reached        →  X%
Quiz Q21 Reached        →  X%
Quiz Completed          →  X%
Checkout Started        →  X%
Purchase Completed      →  X%
```

**Termék Statisztikák:**
- 📊 Termék értékesítések darabszámmal
- 📊 Bevétel termék típusonként
- 📊 Bundle vs. egyedi termék arány
- 📊 Átlagos kosár érték (AOV - Average Order Value)

**Demográfiai Analitika:**
- 📊 Életkor szerinti eloszlás (16-25, 26-35, 36-45, 46-55, 56+)
- 📊 Csakra egészség eloszlás (balanced/imbalanced/blocked per chakra)

### 3. Event Tracking System

**Frontend Events (Client-Side):**

| Event Név | Trigger | Adatok |
|-----------|---------|--------|
| `page_view` | Minden oldal betöltés | `page_path`, `referrer`, `session_id` |
| `landing_view` | Landing page betöltés | `utm_source`, `utm_campaign` |
| `quiz_start` | "Kezdés" gomb kattintás | `session_id`, `timestamp` |
| `quiz_question_answered` | Válasz választás | `question_index`, `chakra_index`, `answer_value` |
| `quiz_progress` | Kérdés váltás | `question_index`, `progress_percent` |
| `testimonial_view` | Inter-quiz testimonial megjelenés | `position` (7, 14, 21) |
| `quiz_complete` | 28. kérdés megválaszolva | `completion_time_seconds` |
| `result_view` | Eredmény oldal betöltés | `result_id` |
| `checkout_view` | Checkout oldal betöltés | `result_id` |
| `product_selected` | Termék kiválasztás checkbox | `product_id` |
| `bundle_viewed` | Bundle ajánlat megjelenítés | N/A |
| `checkout_abandoned` | Checkout elhagyás | `selected_products` |
| `purchase_completed` | Sikeres vásárlás | `product_ids`, `amount`, `currency` |
| `pdf_download` | PDF letöltés | `result_id`, `product_id` |
| `meditation_access` | Meditáció oldal betöltés | `token`, `chakra_id` |

**Backend Events (Server-Side):**
- `quiz_submitted` - Quiz beküldés (API)
- `stripe_checkout_created` - Stripe session létrehozás
- `stripe_payment_success` - Fizetés sikeres
- `stripe_payment_failed` - Fizetés sikertelen
- `pdf_generated` - PDF generálás sikeres
- `email_sent` - Email kiküldés sikeres
- `email_failed` - Email küldés sikertelen

### 4. Authentication (Admin Login)

**Egyszerű implementáció:**
- Egyetlen admin felhasználó
- Jelszó: `csakra352!`
- Session-based auth (7 napos session cookie)
- Nincs password reset (fix jelszó)
- Védett `/admin/*` route-ok

**Security措施:**
- Jelszó bcrypt hash-elve tárolva
- Rate limiting (5 failed attempt után 15 perc ban)
- Session timeout 7 nap után
- CSRF protection (Next.js middleware)

---

## 🗂️ Új Adatbázis Táblák

### 1. `quiz_sessions` Tábla
**Cél:** Részleges kitöltések követése (még nem befejezett quizek)

```sql
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session tracking
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- Progress tracking
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,

  -- User info (ha már megadta)
  name TEXT,
  email TEXT,
  age INTEGER,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT
);

CREATE INDEX quiz_sessions_session_id_idx ON quiz_sessions(session_id);
CREATE INDEX quiz_sessions_status_idx ON quiz_sessions(status);
CREATE INDEX quiz_sessions_started_at_idx ON quiz_sessions(started_at DESC);
CREATE INDEX quiz_sessions_email_idx ON quiz_sessions(email);
```

### 2. `analytics_events` Tábla
**Cél:** Minden frontend és backend event tárolása

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event data
  event_name TEXT NOT NULL,
  event_category TEXT, -- 'quiz', 'checkout', 'page', 'product'
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

CREATE INDEX analytics_events_event_name_idx ON analytics_events(event_name);
CREATE INDEX analytics_events_event_category_idx ON analytics_events(event_category);
CREATE INDEX analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX analytics_events_result_id_idx ON analytics_events(result_id);
CREATE INDEX analytics_events_created_at_idx ON analytics_events(created_at DESC);
```

### 3. `page_views` Tábla
**Cél:** Látogatók követése (egyszerűbb, mint Google Analytics)

```sql
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page data
  page_path TEXT NOT NULL,
  page_title TEXT,

  -- Session tracking
  session_id TEXT,

  -- User tracking
  ip_address TEXT,
  user_agent TEXT,

  -- Referrer
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX page_views_page_path_idx ON page_views(page_path);
CREATE INDEX page_views_session_id_idx ON page_views(session_id);
CREATE INDEX page_views_created_at_idx ON page_views(created_at DESC);
```

### 4. `admin_users` Tábla
**Cél:** Admin bejelentkezések (1 user, de bővíthető)

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Credentials
  username TEXT UNIQUE NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL, -- bcrypt hash of 'csakra352!'

  -- Session management
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password will be hashed in migration)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', 'TO_BE_HASHED');
```

### 5. `admin_sessions` Tábla
**Cél:** Admin session tracking

```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session data
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,

  -- Security
  ip_address TEXT,
  user_agent TEXT,

  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX admin_sessions_session_token_idx ON admin_sessions(session_token);
CREATE INDEX admin_sessions_expires_at_idx ON admin_sessions(expires_at);
```

---

## 📁 Új Fájlok Struktúra

### API Routes (10 fájl)
```
/app/api/admin/
├── auth/
│   ├── login/route.ts           # POST: Admin bejelentkezés
│   ├── logout/route.ts          # POST: Admin kijelentkezés
│   └── verify/route.ts          # GET: Session ellenőrzés
├── users/
│   ├── route.ts                 # GET: Felhasználók listája (pagination, filter)
│   ├── [id]/route.ts            # GET: Egy felhasználó részletei
│   └── export/route.ts          # GET: CSV/Excel export
├── analytics/
│   ├── overview/route.ts        # GET: KPI metrics
│   ├── funnel/route.ts          # GET: Conversion funnel data
│   ├── products/route.ts        # GET: Product statistics
│   └── demographics/route.ts    # GET: Demographic breakdowns
└── events/
    ├── route.ts                 # POST: Event tracking endpoint
    └── list/route.ts            # GET: Event list (admin debugging)
```

### App Pages (6 fájl)
```
/app/admin/
├── layout.tsx                   # Admin layout (auth check, sidebar)
├── page.tsx                     # Dashboard (redirect to /admin/overview)
├── login/
│   └── page.tsx                 # Login page
├── overview/
│   └── page.tsx                 # Analytics overview
├── users/
│   └── page.tsx                 # User management table
└── settings/
    └── page.tsx                 # Settings (optional, future)
```

### Components (15 fájl)
```
/components/admin/
├── layout/
│   ├── AdminSidebar.tsx         # Navigációs sidebar
│   ├── AdminHeader.tsx          # Top header (logout gomb)
│   └── AdminAuthGuard.tsx       # Auth wrapper component
├── dashboard/
│   ├── KPICard.tsx              # Metric display card
│   ├── LineChart.tsx            # Time-series chart (Chart.js vagy Recharts)
│   ├── FunnelChart.tsx          # Conversion funnel visualization
│   ├── PieChart.tsx             # Product distribution chart
│   └── DemographicsChart.tsx    # Age/Chakra distribution
├── users/
│   ├── UserTable.tsx            # Main user data table
│   ├── UserFilters.tsx          # Filter controls (date, status, etc.)
│   ├── UserRow.tsx              # Single user row (expandable)
│   ├── UserDetailModal.tsx      # Modal: Full user details
│   └── ExportButton.tsx         # CSV/Excel export button
└── auth/
    └── LoginForm.tsx            # Login form component
```

### Library/Utils (8 fájl)
```
/lib/admin/
├── auth.ts                      # Auth helper functions
├── session.ts                   # Session management
├── middleware.ts                # Admin route protection
├── analytics/
│   ├── metrics.ts               # KPI calculation functions
│   ├── funnel.ts                # Funnel analysis logic
│   └── queries.ts               # Common analytics queries
├── tracking/
│   ├── client.ts                # Client-side event tracking
│   └── server.ts                # Server-side event logging
└── export/
    ├── csv.ts                   # CSV generation
    └── excel.ts                 # Excel generation (exceljs)
```

### Types (1 fájl)
```
/types/admin.ts                  # Admin-specific TypeScript types
```

---

## 🎨 UI Design (Admin Dashboard)

### Color Scheme
- **Primary**: Spiritual purple (`#9333ea`)
- **Background**: Light gray (`#f9fafb`)
- **Cards**: White with subtle shadow
- **Success**: Green (`#10b981`)
- **Warning**: Orange (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  Admin Header (logo, "Admin Dashboard", logout)    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │  Main Content Area                      │
│          │                                          │
│ - Overview│  [Dynamic content based on route]      │
│ - Users   │                                          │
│ - Products│                                          │
│ - Settings│                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Key UI Components
- **KPI Cards**: Large numbers with trend indicators (↑ ↓)
- **Data Tables**: Sortable, filterable, paginated (20 rows/page)
- **Charts**: Recharts library (responsive, interactive)
- **Date Range Picker**: Pre-defined ranges + custom
- **Export Button**: Download icon with dropdown (CSV/Excel)

---

## 🔧 Technikai Implementáció

### Frontend Tracking (Client-Side)

**Event Tracking Hook** (`lib/admin/tracking/client.ts`):
```typescript
export function useAnalytics() {
  const trackEvent = async (
    eventName: string,
    eventData?: Record<string, any>
  ) => {
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_data: eventData,
          session_id: getSessionId(),
          page_path: window.location.pathname,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  return { trackEvent };
}
```

**Használat komponensekben:**
```typescript
const { trackEvent } = useAnalytics();

// Quiz start
const handleStartQuiz = () => {
  trackEvent('quiz_start', { source: 'landing_cta' });
  // ... quiz logic
};

// Answer selection
const handleAnswerChange = (value: number) => {
  trackEvent('quiz_question_answered', {
    question_index: currentIndex,
    chakra_index: chakraIndex,
    answer_value: value,
  });
  // ... update state
};
```

### Backend Tracking (Server-Side)

**Event Logger** (`lib/admin/tracking/server.ts`):
```typescript
export async function logEvent(
  eventName: string,
  eventData: Record<string, any>,
  context?: {
    sessionId?: string;
    resultId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  const supabase = createServerClient();

  await supabase.from('analytics_events').insert({
    event_name: eventName,
    event_category: inferCategory(eventName),
    event_data: eventData,
    session_id: context?.sessionId,
    result_id: context?.resultId,
    ip_address: context?.ipAddress,
    user_agent: context?.userAgent,
  });
}
```

### Auth Implementation

**Login Flow:**
1. User submits username + password
2. POST `/api/admin/auth/login`
3. Verify password with bcrypt
4. Generate session token (crypto.randomBytes)
5. Store in `admin_sessions` table (expires in 7 days)
6. Set HTTP-only cookie with session token
7. Redirect to `/admin/overview`

**Middleware Protection** (`middleware.ts`):
```typescript
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify session in database
    const session = await verifyAdminSession(sessionToken);

    if (!session || session.expires_at < new Date()) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Update last_activity_at
    await updateSessionActivity(sessionToken);
  }

  return NextResponse.next();
}
```

### Analytics Queries (Példák)

**KPI Metrics:**
```typescript
// Total visitors (unique sessions)
const totalVisitors = await supabase
  .from('page_views')
  .select('session_id', { count: 'exact', head: false })
  .gte('created_at', startDate)
  .lte('created_at', endDate);

// Quiz completions
const completions = await supabase
  .from('quiz_results')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startDate)
  .lte('created_at', endDate);

// Total revenue
const revenue = await supabase
  .from('purchases')
  .select('amount')
  .eq('status', 'completed')
  .gte('created_at', startDate)
  .lte('created_at', endDate);
```

**Funnel Analysis:**
```typescript
const funnel = {
  landing_views: await countEvents('landing_view', dateRange),
  quiz_starts: await countEvents('quiz_start', dateRange),
  quiz_q7: await countEvents('quiz_progress', { question_index: 7 }, dateRange),
  quiz_q14: await countEvents('quiz_progress', { question_index: 14 }, dateRange),
  quiz_q21: await countEvents('quiz_progress', { question_index: 21 }, dateRange),
  quiz_completions: await countEvents('quiz_complete', dateRange),
  checkout_views: await countEvents('checkout_view', dateRange),
  purchases: await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('created_at', startDate),
};
```

---

## 📊 Chart Library: Recharts

**Választott library:** [Recharts](https://recharts.org/)

**Előnyök:**
- ✅ React native (no canvas or SVG manipulation)
- ✅ Responsive out-of-the-box
- ✅ Composable components
- ✅ TypeScript support
- ✅ MIT license (free)

**Példa használat:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2025-10-01', visitors: 120 },
  { date: '2025-10-02', visitors: 150 },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="visitors" stroke="#9333ea" />
  </LineChart>
</ResponsiveContainer>
```

---

## 🚀 Implementációs Fázisok

### **FÁZIS 1: Adatbázis & Tracking (1 hét)**
- [ ] 5 új tábla létrehozása (migration script)
- [ ] Event tracking API endpoint (`POST /api/admin/events`)
- [ ] Client-side tracking hook (`useAnalytics`)
- [ ] Server-side logging utility
- [ ] Page view tracking minden oldalon
- [ ] Quiz session tracking implementálása

### **FÁZIS 2: Admin Auth (3 nap)**
- [ ] Admin login page UI
- [ ] Auth API routes (login, logout, verify)
- [ ] Session management (cookie-based)
- [ ] Middleware protection
- [ ] Bcrypt password hashing
- [ ] Rate limiting

### **FÁZIS 3: Analytics Dashboard (1 hét)**
- [ ] Admin layout (sidebar + header)
- [ ] Overview page (KPI cards)
- [ ] Recharts integration
- [ ] Time-series charts (visitors, revenue)
- [ ] Funnel chart
- [ ] Date range picker
- [ ] API routes for analytics data

### **FÁZIS 4: User Management (1 hét)**
- [ ] User table component (pagination, sort)
- [ ] User filters (date, status, purchase)
- [ ] User detail modal
- [ ] Search functionality (email, name)
- [ ] CSV export
- [ ] Excel export (optional)
- [ ] API routes for user data

### **FÁZIS 5: Product Analytics (3 nap)**
- [ ] Product sales table
- [ ] Revenue breakdown by product
- [ ] Bundle vs. individual sales chart
- [ ] Average order value (AOV)
- [ ] API routes for product stats

### **FÁZIS 6: Polish & Testing (3 nap)**
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states (skeletons)
- [ ] Error handling (toast notifications)
- [ ] Empty states (no data)
- [ ] TypeScript type check
- [ ] E2E testing (critical paths)

---

## 📦 Új npm Csomagok

```bash
npm install recharts          # Charts
npm install bcryptjs          # Password hashing
npm install @types/bcryptjs   # TypeScript types
npm install exceljs           # Excel export (optional)
npm install date-fns          # Date manipulation
```

---

## 🔐 Biztonsági Megfontolások

### 1. Password Security
- ✅ Jelszó bcrypt hash-elve (12 rounds)
- ✅ Nincs plaintext jelszó tárolás
- ✅ Session token = 32 byte random hex

### 2. Rate Limiting
- ✅ Max 5 failed login / 15 perc per IP
- ✅ Exponential backoff
- ✅ Adminok logging (failed attempts)

### 3. Session Security
- ✅ HTTP-only cookie (no JavaScript access)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Secure flag (HTTPS only in production)
- ✅ 7 napos expiry (auto logout)

### 4. API Protection
- ✅ Minden `/api/admin/*` middleware-rel védett
- ✅ Session token validation
- ✅ CORS enabled only for same origin

### 5. SQL Injection Protection
- ✅ Supabase client (parameterized queries)
- ✅ Input validation (Zod schemas)

---

## 📈 Várható Eredmények

### Üzleti Haszon
- 📊 **Konverzió optimalizálás**: Funnel bottleneck-ok azonosítása
- 💰 **Bevétel tracking**: Real-time pénzügyi áttekintés
- 👥 **Felhasználói viselkedés**: Mikor hagyják el a quiz-t?
- 📧 **Email efficacy**: PDF letöltések vs. email megnyitások

### Technikai Metrics
- ⏱️ **Load time**: Admin dashboard < 2 másodperc
- 🔄 **Real-time updates**: 30 másodperces frissítés (vagy polling)
- 📊 **Data retention**: 365 napig tárolás (majd archíválás)

---

## 🎯 Sikerkritériumok

- [x] Admin beléphet `csakra352!` jelszóval
- [x] Látható az összes quiz kitöltő (részleges + teljes)
- [x] Látható, hogy ki vásárolt terméket
- [x] Konverziós funnel chart működik
- [x] Event tracking működik minden kulcs ponton
- [x] CSV export működik
- [x] Mobile-responsive (tablet/phone)

---

## 📝 Következő Lépések

1. **Jóváhagyás**: Terv review és feedback
2. **Prioritizálás**: Mely fázisokkal kezdjünk?
3. **Estimate**: Időbecslés (3-4 hét teljes implementáció)
4. **Kickoff**: Fázis 1 (Adatbázis & Tracking) indítása

---

**Készítette**: Claude Code
**Utolsó frissítés**: 2025-10-15
**Státusz**: ✅ Terv kész, jóváhagyásra vár
