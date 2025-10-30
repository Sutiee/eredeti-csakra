# URL-Based Pricing Variant Implementation Plan

**Created:** 2024-10-30
**Status:** Ready for Implementation
**Priority:** High
**Estimated Time:** 2-3 weeks

---

## Executive Summary

This document outlines a professional, stable implementation plan for URL-based A/B/C testing of product pricing in the Eredeti Csakra application. The solution is designed to minimize bugs, maintain backward compatibility, and provide a solid foundation for future pricing experiments.

---

## 1. Current State Analysis

### 1.1 Existing Pricing Structure

**Products:**
- `ai_analysis_pdf`: 990 Ft (AI Elemzés)
- `workbook_30day`: 3,990 Ft (30 napos Munkafüzet)

**Price Storage:**
- Centralized in `/lib/stripe/products.ts`
- Hardcoded in 2 components: `UpsellModal.tsx`, `UpsellBoxPersonalizedReport.tsx`

### 1.2 Required Variants

| Variant | URL Identifier | AI Elemzés | 30 napos Munkafüzet | Use Case |
|---------|----------------|------------|---------------------|----------|
| A (Control) | `/checkout?variant=a` | 990 Ft | 3,990 Ft | Baseline (current prices) |
| B | `/checkout?variant=b` | 1,990 Ft | 4,990 Ft | Mid-tier pricing test |
| C | `/checkout?variant=c` | 2,990 Ft | 5,990 Ft | Premium pricing test |

### 1.3 Critical Files Requiring Changes

**High Priority (Core Pricing):**
1. `/lib/stripe/products.ts` - Product definitions
2. `/lib/pricing/variants.ts` - NEW: Variant management system
3. `/middleware.ts` - Variant detection & cookie handling
4. `/lib/admin/tracking/client.ts` - Analytics variant tracking

**Medium Priority (UI Components):**
5. `/components/success/UpsellModal.tsx` - Hardcoded 3,990 Ft
6. `/components/result/UpsellBoxPersonalizedReport.tsx` - Hardcoded 990 Ft
7. `/components/checkout/CheckoutForm.tsx` - Price calculations
8. `/app/checkout/[result-id]/page.tsx` - Checkout page logic

**Low Priority (Display Only):**
9. `/app/success/[result-id]/page.tsx` - Success page
10. `/data/faq-conversion.ts` - FAQ content with prices

---

## 2. Architecture Design

### 2.1 Variant Detection Flow

```
User clicks link with ?variant=b
         ↓
Middleware detects ?variant parameter
         ↓
Set __variant cookie (30-day expiry)
         ↓
All pages read variant from:
  1. URL param (priority)
  2. Cookie (fallback)
  3. Default: 'a' (control)
         ↓
Components fetch prices from getPricing(variant)
         ↓
Analytics tracks variant_id in all events
```

### 2.2 Data Structure

**Pricing Configuration:**
```typescript
// lib/pricing/variants.ts
export type VariantId = 'a' | 'b' | 'c';
export type ProductId = 'ai_analysis_pdf' | 'workbook_30day';

export interface PricingVariant {
  id: VariantId;
  name: string;
  description: string;
  prices: Record<ProductId, number>;
  stripePriceIds?: Record<ProductId, string>; // Optional: Pre-created Stripe prices
}

export const PRICING_VARIANTS: Record<VariantId, PricingVariant> = {
  a: {
    id: 'a',
    name: 'Control',
    description: 'Baseline pricing (original)',
    prices: {
      ai_analysis_pdf: 990,
      workbook_30day: 3990,
    },
  },
  b: {
    id: 'b',
    name: 'Mid-Tier',
    description: 'Medium pricing test',
    prices: {
      ai_analysis_pdf: 1990,
      workbook_30day: 4990,
    },
  },
  c: {
    id: 'c',
    name: 'Premium',
    description: 'High pricing test',
    prices: {
      ai_analysis_pdf: 2990,
      workbook_30day: 5990,
    },
  },
};
```

