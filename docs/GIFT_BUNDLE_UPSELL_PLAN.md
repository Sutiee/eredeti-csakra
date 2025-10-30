# Gift Bundle Upsell Implementation Plan

## Áttekintés
Post-purchase ajándék vásárlás lehetőség implementációja a success oldalon, központosított árkezeléssel és A/B tesztelési képességgel.

## Koncepció

### Flow áttekintés
1. Vásárlás után a success oldalon
2. **Első popup** (3mp után): 30 napos munkafüzet upsell (3.990 Ft)
3. **Második popup** (válasz után 2mp): Ajándék bundle vagy csak AI elemzés
4. Automatikus kupon generálás és e-mail küldés

### Árazási stratégia

| Termék | Eredeti ár | Kedvezményes ár | Megjegyzés |
|--------|------------|-----------------|------------|
| AI elemzés | 990 Ft | - | Alap termék |
| 30 napos munkafüzet | 3.990 Ft | - | Első upsell |
| **Ajándék Bundle** (AI + 30 napos) | 4.980 Ft | **2.990 Ft** (-40%) | Ha vásárolt 30 napost |
| **Ajándék AI only** | 990 Ft | **590 Ft** (-40%) | Ha NEM vásárolt 30 napost |

## Technikai Implementáció

### 1. Központosított Árkezelés

```typescript
// lib/pricing/config.ts
export const PRICING = {
  products: {
    ai_analysis: {
      id: 'ai_analysis',
      name: 'Személyre Szabott AI Elemzés',
      prices: {
        original: 990,
        variants: {
          A: 990,  // Kontroll
          B: 790,  // -20%
          C: 590   // -40%
        }
      }
    },
    workbook_30day: {
      id: 'workbook_30day',
      name: '30 napos Csakra Munkafüzet',
      prices: {
        original: 3990,
        variants: {
          A: 3990,  // Kontroll
          B: 2990,  // -25%
          C: 1990   // -50%
        }
      }
    },
    gift_bundle_full: {
      id: 'gift_bundle_full',
      name: 'Ajándék Csomag (AI + 30 napos)',
      prices: {
        original: 4980,
        variants: {
          A: 3490,  // -30%
          B: 2990,  // -40%
          C: 2490   // -50%
        }
      }
    },
    gift_ai_only: {
      id: 'gift_ai_only',
      name: 'Ajándék AI Elemzés',
      prices: {
        original: 990,
        variants: {
          A: 790,  // -20%
          B: 590,  // -40%
          C: 490   // -50%
        }
      }
    }
  },

  // A/B teszt variant getter
  getPrice: (productId: string, variant: 'A' | 'B' | 'C' = 'A') => {
    const product = PRICING.products[productId];
    return product?.prices.variants[variant] || product?.prices.original;
  },

  // Kedvezmény százalék számítás
  getDiscount: (productId: string, variant: 'A' | 'B' | 'C' = 'A') => {
    const product = PRICING.products[productId];
    const original = product?.prices.original;
    const current = product?.prices.variants[variant];
    return Math.round((1 - current/original) * 100);
  }
};
```

### 2. Success Oldal Popup Sorrend

```typescript
// app/success/[result-id]/page.tsx
export default function SuccessPage() {
  const [show30DayModal, setShow30DayModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [purchased30Day, setPurchased30Day] = useState(false);
  const [variant, setVariant] = useState<'A' | 'B' | 'C'>('B'); // A/B test

  useEffect(() => {
    // 1. Első popup: 30 napos munkafüzet (3 mp után)
    setTimeout(() => {
      setShow30DayModal(true);
    }, 3000);
  }, []);

  const handle30DayResponse = (purchased: boolean) => {
    setPurchased30Day(purchased);
    setShow30DayModal(false);

    // 2. Második popup: Ajándék (2 mp után)
    setTimeout(() => {
      setShowGiftModal(true);
    }, 2000);
  };

  // Dinamikus árak
  const giftPrice = purchased30Day
    ? PRICING.getPrice('gift_bundle_full', variant)
    : PRICING.getPrice('gift_ai_only', variant);
}
```

