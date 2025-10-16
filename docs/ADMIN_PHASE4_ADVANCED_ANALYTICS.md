# Phase 4: Advanced Analytics - Részletes Terv

**Verzió**: v1.6 - Phase 4 (Tervezés)
**Státusz**: 📋 TERVEZÉS - Később implementálásra vár
**Dátum**: 2025-10-16

---

## 📊 Mi van az Advanced Analytics-ben?

Az ADMIN_SYSTEM_PLAN.md szerint a **Phase 4** a következő **három fő funkciót** tartalmazza:

---

## 1. 🗺️ User Journey Visualization

**Cél**: Vizualizálni a felhasználók utazását az oldalon keresztül

### Funkciók:
- **Session Replay Heatmap**: Mely oldalakat látogatták meg, milyen sorrendben
- **Path Analysis**: Leggyakoribb útvonalak a landing → quiz → checkout folyamatban
- **Drop-off Points**: Hol hagyják el leggyakrabban az oldalt (kérdés index szinten)
- **Time on Page**: Mennyi időt töltenek egyes oldalakon
- **Scroll Depth**: Meddig görgetnek le a landing oldalon

### Technikai Implementáció:
- Új komponens: `/components/admin/UserJourneyMap.tsx`
- Új API route: `/app/api/admin/analytics/journey/route.ts`
- Sankey diagram vagy flow chart Recharts-szal
- Session-by-session breakdown táblázat

### Query Példa:
```sql
SELECT
  session_id,
  event_name,
  page_path,
  created_at,
  event_data
FROM analytics_events
WHERE session_id = 'xxx'
ORDER BY created_at ASC
```

---

## 2. 👥 Cohort Analysis

**Cél**: Felhasználók csoportosítása viselkedés alapján

### Funkciók:
- **Időalapú kohorták**: Heti/havi regisztrációs kohorták konverziós rátái
- **Retention Analysis**: Visszatérő látogatók aránya (1 nap, 7 nap, 30 nap múlva)
- **Csakra kohorták**: Felhasználók csoportosítása domináns csakra probléma alapján
  - Pl. "Blocked Root Chakra" cohort → Milyen termékeket vásárolnak?
- **Age cohorts**: 16-25, 26-35, 36-45, 46+ csoportok konverzió különbségei
- **UTM Source kohorták**: Melyik marketing csatorna hoz jobb konverziót?

### Technikai Implementáció:
- Új komponens: `/components/admin/CohortTable.tsx`
- Új API route: `/app/api/admin/analytics/cohorts/route.ts`
- Cohort heatmap (Recharts heatmap vagy custom SVG)
- Retention curve chart

### Query Példa:
```sql
-- Weekly registration cohorts
WITH cohorts AS (
  SELECT
    DATE_TRUNC('week', created_at) AS cohort_week,
    COUNT(DISTINCT id) AS total_users,
    COUNT(DISTINCT CASE WHEN purchases.id IS NOT NULL THEN quiz_results.id END) AS converted_users
  FROM quiz_results
  LEFT JOIN purchases ON quiz_results.id = purchases.result_id
  GROUP BY cohort_week
)
SELECT
  cohort_week,
  total_users,
  converted_users,
  ROUND(100.0 * converted_users / NULLIF(total_users, 0), 2) AS conversion_rate
FROM cohorts
ORDER BY cohort_week DESC;
```

---

## 3. 🧪 A/B Test Results Tracking

**Cél**: A/B tesztek eredményeinek követése és vizualizálása

### Funkciók:
- **Test Management**: A/B tesztek listája (név, időtartam, státusz)
- **Variant Performance**: Kontroll vs. teszt variánsok teljesítménye
  - Landing CTA szöveg A/B teszt
  - Quiz kérdés szöveg változatok
  - Checkout bundle ajánlat A/B teszt
- **Statistical Significance**: Chi-square teszt, p-value számítás
- **Winner Declaration**: Automatikus nyertes variáns kijelölés
- **Historical Results**: Korábbi A/B tesztek archívuma