### 2.3 Variant Helper Functions

```typescript
// lib/pricing/variants.ts

/**
 * Get pricing for a specific variant and product
 */
export function getPrice(productId: ProductId, variant: VariantId = 'a'): number {
  return PRICING_VARIANTS[variant]?.prices[productId] || PRICING_VARIANTS.a.prices[productId];
}

/**
 * Get current variant from URL or cookie
 */
export function getCurrentVariant(searchParams?: URLSearchParams): VariantId {
  if (typeof window === 'undefined') return 'a';

  // Priority 1: URL parameter
  const params = searchParams || new URLSearchParams(window.location.search);
  const urlVariant = params.get('variant') as VariantId;
  if (urlVariant && ['a', 'b', 'c'].includes(urlVariant)) {
    return urlVariant;
  }

  // Priority 2: Cookie
  const cookies = document.cookie.split(';');
  const variantCookie = cookies
    .find(c => c.trim().startsWith('__variant='))
    ?.split('=')[1]
    ?.trim() as VariantId;
  if (variantCookie && ['a', 'b', 'c'].includes(variantCookie)) {
    return variantCookie;
  }

  // Default: Control
  return 'a';
}

/**
 * Validate variant ID
 */
export function isValidVariant(variant: any): variant is VariantId {
  return ['a', 'b', 'c'].includes(variant);
}

/**
 * Get all prices for a variant
 */
export function getAllPrices(variant: VariantId = 'a'): Record<ProductId, number> {
  return PRICING_VARIANTS[variant]?.prices || PRICING_VARIANTS.a.prices;
}
```

---

## 3. Implementation Steps

### Phase 1: Foundation (Week 1, Days 1-5)

#### Step 1.1: Create Pricing Variant System
**File:** `/lib/pricing/variants.ts` (NEW)

**Tasks:**
- [ ] Define `VariantId`, `ProductId`, `PricingVariant` types
- [ ] Create `PRICING_VARIANTS` constant with all 3 variants
- [ ] Implement `getPrice()`, `getCurrentVariant()`, `isValidVariant()`
- [ ] Add JSDoc documentation
- [ ] Write unit tests

**Acceptance Criteria:**
- All helper functions return correct prices
- Invalid variants default to 'a'
- Type safety enforced

#### Step 1.2: Update Middleware for Variant Detection
**File:** `/middleware.ts` (MODIFY)

**Tasks:**
- [ ] Detect `?variant` query parameter
- [ ] Set `__variant` cookie when valid variant detected
- [ ] Cookie config: 30-day expiry, path: '/', sameSite: 'lax'
- [ ] Add matcher for relevant routes

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { isValidVariant } from '@/lib/pricing/variants';

export async function middleware(request: NextRequest) {
  // Existing admin protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = await protectAdminRoute(request);
    if (response) return response;
  }

  // Variant detection & cookie setup
  const variant = request.nextUrl.searchParams.get('variant');
  const response = NextResponse.next();

  if (variant && isValidVariant(variant)) {
    response.cookies.set('__variant', variant, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/eredmeny/:path*',
    '/checkout/:path*',
    '/success/:path*',
  ],
};
```

**Acceptance Criteria:**
- Cookie set correctly when `?variant=b` in URL
- Cookie expires after 30 days
- Invalid variants ignored (no cookie set)
- Production uses secure cookies

#### Step 1.3: Update Analytics Tracking
**File:** `/lib/admin/tracking/client.ts` (MODIFY)

**Tasks:**
- [ ] Add `getVariantId()` function to extract current variant
- [ ] Include `variant_id` in all `trackEvent()` calls
- [ ] Update `ClientEventData` type to include `variant_id`

**Code:**
```typescript
// Add after getUTMParams()
function getVariantId(): string {
  if (typeof window === 'undefined') return 'a';

  try {
    // Priority 1: URL param
    const params = new URLSearchParams(window.location.search);
    const variant = params.get('variant');
    if (variant && ['a', 'b', 'c'].includes(variant)) return variant;

    // Priority 2: Cookie
    const cookies = document.cookie.split(';');
    const variantCookie = cookies
      .find(c => c.trim().startsWith('__variant='))
      ?.split('=')[1]
      ?.trim();
    if (variantCookie && ['a', 'b', 'c'].includes(variantCookie)) {
      return variantCookie;
    }

    return 'a';
  } catch {
    return 'a';
  }
}