### 3. Modal Komponensek

#### 30 Napos Munkafüzet Modal
```tsx
// components/upsell/Modal30DayUpsell.tsx
export default function Modal30DayUpsell({
  variant,
  onPurchase,
  onDismiss
}) {
  const price = PRICING.getPrice('workbook_30day', variant);
  const originalPrice = PRICING.products.workbook_30day.prices.original;
  const discount = PRICING.getDiscount('workbook_30day', variant);

  return (
    <Modal>
      <h2>📖 30 napos Csakra Munkafüzet</h2>
      <p>Napi gyakorlatok a csakráid harmonizálásához</p>

      <div className="price">
        <span className="current">{price} Ft</span>
        {variant !== 'A' && (
          <>
            <span className="original">{originalPrice} Ft</span>
            <span className="badge">-{discount}%</span>
          </>
        )}
      </div>

      <button onClick={onPurchase}>Igen, kérem!</button>
      <button onClick={onDismiss}>Most nem</button>
    </Modal>
  );
}
```

#### Ajándék Modal
```tsx
// components/upsell/ModalGiftOffer.tsx
export default function ModalGiftOffer({
  purchased30Day,
  variant,
  onPurchase,
  onDismiss
}) {
  const productId = purchased30Day ? 'gift_bundle_full' : 'gift_ai_only';
  const price = PRICING.getPrice(productId, variant);
  const originalPrice = PRICING.products[productId].prices.original;
  const discount = PRICING.getDiscount(productId, variant);

  return (
    <Modal>
      <h2>🎁 Ajándékozz örömet!</h2>

      {purchased30Day ? (
        <>
          <p>Ajándékozz teljes csomagot kedvezménnyel!</p>
          <ul>
            <li>✨ AI Elemzés</li>
            <li>📖 30 napos munkafüzet</li>
          </ul>
        </>
      ) : (
        <p>Gondoltál valakire, akinek hasznos lenne?</p>
      )}

      <div className="price">
        <span className="current">{price} Ft</span>
        <span className="original">{originalPrice} Ft</span>
        <span className="badge">-{discount}%</span>
      </div>

      <GiftPurchaseForm onSubmit={onPurchase} />
      <button onClick={onDismiss}>Később talán</button>
    </Modal>
  );
}
```

### 4. Backend API Endpoints

#### Ajándék Kupon Generálás
```typescript
// app/api/create-gift-coupon/route.ts
export async function POST(req: Request) {
  const {
    purchaserEmail,
    recipientEmail,
    products,
    variant
  } = await req.json();

  // Stripe kupon létrehozás
  const coupon = await stripe.coupons.create({
    percent_off: 40,
    duration: 'once',
    max_redemptions: 1,
    metadata: {
      gift_from: purchaserEmail,
      recipient: recipientEmail,
      bundle_type: products.join(','),
      variant
    }
  });

  // Promóciós kód
  const promoCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: `GIFT-${generateShortId()}`,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  });

  // Adatbázis mentés
  await supabase.from('gift_purchases').insert({
    purchaser_email: purchaserEmail,
    recipient_email: recipientEmail,
    coupon_code: promoCode.code,
    products,
    variant,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // E-mail küldés
  await sendGiftEmail(recipientEmail, {
    from: purchaserEmail,
    code: promoCode.code,
    products
  });

  return NextResponse.json({ success: true, code: promoCode.code });
}
```

### 5. Ajándék Beváltó Oldal

