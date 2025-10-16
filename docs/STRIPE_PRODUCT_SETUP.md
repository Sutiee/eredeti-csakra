# Stripe Termék Konfiguráció - v1.5

## Előfeltételek
- Stripe fiók létrehozva
- Dashboard elérés: https://dashboard.stripe.com

## 1. Termékek Létrehozása

Menj a **Products** → **Add Product** menüpontba, és hozd létre mind a 4 terméket:

### A) Részletes PDF Elemzés (Detailed Analysis)

**Termék adatok:**
- **Name**: `Részletes Csakra Elemzés PDF`
- **Description**: `Személyre szabott, 15+ oldalas PDF elemzés a 7 csakra részletes diagnosztikájával, gyakorlatokkal és első segély tervvel.`
- **Pricing**:
  - **One-time**: `4990 HUF`
  - **Billing period**: One-time
- **Tax code**: Physical goods (vagy Digital goods, attól függően, hogy van-e EU VAT regisztrációd)

**Metadata (FONTOS!):**
```
product_type: detailed_pdf
includes_meditation: false
pdf_template: detailed_analysis
chakra_specific: false
```

**Product ID mentése**: `prod_xxx...` (ezt fogod használni a kódban)

---

### B) Meditációs Csomag (Meditation Bundle)

**Termék adatok:**
- **Name**: `7 Meditációs Audiófájl Csomag`
- **Description**: `Minden csakrához személyre szabott, magyar nyelvű geführt meditáció (összesen 7 audiófájl) a blokkok feloldására.`
- **Pricing**:
  - **One-time**: `9990 HUF`
  - **Billing period**: One-time

**Metadata:**
```
product_type: meditations
includes_meditation: true
meditation_count: 7
chakra_specific: true
access_duration_days: 365
```

**Product ID mentése**: `prod_xxx...`

---

### C) Bundle (PDF + Meditációk)

**Termék adatok:**
- **Name**: `Teljes Csakra Csomag (PDF + Meditációk)`
- **Description**: `Kombinált ajánlat: Részletes PDF elemzés + 7 személyre szabott meditációs audiófájl. Teljes spirituális önfejlesztési csomag.`
- **Pricing**:
  - **One-time**: `12990 HUF` (13% kedvezmény!)
  - **Billing period**: One-time

**Metadata:**
```
product_type: bundle
includes_meditation: true
includes_pdf: true
meditation_count: 7
chakra_specific: true
access_duration_days: 365
```

**Product ID mentése**: `prod_xxx...`

---

### D) Kézikönyv (Digital Handbook)

**Termék adatok:**
- **Name**: `Csakra Gyógyítás Kézikönyv PDF`
- **Description**: `Átfogó, 50+ oldalas digitális kézikönyv a 7 csakráról, gyógyítási technikákról, gyakorlatokról és mindennapi rutinokról.`
- **Pricing**:
  - **One-time**: `6990 HUF`
  - **Billing period**: One-time

**Metadata:**
```
product_type: ebook
includes_meditation: false
pdf_template: handbook
chakra_specific: false
downloadable: true
```

**Product ID mentése**: `prod_xxx...`

---

## 2. Stripe Checkout Beállítások

### Payment Settings
- **Payment methods**: Card (minimum)
- **Currency**: HUF (Hungarian Forint)
- **Automatic tax**: Enable (ha van EU VAT regisztráció)

### Checkout Session Settings
Minden termékhez:
- **Mode**: `payment` (one-time purchase)
- **Success URL**: `https://eredeticsakra.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `https://eredeticsakra.vercel.app/eredmeny/{result_id}`

---

## 3. Webhook Setup

### Create Webhook Endpoint

1. Menj a **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://eredeticsakra.vercel.app/api/webhooks/stripe`
3. **Events to listen to**:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

4. **API Version**: Latest (2025-09-30.clover)

5. **Webhook signing secret mentése**: `whsec_xxx...` (ezt az `.env` fájlba kell tenni)

---

## 4. API Keys Mentése

### Stripe Dashboard → Developers → API keys

1. **Publishable key** (pk_live_xxx...):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
   ```

2. **Secret key** (sk_live_xxx...):
   ```
   STRIPE_SECRET_KEY=sk_live_xxx...
   ```

3. **Webhook signing secret** (whsec_xxx...):
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

---

## 5. Termék ID-k a Kódban

Miután létrehoztad a 4 terméket, frissítsd a következő fájlt:

**File**: `lib/stripe/products.ts`

```typescript
export const STRIPE_PRODUCTS = {
  DETAILED_PDF: 'prod_xxx...', // A fentebb mentett Product ID
  MEDITATIONS: 'prod_xxx...',
  BUNDLE: 'prod_xxx...',
  EBOOK: 'prod_xxx...',
} as const;

export const PRODUCT_PRICES = {
  DETAILED_PDF: 4990,
  MEDITATIONS: 9990,
  BUNDLE: 12990,
  EBOOK: 6990,
} as const;
```

---

## 6. Vercel Environment Variables

Add hozzá a következő env var-okat a Vercel Dashboard-on:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

---

## 7. Tesztelés

### Test Mode
Először teszteld Test Mode-ban:
1. Use test keys: `pk_test_xxx...`, `sk_test_xxx...`
2. Test card: `4242 4242 4242 4242`, bármilyen CVC és jövőbeli lejárat
3. Webhook URL: használd ngrok-ot vagy Stripe CLI-t helyi teszteléshez

### Production Mode
Miután minden működik Test Mode-ban:
1. Toggle to Live Mode
2. Cseréld ki a test key-eket live key-ekre
3. Deploy to Vercel
4. Tesztelj éles fizetéssel (alacsony összeggel)

---

## Checklist

- [ ] 4 termék létrehozva a Stripe Dashboard-on
- [ ] Minden termék metadata-ja helyesen beállítva
- [ ] Webhook endpoint létrehozva és 5 event típus kiválasztva
- [ ] API keys és webhook secret mentve
- [ ] `lib/stripe/products.ts` frissítve a valós Product ID-kkel
- [ ] Vercel environment variables beállítva
- [ ] Test Mode-ban tesztelve
- [ ] Production Mode-ban tesztelve

---

## Problémák & Megoldások

### Hiba: "No such product: prod_xxx"
- Ellenőrizd, hogy a helyes Product ID-t másoltad be
- Ellenőrizd, hogy Live Mode-ban vagy-e (ne Test Mode-ban)

### Hiba: "Invalid webhook signature"
- Webhook secret rosszul van beállítva
- Használd a webhook endpoint-hoz tartozó signing secret-et

### Hiba: Payment fails silently
- Nézd meg a Stripe Dashboard → Logs → Events
- Ellenőrizd a webhook delivery-t