// In trackEvent() payload (line ~180):
const payload: ClientEventData = {
  event_name: eventName,
  event_data: {
    ...eventData,
    ...getUTMParams(),
    variant_id: getVariantId(), // NEW
  },
  // ...
};
```

**Acceptance Criteria:**
- All analytics events include `variant_id` field
- Variant ID correctly extracted from URL or cookie
- Defaults to 'a' on errors

#### Step 1.4: Database Migration
**File:** SQL migration script (NEW)

**Tasks:**
- [ ] Add `variant_id` column to `analytics_events` table
- [ ] Add index on `variant_id`
- [ ] Add composite index on `(variant_id, result_id)`

**SQL:**
```sql
-- Add variant_id column
ALTER TABLE analytics_events
ADD COLUMN variant_id VARCHAR(1) DEFAULT 'a' NOT NULL;

-- Add indexes for variant-based queries
CREATE INDEX idx_analytics_variant_id ON analytics_events(variant_id);
CREATE INDEX idx_analytics_variant_result ON analytics_events(variant_id, result_id);

-- Optional: Backfill existing rows
UPDATE analytics_events SET variant_id = 'a' WHERE variant_id IS NULL;
```

**Acceptance Criteria:**
- Migration runs without errors
- Existing data unaffected
- Indexes improve query performance

---

### Phase 2: Component Updates (Week 1, Days 6-7 + Week 2, Days 1-3)

#### Step 2.1: Refactor UpsellModal (Hardcoded Prices)
**File:** `/components/success/UpsellModal.tsx` (MODIFY)

**Current State:**
- Line 93: `amount: 3990` (hardcoded)
- Line 200: `3990 Ft` (hardcoded display)
- Line 201: `9990 Ft` (hardcoded original)

**Tasks:**
- [ ] Import `getCurrentVariant()` and `getPrice()`
- [ ] Calculate price dynamically: `getPrice('workbook_30day', variant)`
- [ ] Update all price displays to use dynamic value
- [ ] Update analytics tracking to use dynamic amount

**Code:**
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { getCurrentVariant, getPrice } from '@/lib/pricing/variants';

export default function UpsellModal({ /* props */ }) {
  const searchParams = useSearchParams();
  const variant = getCurrentVariant(searchParams);
  const workbookPrice = getPrice('workbook_30day', variant);
  const originalPrice = 9990; // Keep original as constant

  // Update tracking (line 93)
  trackEvent('upsell_purchased', {
    amount: workbookPrice, // DYNAMIC
    variant_id: variant,
  });

  // Update display (lines 200-201)
  return (
    <div>
      <span className="text-3xl font-bold text-purple-600">
        {workbookPrice.toLocaleString()} Ft
      </span>
      <span className="text-xl text-gray-400 line-through">
        {originalPrice.toLocaleString()} Ft
      </span>
    </div>
  );
}
```

**Acceptance Criteria:**
- Prices displayed match variant configuration
- Analytics tracking includes correct dynamic amount
- No hardcoded prices remain

#### Step 2.2: Refactor UpsellBoxPersonalizedReport
**File:** `/components/result/UpsellBoxPersonalizedReport.tsx` (MODIFY)

**Current State:**
- Line 139: `7,990 Ft` (hardcoded strikethrough)
- Line 143: `990 Ft` (hardcoded current)
- Line 147: `87%` (hardcoded discount)

