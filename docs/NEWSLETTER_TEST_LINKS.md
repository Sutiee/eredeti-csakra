# Newsletter A/B/C Test Links - Eredeti Csakra

## 📋 Áttekintés

Ez a dokumentum tartalmazza a **3 árváltozatú (A/B/C) teszt linkeket** a marketing kampányokhoz. Minden link automatikusan beállítja a megfelelő árakat a checkout folyamatban.

---

## 🎯 Árváltozatok

| Variant | AI Elemzés PDF | 30 Napos Munkafüzet | Pozicionálás |
|---------|----------------|---------------------|--------------|
| **A** (Control) | 990 Ft | 3,990 Ft | Belépő szintű ár |
| **B** (Mid-Tier) | 1,990 Ft | 4,990 Ft | **LEGJOBB ÉRTÉK** ⭐ |
| **C** (Premium) | 2,990 Ft | 5,990 Ft | Prémium minőség 👑 |

**Eredeti ár mindhárom variánsnál:** 7,990 Ft (AI Elemzés)

---

## 🔗 Teszt Linkek Típusok

### 1. **Landing Page (Főoldal)**

**Variant A (990 Ft):**
```
https://eredeticsakra.hu/?variant=a
```

**Variant B (1,990 Ft) - AJÁNLOTT:**
```
https://eredeticsakra.hu/?variant=b
```

**Variant C (2,990 Ft):**
```
https://eredeticsakra.hu/?variant=c
```

---

### 2. **Kvíz Kezdőoldal (Pre-Quiz Ritual)**

**Variant A:**
```
https://eredeticsakra.hu/kviz/bevezeto?variant=a
```

**Variant B:**
```
https://eredeticsakra.hu/kviz/bevezeto?variant=b
```

**Variant C:**
```
https://eredeticsakra.hu/kviz/bevezeto?variant=c
```

---

### 3. **Kvíz Főoldal (28 Kérdés)**

**Variant A:**
```
https://eredeticsakra.hu/kviz?variant=a
```

**Variant B:**
```
https://eredeticsakra.hu/kviz?variant=b
```

**Variant C:**
```
https://eredeticsakra.hu/kviz?variant=c
```

---

### 4. **Eredmény Oldal (Result Page)**

⚠️ **Fontos:** Az eredmény oldal linkekhez szükséges egy érvényes `result-id` (UUID).

**Példa linkek:**
```
https://eredeticsakra.hu/eredmeny/[result-id]?variant=a
https://eredeticsakra.hu/eredmeny/[result-id]?variant=b
https://eredeticsakra.hu/eredmeny/[result-id]?variant=c
```

**Hogyan szerezd meg a result-id-t:**
1. Töltsd ki a kvízt
2. Az eredmény oldal URL-jében látható a result-id
3. Helyettesítsd be a linkekbe

---

### 5. **Checkout Oldal (Vásárlás)**

⚠️ **Fontos:** A checkout linkekhez szükséges egy érvényes `result-id` (UUID).

**Variant A (990 Ft):**
```
https://eredeticsakra.hu/checkout/[result-id]?variant=a
```

**Variant B (1,990 Ft):**
```
https://eredeticsakra.hu/checkout/[result-id]?variant=b
```

**Variant C (2,990 Ft):**
```
https://eredeticsakra.hu/checkout/[result-id]?variant=c
```

---

## 🧪 Debug UI - Teszteléshez

### Hogyan láthatod az összes variánst egyszerre?

Adj hozzá **`?debug=true`** bármely oldalhoz, hogy megjelenjen a **Variant Switcher Debug Panel** a jobb alsó sarokban:

```
https://eredeticsakra.hu/?debug=true
https://eredeticsakra.hu/kviz/bevezeto?debug=true
https://eredeticsakra.hu/checkout/[result-id]?debug=true
```

**Debug Panel funkciók:**
- Látható az aktuális variant (A/B/C)
- Gyors váltás a variánsok között
- Link másolása gomb (📋)
- Cookie törlés funkció
- Árak megjelenítése minden variánsnál

---

## 📧 Email Kampány Linkek

### Személyre Szabott Linkek Emailben

Ha van a címzettnek korábbi kvíz eredménye, használj személyre szabott linkeket:

**Sablon:**
```
https://eredeticsakra.hu/checkout/{{result_id}}?variant={{variant}}
```

**Példa:**
```
Kedves Anna,

Fedezd fel csakráid állapotát most kedvezményesen!

[Elemzésem Megrendelése Most](https://eredeticsakra.hu/checkout/abc-123-def-456?variant=b)

Üdvözlettel,
Eredeti Csakra Csapata
```

---

### Generic Linkek (Nincs Korábbi Eredmény)

Ha a címzettnek nincs korábbi kvíz eredménye, küldd a főoldalra vagy kvíz kezdőoldalra:

**Főoldal:**
```
https://eredeticsakra.hu/?variant=b
```

**Kvíz Kezdőoldal:**
```
https://eredeticsakra.hu/kviz/bevezeto?variant=b
```

---

## 🎨 Marketing Használati Javaslatok

### Facebook/Instagram Hirdetések

1. **Hozz létre 3 külön hirdetést** (A/B/C)
2. **Célközönség szegmentálás:**
   - Variant A: Ár-érzékeny közönség (35-45 éves nők)
   - Variant B: Értékközpontú közönség (40-55 éves nők) - **AJÁNLOTT**
   - Variant C: Prémium közönség (45-60 éves nők)