```typescript
// app/ajandek/[code]/page.tsx
export default function GiftRedeemPage({ params }) {
  const code = params.code;
  const [loading, setLoading] = useState(true);
  const [giftData, setGiftData] = useState(null);

  useEffect(() => {
    // Kupon validálás
    validateGiftCode(code).then(data => {
      setGiftData(data);
      setLoading(false);

      // Auto-redirect checkout-hoz
      if (data.valid) {
        setTimeout(() => {
          router.push(`/checkout?coupon=${code}&products=${data.products.join(',')}`);
        }, 3000);
      }
    });
  }, [code]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="gift-redeem-page">
      <h1>🎁 Kaptál egy ajándékot!</h1>
      {giftData.from && (
        <p>{giftData.from} gondolt rád!</p>
      )}
      <div className="gift-contents">
        {giftData.products.map(product => (
          <div key={product}>{getProductName(product)}</div>
        ))}
      </div>
      <p>Átirányítás a kvízhez...</p>
    </div>
  );
}
```

### 6. Database Séma

```sql
-- Gift purchases tábla
CREATE TABLE gift_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchaser_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  coupon_code TEXT UNIQUE NOT NULL,
  products TEXT[] NOT NULL,
  variant CHAR(1) NOT NULL,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW(),
  redeemed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- A/B Test tracking
CREATE TABLE ab_test_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant CHAR(1) NOT NULL,
  action TEXT NOT NULL, -- 'view', 'purchase', 'dismiss'
  price_shown INTEGER NOT NULL,
  discount_shown INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 7. E-mail Templates

#### Ajándékozottnak
```html
Subject: 🎁 Kaptál egy különleges ajándékot!

Kedves [Név]!

[Ajándékozó neve] úgy gondolta, hogy Neked is
hasznos lenne megismerni a csakráid állapotát.

Az ajándékod tartalmaz:
✨ Személyre szabott csakra AI elemzést
[Ha van: 📖 30 napos csakra munkafüzetet]

[Ajándékom aktiválása →]
Link: https://eredeticsakra.hu/ajandek/[CODE]

Érvényes: 30 napig
```

#### Ajándékozónak (visszaigazolás)
```html
Subject: ✅ Ajándékod sikeresen elküldve!

Kedves [Név]!

Sikeresen elküldtük az ajándékot a következő címre:
[Recipient email]

Ajándék tartalom:
- AI elemzés
[- 30 napos munkafüzet]

Kupon kód: [CODE]
Érvényes: 30 napig

Ha kérdésed van, írj nekünk!
```

## A/B Testing Strategy

### Variánsok

| Variant | AI Ajándék | Bundle Ajándék | Célcsoport |
|---------|------------|----------------|------------|
| A | 790 Ft (-20%) | 3.490 Ft (-30%) | Kontroll |
| B | 590 Ft (-40%) | 2.990 Ft (-40%) | Közép kedvezmény |
| C | 490 Ft (-50%) | 2.490 Ft (-50%) | Agresszív kedvezmény |

### Metrikák
- **Conversion Rate**: Hány % vásárol ajándékot
- **Average Order Value**: Átlagos ajándék érték
- **Redemption Rate**: Hány % váltja be a kupont
- **Viral Coefficient**: Beváltók közül hány % vásárol

## Implementation Roadmap

### Phase 1 (1. hét)
- [ ] Központosított árkezelés implementálása
- [ ] Success oldal modal komponensek
- [ ] Alapvető tracking

### Phase 2 (2. hét)
- [ ] Stripe kupon integráció
- [ ] Ajándék beváltó oldal
- [ ] Database séma létrehozás

### Phase 3 (3. hét)
- [ ] E-mail automatizáció
- [ ] A/B test framework
- [ ] Analytics dashboard

## Megjegyzések

- Minden ár dinamikusan kezelve, nem hardcode
- Popup sorrend: 30 napos → majd ajándék
- Ajándék ára függ attól, hogy vásárolt-e 30 napost
- Maximum 1-3 ajándék/vásárló limit fontolóra vehető
- 30 napos lejárat a kuponokon
- Tracking minden interakcióról az optimalizáláshoz

---

**Utolsó frissítés:** 2024-10-30
**Státusz:** Tervezési fázis
**Prioritás:** Közepes (másik fejlesztés után)