**Tasks:**
- [ ] Import variant helpers
- [ ] Calculate AI analysis price dynamically
- [ ] Calculate discount percentage dynamically
- [ ] Update onClick tracking to include variant

**Code:**
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { getCurrentVariant, getPrice } from '@/lib/pricing/variants';

export default function UpsellBoxPersonalizedReport({ /* props */ }) {
  const searchParams = useSearchParams();
  const variant = getCurrentVariant(searchParams);
  const aiPrice = getPrice('ai_analysis_pdf', variant);
  const originalPrice = 7990;
  const discountPercent = Math.round((1 - aiPrice / originalPrice) * 100);

  const handleCtaClick = () => {
    onCtaClick?.();
    trackEvent('softupsell_click', {
      position: 'result_page_main',
      price: aiPrice,
      original_price: originalPrice,
      discount_percent: discountPercent,
      variant_id: variant,
    });
  };

  return (
    <div>
      <span className="line-through">{originalPrice.toLocaleString()} Ft</span>
      <span className="font-bold">{aiPrice.toLocaleString()} Ft</span>
      <span className="badge">{discountPercent}% kedvezmény</span>
    </div>
  );
}
```

**Acceptance Criteria:**
- Prices update based on variant
- Discount percentage calculated correctly
- Analytics includes variant ID

#### Step 2.3: Update CheckoutForm
**File:** `/components/checkout/CheckoutForm.tsx` (MODIFY)

**Tasks:**
- [ ] Import variant helpers
- [ ] Pass `variant` to `calculateTotal()`
- [ ] Update price fetching to use `getPrice(productId, variant)`
- [ ] Pass variant to Stripe checkout session

**Code:**
```typescript
import { getCurrentVariant, getPrice } from '@/lib/pricing/variants';

export default function CheckoutForm({ resultId, email }: CheckoutFormProps) {
  const searchParams = useSearchParams();
  const variant = getCurrentVariant(searchParams);

  const calculateTotal = (): number => {
    return selectedProducts.reduce((sum, productId) => {
      const price = getPrice(productId, variant);
      return sum + price;
    }, 0);
  };

  // In handleSubmit():
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      items: selectedProducts.map(productId => ({
        productId,
        quantity: 1,
      })),
      resultId,
      email,
      variant, // NEW: Pass variant to API
    }),
  });
}
```

**Acceptance Criteria:**
- Total price calculated using variant prices
- Variant ID sent to checkout API
- UI displays correct prices per variant

#### Step 2.4: Update Checkout API
**File:** `/app/api/create-checkout-session/route.ts` (MODIFY)

**Tasks:**
- [ ] Accept `variant` in request body
- [ ] Validate variant ID
- [ ] Pass variant to `createCheckoutSession()`
- [ ] Store variant in Stripe metadata

**Code:**
```typescript
import { isValidVariant, type VariantId } from '@/lib/pricing/variants';

// Update request schema
const requestSchema = z.object({
  items: z.array(/* ... */),
  resultId: z.string(),
  email: z.string().email(),
  variant: z.enum(['a', 'b', 'c']).optional(), // NEW
});

// In POST handler:
const { items, resultId, email, variant = 'a' } = requestSchema.parse(body);

// Validate variant
if (!isValidVariant(variant)) {
  return NextResponse.json(
    { data: null, error: { message: 'Invalid variant ID' } },
    { status: 400 }
  );
}

// Pass to checkout session
const sessionUrl = await createCheckoutSession({
  items,
  resultId,
  email,
  variant, // NEW
});
```

**Acceptance Criteria:**
- API accepts `variant` parameter
- Invalid variants rejected with 400 error
- Variant stored in session metadata

#### Step 2.5: Update Stripe Checkout Helper
**File:** `/lib/stripe/checkout.ts` (MODIFY)

**Tasks:**
- [ ] Accept `variant` parameter in function signature
- [ ] Fetch prices using `getPrice(productId, variant)`
- [ ] Include variant in session metadata
- [ ] Include variant in line item metadata

**Code:**
```typescript
import { getPrice, type VariantId } from '@/lib/pricing/variants';

