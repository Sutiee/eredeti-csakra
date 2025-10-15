# Stripe Payment Integration - Implementation Guide
## Eredeti Csakra - Complete Payment Flow

---

## Table of Contents
1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Environment Variables](#environment-variables)
4. [Stripe Dashboard Setup](#stripe-dashboard-setup)
5. [Database Schema](#database-schema)
6. [Implementation Details](#implementation-details)
7. [Testing](#testing)
8. [Deployment Checklist](#deployment-checklist)

---

## Overview

Complete Stripe payment integration for Eredeti Csakra digital products:
- **Base Product**: Személyre Szabott Csakra Csomag (2990 HUF)
- **Upsell #1**: Csakra Kézikönyv (1990 HUF)
- **Upsell #2**: Meditációs Csomag (3990 HUF)
- **Bundle**: Teljes Harmónia Csomag (6990 HUF - 22% discount)

### Payment Flow
1. User completes quiz → gets result ID
2. Click "Megrendelem most" → `/checkout/[result-id]`
3. Select products (base + optional upsells/bundle)
4. Submit payment → Stripe Checkout hosted page
5. Payment success → Stripe webhook → Database update
6. Redirect → `/success/[result-id]`

---

## File Structure

### Library Files (18 total)
```
lib/
├── stripe/
│   ├── client.ts              # Stripe server client initialization
│   ├── products.ts            # Product definitions & pricing
│   └── checkout.ts            # Checkout helper functions

data/
└── products.ts                # Extended product metadata (features, benefits)

app/api/
├── create-checkout-session/
│   └── route.ts               # POST: Create Stripe checkout session
└── stripe/
    └── webhook/
        └── route.ts           # POST: Handle Stripe webhooks

app/checkout/[result-id]/
└── page.tsx                   # Checkout page (product selection)

app/success/[result-id]/
└── page.tsx                   # Success confirmation page

components/
├── checkout/
│   ├── CheckoutForm.tsx       # Product selection form
│   ├── UpsellCheckboxes.tsx   # Handbook & meditation upsells
│   ├── BundleOffer.tsx        # Bundle discount offer
│   └── ProductSummary.tsx     # Order summary sidebar
└── success/
    ├── ThankYouMessage.tsx    # Purchase confirmation
    └── DownloadLinks.tsx      # Download/access links

docs/database-migrations/
└── 003_purchases_meditation_tables.sql   # Database schema
```

---

## Environment Variables

### Required Variables (`.env.local`)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxx...  # Get from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Generated after webhook setup

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL in production

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://zvoaqnfxschflsoqnusg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Test Mode Variables (for testing)
```bash
# Use test keys for development
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

---

## Stripe Dashboard Setup

### 1. Create Products & Prices

#### Product #1: Személyre Szabott Csakra Csomag
- **Product ID**: `prod_personal_chakra_report`
- **Price**: 2990 HUF
- **Price ID**: `price_2990_huf`
- **Type**: One-time payment
- **Metadata**: `product_id: prod_personal_chakra_report`

#### Product #2: Csakra Kézikönyv
- **Product ID**: `prod_chakra_handbook`
- **Price**: 1990 HUF
- **Price ID**: `price_1990_huf`
- **Type**: One-time payment
- **Metadata**: `product_id: prod_chakra_handbook`

#### Product #3: Meditációs Csomag
- **Product ID**: `prod_chakra_meditations`
- **Price**: 3990 HUF
- **Price ID**: `price_3990_huf`
- **Type**: One-time payment
- **Metadata**: `product_id: prod_chakra_meditations`

#### Product #4: Teljes Harmónia Csomag
- **Product ID**: `prod_full_harmony_bundle`
- **Price**: 6990 HUF
- **Price ID**: `price_6990_huf`
- **Type**: One-time payment
- **Metadata**: `product_id: prod_full_harmony_bundle`

### 2. Configure Webhook

1. Go to: **Developers → Webhooks**
2. Click: **Add endpoint**
3. **Endpoint URL**: `https://eredeticsakra.hu/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret** → Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

---

## Database Schema

### Tables Created

#### `purchases`
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'HUF',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `meditation_access`
```sql
CREATE TABLE meditation_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID,
  email TEXT NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Run Migration
```bash
# In Supabase SQL Editor
# Copy and execute: docs/database-migrations/003_purchases_meditation_tables.sql
```

---

## Implementation Details

### API Routes

#### 1. Create Checkout Session
**Endpoint**: `POST /api/create-checkout-session`

**Request Body**:
```json
{
  "resultId": "uuid-string",
  "email": "user@example.com",
  "items": [
    {
      "productId": "prod_personal_chakra_report",
      "quantity": 1
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  },
  "error": null
}
```

#### 2. Webhook Handler
**Endpoint**: `POST /api/stripe/webhook`

**Handles**:
- `checkout.session.completed`: Updates purchase status to "completed"
- `payment_intent.succeeded`: Optional logging
- `payment_intent.payment_failed`: Optional error tracking

**Actions**:
1. Verify webhook signature
2. Extract line items from session
3. Create purchase records in database
4. If meditation access purchased → Generate access token

---

## Testing

### Test Cards

**Successful Payment**:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
Zip: Any 5 digits
```

**Payment Requires Authentication**:
```
Card Number: 4000 0027 6000 3184
```

**Declined Card**:
```
Card Number: 4000 0000 0000 0002
```

### Test Checklist

- [ ] 1. Navigate to `/checkout/[valid-result-id]`
- [ ] 2. Verify email pre-filled correctly
- [ ] 3. Select base product only → Check total (2990 HUF)
- [ ] 4. Add handbook → Check total (4980 HUF)
- [ ] 5. Add meditations → Check total (8970 HUF)
- [ ] 6. Select bundle → Check total (6990 HUF) & other products deselected
- [ ] 7. Submit → Redirected to Stripe Checkout
- [ ] 8. Complete payment with test card
- [ ] 9. Verify redirect to `/success/[result-id]`
- [ ] 10. Check database: Purchase record created with status "completed"
- [ ] 11. If meditation purchased: Verify access token generated

### Webhook Testing (Local Development)

#### Using Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook
stripe trigger checkout.session.completed
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] 1. **Environment Variables**: Update `.env.local` with production Stripe keys
- [ ] 2. **Stripe Dashboard**: Create all 4 products with correct pricing
- [ ] 3. **Webhook Setup**: Configure webhook with production URL
- [ ] 4. **Database Migration**: Run `003_purchases_meditation_tables.sql` in production Supabase
- [ ] 5. **Test Payment Flow**: Complete end-to-end test with test cards
- [ ] 6. **Error Handling**: Verify error messages display correctly
- [ ] 7. **Email Notifications**: Test purchase confirmation emails (if implemented)

### Post-Deployment

- [ ] 8. **Live Payment Test**: Make small test purchase with live card
- [ ] 9. **Webhook Verification**: Check webhook events in Stripe Dashboard
- [ ] 10. **Database Check**: Verify purchase records created correctly
- [ ] 11. **Success Page**: Confirm download links work
- [ ] 12. **Analytics**: Set up conversion tracking (optional)

---

## Troubleshooting

### Common Issues

#### Issue: Webhook signature verification failed
**Solution**:
1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Verify endpoint URL is correct
3. Test with Stripe CLI first

#### Issue: Payment successful but database not updated
**Solution**:
1. Check webhook endpoint logs (`/api/stripe/webhook`)
2. Verify Supabase service role key is correct
3. Check webhook events in Stripe Dashboard → Developers → Events

#### Issue: "Invalid product ID" error
**Solution**:
1. Verify product IDs in `lib/stripe/products.ts` match Stripe Dashboard
2. Check product metadata in Stripe Dashboard

#### Issue: TypeScript errors
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run type check
npx tsc --noEmit
```

---

## Support

For questions or issues:
- **Email**: hello@eredeticsakra.hu
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Implementation Date**: October 14, 2025
**Last Updated**: October 14, 2025
**Version**: 1.0.0
