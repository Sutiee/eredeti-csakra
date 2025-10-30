# Gift Bundle Upsell - Implementation Status

## ✅ Phase 1: Foundation (COMPLETED)

### 1.1 Pricing Variants System ✅
**File:** `/lib/pricing/variants.ts`

**Changes:**
- Added `gift_bundle_full` and `gift_ai_only` to `ProductId` type
- Extended `PRICING_VARIANTS` with gift product prices (40% discount):
  - Variant A: gift_bundle_full: 2,988 Ft | gift_ai_only: 594 Ft
  - Variant B: gift_bundle_full: 4,188 Ft | gift_ai_only: 1,194 Ft
  - Variant C: gift_bundle_full: 5,388 Ft | gift_ai_only: 1,794 Ft
- Added `calculateGiftDiscount()` function
- Updated `isValidProductId()` type guard

### 1.2 Stripe Product Catalog ✅
**File:** `/lib/stripe/products.ts`

**Changes:**
- Added `gift_bundle_full` and `gift_ai_only` to `ProductId` type union
- Added `is_gift` metadata flag
- Added complete product definitions for both gift products
- Updated `getProductPrice()` to support gift products
- Updated `getProductWithVariantPrice()` to support gift products

### 1.3 Database Migration ✅
**File:** `/supabase/migrations/20251030100000_gift_purchases.sql`

**Created:**
- `gift_purchases` table with full schema
- Indexes for performance (gift_code, emails, Stripe IDs, status, variant)
- `updated_at` trigger
- Row Level Security (RLS) policies
- Comprehensive comments

**Next Step:** Run migration in Supabase Dashboard SQL Editor

---

## 🚧 Phase 2: UI Components (TODO - Next Sprint)

### 2.1 Success Page Refactoring
**File:** `/app/success/[result-id]/page.tsx`

**Required Changes:**
```typescript
// Current state:
const [showUpsell, setShowUpsell] = useState(false);

// New state required:
type UpsellModalState = 'idle' | 'workbook_modal' | 'gift_modal' | 'completed';
const [upsellState, setUpsellState] = useState<UpsellModalState>('idle');
const [workbookPurchased, setWorkbookPurchased] = useState(false);

// Modal sequence logic:
// idle → (3s delay) → workbook_modal
// workbook_modal → (user response) → (2s delay) → gift_modal
// gift_modal → (user response) → completed
```

**Implementation Steps:**
1. Add state machine for modal sequence
2. Change first modal timing from 5s → 3s
3. Add second modal trigger (2s after first modal response)
4. Track workbook purchase decision
5. Pass decision to gift modal

### 2.2 GiftModal Component
**File:** `/components/success/GiftModal.tsx` (NEW)

**Component Interface:**
```typescript
type GiftModalProps = {
  sessionId: string;
  resultId: string;
  productId: 'gift_bundle_full' | 'gift_ai_only';
  workbookPurchased: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void | Promise<void>;
};
```

**Features:**
- Collect recipient email (optional)
- Collect gift message (optional)
- Show appropriate product (bundle vs AI only)
- Dynamic pricing based on variant
- 10-minute countdown timer
- Purchase flow using `/api/upsell/process`

**Design Notes:**
- Similar structure to existing `UpsellModal`
- Purple gradient branding
- Prominent price display with discount percentage
- Trust signals ("Nincs új fizetési adat", "Biztonságos fizetés")

---

## 🔌 Phase 3: Backend API (TODO - Next Sprint)

### 3.1 Update Upsell API
**File:** `/app/api/upsell/process/route.ts`

**Required Changes:**
```typescript
// Current schema:
const UpsellRequestSchema = z.object({
  sessionId: z.string().startsWith('cs_'),
  resultId: z.string().uuid(),
  upsellProductId: z.literal('workbook_30day'), // ❌ Too restrictive
});

// New schema:
const UpsellRequestSchema = z.object({
  sessionId: z.string().startsWith('cs_'),
  resultId: z.string().uuid(),
  upsellProductId: z.enum([
    'workbook_30day',
    'gift_bundle_full',
    'gift_ai_only'
  ]),
  recipientEmail: z.string().email().optional(), // For gifts
  giftMessage: z.string().optional(),            // For gifts
});
```

**Gift Purchase Logic:**
1. Validate product is gift type
2. Generate unique gift code (`GIFT-${nanoid(8).toUpperCase()}`)
3. Create Stripe coupon (100% off, single-use, 30-day expiration)
4. Create Stripe promotion code
5. Insert record into `gift_purchases` table
6. Send buyer confirmation email
7. Optionally send recipient notification email

### 3.2 Webhook Handler Extension
**File:** `/app/api/stripe/webhook/route.ts`