export async function createCheckoutSession({
  items,
  resultId,
  email,
  variant = 'a' as VariantId, // NEW parameter
}: CreateCheckoutSessionParams): Promise<string> {

  const lineItems = items.map((item) => {
    const product = PRODUCTS[item.productId];
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    // Fetch price based on variant
    const price = getPrice(item.productId, variant);

    return {
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            product_id: product.id,
            variant_id: variant, // NEW
          },
        },
        unit_amount: price * 100, // DYNAMIC PRICE
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    // ...
    metadata: {
      result_id: resultId,
      email,
      variant_id: variant, // NEW
    },
    // ...
  });

  return session.url || '';
}
```

**Acceptance Criteria:**
- Prices fetched from variant configuration
- Variant ID stored in Stripe session metadata
- Line items include variant metadata

#### Step 2.6: Update Webhook Handler
**File:** `/app/api/stripe/webhook/route.ts` (MODIFY)

**Tasks:**
- [ ] Extract `variant_id` from session metadata
- [ ] Validate variant ID
- [ ] Store variant ID in purchases table
- [ ] Include variant in analytics tracking

**Code:**
```typescript
// In checkout.session.completed handler
const variantId = session.metadata?.variant_id || 'a';

// Validate
if (!['a', 'b', 'c'].includes(variantId)) {
  console.error('[Webhook] Invalid variant ID:', variantId);
  return NextResponse.json({ received: true }, { status: 400 });
}

// Insert purchase with variant
const { data: purchase, error: purchaseError } = await supabase
  .from('purchases')
  .insert({
    result_id: resultId,
    email: email,
    product_id: productId,
    amount: rawAmount > 0 ? rawAmount / 100 : localProduct?.price,
    currency: 'huf',
    status: 'completed',
    stripe_session_id: sessionId,
    variant_id: variantId, // NEW
  });
```

**Acceptance Criteria:**
- Variant ID extracted from webhook metadata
- Invalid variants logged and rejected
- Variant stored in purchases table

---

### Phase 3: Database & Infrastructure (Week 2, Days 4-5)

#### Step 3.1: Update Purchases Table
**File:** SQL migration (NEW)

**SQL:**
```sql
-- Add variant_id to purchases
ALTER TABLE purchases
ADD COLUMN variant_id VARCHAR(1) DEFAULT 'a' NOT NULL;

-- Add index for variant-based queries
CREATE INDEX idx_purchases_variant ON purchases(variant_id);
CREATE INDEX idx_purchases_variant_product ON purchases(variant_id, product_id);

-- Backfill existing records
UPDATE purchases SET variant_id = 'a' WHERE variant_id IS NULL;
```

**Acceptance Criteria:**
- Column added without data loss
- Indexes improve query performance
- Existing purchases defaulted to 'a'

#### Step 3.2: Update Success Page
**File:** `/app/success/[result-id]/page.tsx` (MODIFY)

**Tasks:**
- [ ] Fetch purchase variant from database
- [ ] Pass variant to child components
- [ ] Display variant-specific prices

**Code:**
```typescript
// Fetch purchases with variant
const { data: purchases } = await supabase
  .from('purchases')
  .select('*, variant_id')
  .eq('result_id', resultId);

// Pass variant to components
<ThankYouMessage
  purchase={purchase}
  variant={purchase.variant_id}
