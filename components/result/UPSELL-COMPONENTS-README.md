# Upsell & Social Proof Components

Created: 2025-10-17

## Overview

Three new components for the result page conversion optimization:

1. **UpsellBoxPersonalizedReport** - Promotional upsell box for personalized reports
2. **StatsDynamic** - Dynamic social proof statistics
3. **API Route: /api/stats/social-proof** - Backend endpoint for stats

---

## Component Documentation

### 1. UpsellBoxPersonalizedReport

**File**: `components/result/UpsellBoxPersonalizedReport.tsx`

**Purpose**: Promote the personalized report upsell with compelling copy and discount pricing.

**Usage**:
```tsx
import UpsellBoxPersonalizedReport from '@/components/result/UpsellBoxPersonalizedReport';

<UpsellBoxPersonalizedReport resultId={resultId} />
```

**Props**:
- `resultId: string` - The quiz result ID for checkout navigation

**Features**:
- Bold emotional hook: "🔮 Ez még csak a jéghegy csúcsa!"
- Clear value proposition with checkmarks (4 key benefits)
- Strikethrough pricing: ~~7,990 Ft~~ → 990 Ft (87% discount)
- Prominent CTA button with fire emoji animation
- Purple gradient background matching brand
- Trust signals (instant access, 14-day money-back guarantee)

**Navigation**:
- Redirects to: `/checkout/${resultId}?product=personalized_report`

**Design**:
- Responsive (mobile-first)
- Framer Motion animations (fade-in, scale on hover)
- Gradient background: purple → rose
- White text on dark background for contrast

---

### 2. StatsDynamic

**File**: `components/result/StatsDynamic.tsx`

**Purpose**: Display dynamic social proof statistics to build trust.

**Usage**:
```tsx
import StatsDynamic from '@/components/result/StatsDynamic';

<StatsDynamic />
```

**Props**: None (fetches data internally)

**Features**:
- Real-time customer count (based on quiz results × 10)
- Star rating display (4.8★ average)
- Review count (~2.3% of customers)
- Loading skeleton state
- Fallback data if API fails

**API Endpoint**: `GET /api/stats/social-proof`

**Response Format**:
```json
{
  "customers": 1200,
  "rating": 4.8,
  "reviews": 28
}
```

**Display**:
- Two-column layout (mobile: stacked, desktop: side-by-side)
- Icons: 👥 for customers, ⭐ for rating
- Clean, minimalist typography
- Responsive divider between stats

---

## API Route: /api/stats/social-proof

**File**: `app/api/stats/social-proof/route.ts`

**Method**: GET

**Purpose**: Calculate and return social proof statistics based on quiz results.

**Logic**:
```typescript
1. Fetch quiz_results count from Supabase
2. Calculate "customers" = count × 10 (implies ~10% conversion)
3. Round to nearest hundred for clean display
4. Calculate reviews = customers × 0.023 (~2.3% review rate)
5. Return { customers, rating: 4.8, reviews }
```

**Caching**:
- Cache-Control: `public, s-maxage=300, stale-while-revalidate=600`
- Cache duration: 5 minutes (300s)
- Stale-while-revalidate: 10 minutes (600s)

**Fallback**:
- If Supabase query fails: returns `{ customers: 1200, rating: 4.8, reviews: 28 }`
- Shorter cache for fallback: 60s

---

## Integration Example

**Result Page** (`app/eredmeny/[id]/page.tsx`):

```tsx
import UpsellBoxPersonalizedReport from '@/components/result/UpsellBoxPersonalizedReport';
import StatsDynamic from '@/components/result/StatsDynamic';

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <main>
      {/* ... Chakra Silhouette ... */}

      {/* Social Proof Stats */}
      <StatsDynamic />

      {/* Upsell Box - Place after first 2-3 chakra cards */}
      <UpsellBoxPersonalizedReport resultId={params.id} />

      {/* ... Rest of chakra cards ... */}
    </main>
  );
}
```

---

## TypeScript Types

All components are fully typed with proper TypeScript:

**UpsellBoxPersonalizedReport**:
```typescript
interface UpsellBoxPersonalizedReportProps {
  resultId: string;
}
```

**StatsDynamic**:
```typescript
interface SocialProofStats {
  customers: number;
  rating: number;
  reviews: number;
}
```

**API Response**:
```typescript
// GET /api/stats/social-proof
Promise<NextResponse<{
  customers: number;
  rating: number;
  reviews: number;
}>>
```

---

## Testing Checklist

- [ ] UpsellBoxPersonalizedReport renders correctly
- [ ] CTA button navigates to `/checkout/${resultId}?product=personalized_report`
- [ ] StatsDynamic fetches and displays data
- [ ] StatsDynamic shows loading skeleton
- [ ] StatsDynamic falls back gracefully on API error
- [ ] API route returns correct stats format
- [ ] API route caching headers are set
- [ ] Mobile responsive design works
- [ ] Animations perform smoothly

---

## Performance Notes

- **StatsDynamic**: Client-side fetch on mount (CSR)
- **API Caching**: 5-minute cache reduces Supabase queries
- **Fallback Data**: Ensures stats always display
- **Loading State**: Prevents layout shift with skeleton

---

## Future Enhancements

- [ ] A/B test different discount percentages (990 Ft vs 1,990 Ft)
- [ ] Track click-through rates via analytics
- [ ] Add more trust signals (testimonials, badges)
- [ ] Implement exit-intent popup for cart abandonment