**Required Changes:**
```typescript
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  // NEW: Check if this is a gift purchase
  const isGiftPurchase = session.metadata?.type === 'gift';

  if (isGiftPurchase) {
    await handleGiftPurchaseCompleted(session);
    return;
  }

  // ... existing purchase flow
}

async function handleGiftPurchaseCompleted(
  session: Stripe.Checkout.Session
) {
  // 1. Extract gift metadata
  // 2. Generate gift code
  // 3. Create Stripe coupon + promo code
  // 4. Insert gift_purchases record
  // 5. Send buyer confirmation email
  // 6. Send recipient notification email (if provided)
}
```

### 3.3 Gift Validation API (NEW)
**File:** `/app/api/gift/validate/route.ts` (NEW)

**Purpose:** Validate gift code before redemption

```typescript
// GET /api/gift/validate?code=GIFT-ABC123XY
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  // Query gift_purchases
  const gift = await supabase
    .from('gift_purchases')
    .select('*')
    .eq('gift_code', code)
    .single();

  // Check:
  // - Code exists
  // - status = 'active'
  // - expires_at > NOW()

  return NextResponse.json({
    data: {
      valid: boolean,
      gift: { ...product details } | null,
      error?: 'INVALID_CODE' | 'ALREADY_REDEEMED' | 'EXPIRED'
    }
  });
}
```

### 3.4 Gift Redemption API (NEW)
**File:** `/app/api/gift/redeem/route.ts` (NEW)

**Purpose:** Redeem gift code (direct redemption, no Stripe checkout)

```typescript
// POST /api/gift/redeem
// Body: { gift_code, result_id, email }
export async function POST(request: NextRequest) {
  // 1. Validate gift code
  // 2. Verify quiz result exists
  // 3. Create purchase record (amount: 0, status: 'completed')
  // 4. Trigger PDF generation
  // 5. Update gift_purchases:
  //    - status: 'redeemed'
  //    - redeemed_at: NOW()
  //    - redeemed_by_result_id
  //    - redeemed_purchase_id
  // 6. Deactivate Stripe promotion code
  // 7. Send redemption confirmation email with download link

  return NextResponse.json({
    data: {
      purchase_id: string,
      message: 'Ajándék sikeresen beváltva!'
    }
  });
}
```

---

## 📧 Phase 4: Email Templates (TODO - Next Sprint)

### 4.1 Gift Buyer Confirmation Email
**File:** `/lib/email/templates.ts`

**Function:** `generateGiftPurchaseEmail()`

**Recipient:** Gift buyer

**Content:**
- Thank you message
- Gift code prominently displayed
- Product details (what they gifted)
- Redemption instructions link
- Expiration date (30 days)
- Gift value

### 4.2 Gift Recipient Notification Email (Optional)
**File:** `/lib/email/templates.ts`

**Function:** `generateGiftRecipientEmail()`

**Recipient:** Gift recipient (if email provided)