/>
```

**Acceptance Criteria:**
- Variant ID fetched from database
- Components receive correct variant
- Prices displayed match purchase variant

---

### Phase 4: Testing & Documentation (Week 2, Days 6-7 + Week 3)

#### Step 4.1: Manual Testing Checklist

**Variant A (Control):**
- [ ] Visit `/checkout?variant=a`
- [ ] Verify prices: AI = 990 Ft, Workbook = 3,990 Ft
- [ ] Complete purchase
- [ ] Check webhook logs for variant_id = 'a'
- [ ] Verify success page shows correct prices
- [ ] Check database: `purchases.variant_id = 'a'`

**Variant B (Mid-Tier):**
- [ ] Visit `/checkout?variant=b`
- [ ] Verify prices: AI = 1,990 Ft, Workbook = 4,990 Ft
- [ ] Complete purchase
- [ ] Check analytics events include variant_id = 'b'
- [ ] Verify Stripe metadata includes variant_id

**Variant C (Premium):**
- [ ] Visit `/checkout?variant=c`
- [ ] Verify prices: AI = 2,990 Ft, Workbook = 5,990 Ft
- [ ] Test upsell flow with variant C prices
- [ ] Verify email notifications show correct prices

**Cookie Persistence:**
- [ ] Set variant via URL: `/checkout?variant=b`
- [ ] Navigate away and return (no query param)
- [ ] Verify variant 'b' persists via cookie
- [ ] Clear cookies, verify default to 'a'

**Edge Cases:**
- [ ] Invalid variant: `/checkout?variant=x` → Should default to 'a'
- [ ] Missing variant param → Should default to 'a'
- [ ] Direct Stripe checkout → Should preserve variant

#### Step 4.2: Automated Tests

**Unit Tests** (`/lib/pricing/variants.test.ts`):
```typescript
describe('Pricing Variants', () => {
  test('getPrice returns correct price for variant', () => {
    expect(getPrice('ai_analysis_pdf', 'a')).toBe(990);
    expect(getPrice('ai_analysis_pdf', 'b')).toBe(1990);
    expect(getPrice('ai_analysis_pdf', 'c')).toBe(2990);
  });

  test('getCurrentVariant defaults to "a" on invalid input', () => {
    expect(getCurrentVariant(new URLSearchParams('variant=x'))).toBe('a');
  });

  test('isValidVariant validates correctly', () => {
    expect(isValidVariant('a')).toBe(true);
    expect(isValidVariant('x')).toBe(false);
  });
});
```

**Integration Tests:**
```typescript
describe('Checkout with Variants', () => {
  test('Variant B creates correct Stripe session', async () => {
    const session = await createCheckoutSession({
      items: [{ productId: 'ai_analysis_pdf', quantity: 1 }],
      resultId: 'test-123',
      email: 'test@example.com',
      variant: 'b',
    });

    expect(session.metadata.variant_id).toBe('b');
    expect(session.amount_total).toBe(199000); // 1,990 Ft in cents
  });
});
```

#### Step 4.3: Documentation Updates

**Update `/docs/PRICING_VARIANT_IMPLEMENTATION_PLAN.md`:**
- [ ] Add post-implementation notes
- [ ] Document URL patterns for each variant
- [ ] List all modified files
- [ ] Include rollback procedure

**Update `/CLAUDE.md`:**
- [ ] Add section on pricing variants
- [ ] Document `lib/pricing/variants.ts` API
- [ ] Note that prices are now dynamic

**Create `/docs/VARIANT_TESTING_GUIDE.md`:**
- [ ] Step-by-step testing instructions
- [ ] Expected prices per variant
- [ ] Analytics verification steps
- [ ] Troubleshooting common issues

---

## 4. Risk Mitigation

### 4.1 Backward Compatibility

**Strategy:**
- Default variant is 'a' (matches current prices)
- No query parameter = current behavior
- Existing links continue to work

**Validation:**
- All existing URLs redirect correctly
- No price changes for users without variant param
- Database migrations preserve existing data

### 4.2 Stripe Integration Safety

**Measures:**
- Validate variant before creating Stripe session
- Log all variant-related errors to Sentry
- Test mode webhooks before production deployment
- Include variant in all Stripe metadata for debugging

### 4.3 Analytics Data Integrity

**Checks:**
- Verify variant_id appears in 100% of new events
- Monitor for null/invalid variant IDs
- Set up alerts for variant distribution anomalies
- Daily check of variant conversion rates

### 4.4 Rollback Plan

If critical issues arise:

1. **Immediate:** Set environment variable `DISABLE_VARIANTS=true`
2. **Code:** Revert to previous Git commit
3. **Database:** Variant columns nullable, won't break queries
4. **Stripe:** Webhooks handle missing variant gracefully

---

## 5. Success Metrics

### 5.1 Technical Metrics

- [ ] 0 TypeScript errors
- [ ] 100% of purchases include variant_id
- [ ] 100% of analytics events include variant_id
- [ ] < 1% invalid variant attempts
- [ ] Cookie persistence > 95%

### 5.2 Business Metrics (Post-Launch)

- Conversion rate by variant
- Average order value by variant
- Revenue per visitor by variant
- Statistical significance (min 100 purchases per variant)

### 5.3 Performance Metrics

- No increase in page load time
- No increase in checkout completion time
- No increase in error rates

---

## 6. Timeline

### Week 1
- **Days 1-2:** Create pricing variant system + middleware
- **Days 3-4:** Update analytics tracking + database
- **Days 5-7:** Refactor UpsellModal and UpsellBox components

### Week 2
- **Days 1-3:** Update CheckoutForm, API, webhook
- **Days 4-5:** Database migrations + success page updates
- **Days 6-7:** Internal testing

### Week 3
- **Days 1-3:** QA testing + bug fixes
- **Days 4-5:** Documentation + deployment prep
- **Days 6-7:** Production deployment + monitoring

---

## 7. Post-Implementation Tasks

### Week 4+ (Ongoing)
- [ ] Monitor variant distribution daily
- [ ] Analyze conversion rates weekly
- [ ] Run statistical significance tests
- [ ] Gather user feedback
- [ ] Prepare winning variant rollout
- [ ] Clean up losing variant code

---

## 8. File Checklist

### New Files
- [ ] `/lib/pricing/variants.ts` - Variant management system
- [ ] `/lib/pricing/variants.test.ts` - Unit tests
- [ ] `/docs/VARIANT_TESTING_GUIDE.md` - Testing documentation

### Modified Files
- [ ] `/middleware.ts` - Variant cookie handling
- [ ] `/lib/admin/tracking/client.ts` - Analytics variant tracking
- [ ] `/components/success/UpsellModal.tsx` - Dynamic prices
- [ ] `/components/result/UpsellBoxPersonalizedReport.tsx` - Dynamic prices
- [ ] `/components/checkout/CheckoutForm.tsx` - Variant-aware pricing
- [ ] `/app/checkout/[result-id]/page.tsx` - Pass variant to API
- [ ] `/app/api/create-checkout-session/route.ts` - Accept variant param
- [ ] `/lib/stripe/checkout.ts` - Use variant prices
- [ ] `/app/api/stripe/webhook/route.ts` - Store variant in DB
- [ ] `/app/success/[result-id]/page.tsx` - Display variant prices

### Database Migrations
- [ ] Add `variant_id` to `analytics_events`
- [ ] Add `variant_id` to `purchases`
- [ ] Create indexes for variant queries

---

## 9. Contacts & Resources

**Developer:** Claude Code
**Product Owner:** [Your Name]
**QA Lead:** [QA Name]
**Deployment:** Vercel (auto-deploy on push to main)

**Resources:**
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Console: https://supabase.com/dashboard
- Analytics Dashboard: `/admin/analytics`

---

## 10. Approval Checklist

Before implementation begins:

- [ ] Product Owner reviewed pricing variants
- [ ] Stakeholders approved A/B/C test strategy
- [ ] Budget allocated for potential revenue variance
- [ ] Legal reviewed pricing changes
- [ ] Customer support briefed on variants
- [ ] Marketing team prepared variant-specific campaigns

---

**Status:** ✅ Ready for Implementation
**Last Updated:** 2024-10-30
**Next Review:** After Phase 1 completion