### Technikai Implementáció:
- Új tábla: `ab_tests` (test_name, variant_a, variant_b, start_date, end_date, status)
- Új tábla: `ab_test_events` (test_id, variant, session_id, event_name, converted BOOL)
- Új komponens: `/components/admin/ABTestDashboard.tsx`
- Új API routes:
  - `/app/api/admin/ab-tests/route.ts` (GET/POST)
  - `/app/api/admin/ab-tests/[id]/route.ts` (GET/PUT/DELETE)
  - `/app/api/admin/ab-tests/[id]/results/route.ts` (GET)
- Frontend tracking: `trackEvent('ab_test_variant', { test_name, variant })`

### Query Példa:
```sql
-- A/B test results
SELECT
  variant,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT CASE WHEN converted = TRUE THEN session_id END) AS conversions,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN converted = TRUE THEN session_id END) / COUNT(DISTINCT session_id), 2) AS conversion_rate
FROM ab_test_events
WHERE test_id = 'landing_cta_test_v1'
GROUP BY variant;
```

---

## 📁 Új Fájlok (Phase 4)

### Komponensek (6 új):
```
/components/admin/
├── UserJourneyMap.tsx          # Sankey/flow diagram
├── SessionTimeline.tsx         # Session esemény lista
├── CohortTable.tsx             # Cohort heatmap tábla
├── RetentionCurve.tsx          # Retention chart
├── ABTestDashboard.tsx         # A/B test lista
└── ABTestResults.tsx           # Statisztikai eredmények
```

### API Routes (4 új):
```
/app/api/admin/analytics/
├── journey/route.ts            # User journey data
├── cohorts/route.ts            # Cohort analysis
└── ab-tests/
    ├── route.ts                # List/create A/B tests
    ├── [id]/route.ts           # Single test CRUD
    └── [id]/results/route.ts   # Test results
```

### Database Migrations (1 új):
```sql
-- 006_ab_testing_tables.sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT UNIQUE NOT NULL,
  description TEXT,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  winner_variant TEXT, -- 'a' or 'b' or NULL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ab_test_events_test_id_idx ON ab_test_events(test_id);
CREATE INDEX ab_test_events_session_id_idx ON ab_test_events(session_id);
CREATE INDEX ab_test_events_variant_idx ON ab_test_events(variant);
```

---

## 🎯 Üzleti Haszon

1. **User Journey**: "Miért hagyják el a quizt a 14. kérdésnél?" → Testimonial optimalizálás
2. **Cohorts**: "35-45 éves korosztály 2x jobb konverziót mutat" → Hirdetés targeting
3. **A/B Tests**: "Bundle ajánlat +15% konverziót hozott" → Data-driven döntések

---

## ⏱️ Becsült Idő

- **User Journey**: 2-3 nap
- **Cohort Analysis**: 2-3 nap
- **A/B Testing**: 3-4 nap
- **Összesen**: ~7-10 nap (1.5-2 hét)

---

## 🔗 További Phase-ek

### Phase 5: Management Tools
- Manual result editing
- Bulk operations
- User management UI

### Phase 6: Automation & Notifications
- Email campaign management
- Alert system for anomalies
- Scheduled reports

---

## 📝 Megjegyzés

Ez a dokumentum a Phase 4 tervezési dokumentuma. Az implementáció **későbbre halasztva**, mivel jelenleg a **fizetős termékek** kifejlesztése prioritás.

**Kapcsolódó dokumentumok**:
- [ADMIN_SYSTEM_PLAN.md](ADMIN_SYSTEM_PLAN.md) - Teljes admin rendszer terv
- [ADMIN_PHASE1_COMPLETE.md](ADMIN_PHASE1_COMPLETE.md) - Phase 1-3 implementáció összefoglalója

---

**Készítette**: Claude Code
**Dátum**: 2025-10-16
**Státusz**: 📋 TERVEZÉS (később implementálásra vár)