**Content:**
- Gift notification message
- From: [Buyer's name/email]
- Gift message (if provided)
- Gift code
- Redemption link: `https://eredeticsakra.hu/ajandek/[code]`
- Expiration date
- Product details

### 4.3 Gift Redemption Confirmation Email
**File:** `/lib/email/templates.ts`

**Function:** `generateGiftRedemptionEmail()`

**Recipient:** Gift recipient (after redemption)

**Content:**
- Redemption success message
- Product details
- PDF download link
- Access instructions

---

## 🎨 Phase 5: Gift Redemption Page (TODO - Next Sprint)

### 5.1 Gift Redemption Landing Page
**File:** `/app/ajandek/[code]/page.tsx` (NEW)

**Features:**
- Code validation on page load
- Display gift details (product, from whom, expires when)
- Quiz requirement check:
  - If no result_id: Show "Először töltsd ki a kvízt" + CTA to `/kviz`
  - If result_id exists: Show "Beváltás" button
- Redemption flow:
  - Click "Beváltás" → Call `/api/gift/redeem`
  - Show loading state during PDF generation
  - Redirect to `/success/[result-id]` with download link

**URL Structure:**
```
https://eredeticsakra.hu/ajandek/GIFT-ABC123XY
```

**Error States:**
- Invalid code
- Expired code
- Already redeemed
- Network error

---

## 📊 Implementation Timeline

### Completed (Today):
- ✅ Phase 1.1: Pricing variants (30 min)
- ✅ Phase 1.2: Stripe product catalog (30 min)
- ✅ Phase 1.3: Database migration (30 min)
- ✅ Documentation (30 min)

**Total Phase 1:** 2 hours

### Remaining Work (Next Sprint):
- 🚧 Phase 2: UI Components (4-6 hours)
  - Success page refactoring (2-3 hours)
  - GiftModal component (2-3 hours)

- 🚧 Phase 3: Backend API (4-6 hours)
  - Update upsell API (1-2 hours)
  - Webhook handler extension (1-2 hours)
  - Gift validation API (1 hour)
  - Gift redemption API (1-2 hours)

- 🚧 Phase 4: Email Templates (2-3 hours)
  - Buyer confirmation email (1 hour)
  - Recipient notification email (1 hour)
  - Redemption confirmation email (30 min)

- 🚧 Phase 5: Redemption Page (2-3 hours)
  - Landing page component (2 hours)
  - Error handling (1 hour)

**Estimated Total Remaining:** 12-18 hours (1.5-2 days full-time)

---

## 🧪 Testing Checklist

### Foundation Testing (Ready to Test):
- [x] TypeScript type-check passes
- [ ] Pricing variants return correct values for gift products
- [ ] `calculateGiftDiscount()` returns 40% for all variants
- [ ] Database migration runs without errors in Supabase

### Full Feature Testing (After Phase 2-5):
- [ ] User completes quiz
- [ ] First modal appears after 3 seconds (workbook upsell)
- [ ] User purchases workbook
- [ ] Second modal appears after 2 seconds (gift bundle full)
- [ ] OR: User declines workbook → gift AI only modal appears
- [ ] Gift purchase completes successfully
- [ ] Gift code generated and stored in database
- [ ] Buyer receives confirmation email with gift code
- [ ] Recipient receives notification email (if email provided)
- [ ] Gift code validation works correctly
- [ ] Gift redemption creates purchase record
- [ ] PDF generation triggered
- [ ] Recipient receives redemption confirmation email
- [ ] Downloaded PDF is accessible

### Edge Cases:
- [ ] Gift code expiration (30 days)
- [ ] Duplicate gift code prevention
- [ ] Gift redemption without quiz completion (blocked)
- [ ] Invalid gift code error handling
- [ ] Already redeemed gift code error
- [ ] Network error recovery

---

## 🔐 Security Considerations

### Gift Code Generation:
- ✅ Use `nanoid(8)` for 8-character unique codes
- ✅ Format: `GIFT-XXXXXXXX` (uppercase alphanumeric)
- ✅ Check uniqueness before insertion
- ✅ Rate limit validation API (10 requests/minute per IP)

### Access Control:
- ✅ RLS policies on `gift_purchases` table
- ✅ Gift status API: Verify `buyer_email` matches authenticated user (if auth implemented)
- ✅ Redemption API: Require valid `result_id` (quiz completion required)

### Stripe Integration:
- ✅ Coupon deletion: Deactivate promotion code if gift refunded
- ✅ Max redemptions: Always set to 1
- ✅ Expiration: Set both `coupon.redeem_by` and `promotion_code.expires_at`

---

## 📝 Notes

### Why 40% Discount?
Based on the Gift Bundle Upsell Plan document analysis:
- Sweet spot for gift pricing psychology
- Significant enough to motivate purchase
- Not so high as to devalue the products
- Consistent across all variants for simplicity

### Why Two Gift Products?
**Strategy:**
- If user bought workbook → Offer full bundle (AI + Workbook) as gift
- If user declined workbook → Offer AI only as gift

This maximizes conversion by:
1. Not offering duplicate of what user just bought
2. Providing appropriate value proposition based on user's decision
3. Creating urgency after purchase (2-second delay)

### Variant Pricing Consistency:
Gift products automatically inherit the user's A/B/C variant:
- Cookie `__variant` set by middleware
- All prices calculated dynamically via `getPrice()`
- Analytics track variant for conversion analysis

---

## 🚀 Next Steps

1. **Deploy Phase 1 (Foundation)**
   - Commit pricing + product changes
   - Push to GitHub
   - Vercel auto-deploys
   - Run database migration in Supabase Dashboard

2. **Implement Phase 2 (UI Components)**
   - Success page refactoring
   - GiftModal component creation
   - Test modal sequence locally

3. **Implement Phase 3 (Backend API)**
   - Update upsell API
   - Extend webhook handler
   - Create gift validation + redemption APIs
   - Test with Stripe test mode

4. **Implement Phase 4 (Email Templates)**
   - Design email templates
   - Test with Resend sandbox

5. **Implement Phase 5 (Redemption Page)**
   - Create landing page
   - Test full redemption flow

6. **End-to-End Testing**
   - Complete user journey test
   - All variants (A/B/C)
   - Edge case testing

---

**Last Updated:** 2025-10-30
**Status:** Phase 1 Complete (Foundation) ✅
**Next:** Phase 2 (UI Components) 🚧