3. **UTM paraméterek hozzáadása** (opcionális):
   ```
   https://eredeticsakra.hu/?variant=b&utm_source=facebook&utm_medium=paid&utm_campaign=nov_2025
   ```

---

### Google Ads

**Kulcsszavak szerinti árazás:**
- **"ingyenes csakra teszt"** → Variant A (990 Ft, belépő ár)
- **"csakra elemzés"** → Variant B (1,990 Ft, legjobb érték)
- **"prémium csakra tanácsadás"** → Variant C (2,990 Ft, prémium)

---

### Email Marketing

**Newsletter Kampány Linkek:**
```
Subject: Miért érzed magad kimerültnek naponta? 🌀

Kedves {{name}},

Fedezd fel csakráid valódi állapotát most {{discount}}%-os kedvezménnyel!

[CTA Button: Elemzésem Megrendelése Most](https://eredeticsakra.hu/?variant=b)
```

**Változatok:**
- Variant A: 87% kedvezmény (7,990 Ft → 990 Ft)
- Variant B: 75% kedvezmény (7,990 Ft → 1,990 Ft)
- Variant C: 63% kedvezmény (7,990 Ft → 2,990 Ft)

---

## 🔍 Variant Tracking

### Hogyan Követhető a Konverzió Variant Szerint?

1. **Stripe Dashboard:**
   - Minden checkout metaadatban tárolja a `variant_id` értéket
   - Filter: `metadata['variant_id']:a` (vagy `b`, `c`)

2. **Supabase Adatbázis:**
   - A `purchases` táblában található a `variant_id` mező
   - Query példa:
     ```sql
     SELECT variant_id, COUNT(*) as purchases, SUM(amount) as revenue
     FROM purchases
     WHERE created_at >= '2025-11-01'
     GROUP BY variant_id;
     ```

3. **Analytics (Google Analytics / Facebook Pixel):**
   - Minden variant cookie-ban tárolódik (`__variant`)
   - Tracking event: `purchase` + `variant` dimension

---

## 📊 A/B/C Teszt Best Practices

### 1. **Minimum Sample Size**
- Legalább **100 konverzió per variant** a statisztikai szignifikanciához
- Várható időkeret: 2-4 hét (forgalomtól függően)

### 2. **Egy Változó Tesztelése**
- Ne változtass mást, csak az árat
- Tartsd meg ugyanazt a landing page-t, email template-et, hirdetés kreatívot

### 3. **Eredmények Értékelése**
- **Konverziós ráta:** Melyik variant konvertál jobban?
- **Átlagos bevétel per látogató (ARPV):** Melyik variant hoz több bevételt?
- **Customer Lifetime Value (CLV):** Melyik variant hozza a legjobb hosszú távú vásárlókat?

### 4. **Winner Kiválasztása**
- Használj **Chi-Square Test**-et a statisztikai szignifikancia ellenőrzéséhez
- P-value < 0.05 = szignifikáns különbség
- Online kalkulátor: [AB Test Calculator](https://abtestguide.com/calc/)

---

## 🚀 Gyors Másolás - Copy-Paste Ready Linkek

### Landing Page Linkek (Főoldal)
```
Variant A: https://eredeticsakra.hu/?variant=a
Variant B: https://eredeticsakra.hu/?variant=b
Variant C: https://eredeticsakra.hu/?variant=c
```

### Kvíz Linkek
```
Variant A: https://eredeticsakra.hu/kviz/bevezeto?variant=a
Variant B: https://eredeticsakra.hu/kviz/bevezeto?variant=b
Variant C: https://eredeticsakra.hu/kviz/bevezeto?variant=c
```

### Debug Linkek (Teszteléshez)
```
Landing + Debug: https://eredeticsakra.hu/?variant=b&debug=true
Kvíz + Debug: https://eredeticsakra.hu/kviz/bevezeto?variant=b&debug=true
```

---

## ❓ Gyakori Kérdések (FAQ)

### Mi történik, ha valaki A/B/C link nélkül jön az oldalra?
- Automatikusan **Variant A** (control) lesz beállítva (990 Ft)

### Mennyi ideig tárolódik a variant a cookie-ban?
- **30 nap** a beállítástól számítva

### Megváltoztathatja a felhasználó a variánsát a folyamat közben?
- Igen, ha új linken keresztül jön be (új `?variant=` paraméterrel)
- A cookie automatikusan felülíródik

### Működnek-e a linkek mobilon?
- Igen, minden link mobilon és desktopon is működik
- A cookie ugyanúgy tárolódik mindkét platformon

### Hogyan tesztelhetek egy új árat?
1. Módosítsd a `lib/pricing/variants.ts` fájlt
2. Add hozzá az új árakat (pl. `d` variant)
3. Frissítsd a middleware-t új variant támogatásához
4. Készíts új linkeket: `?variant=d`

---

## 📞 Támogatás

Ha kérdésed van a teszt linkekkel kapcsolatban:
- **Technikai probléma:** Ellenőrizd a cookie-kat a böngésző DevTools-ban
- **Ár nem frissül:** Töröld a cookie-kat és próbáld újra
- **Debug UI nem jelenik meg:** Add hozzá `?debug=true` paramétert

---

**Utoljára frissítve:** 2025-11-05
**Verzió:** v1.5 - Newsletter Campaign System
