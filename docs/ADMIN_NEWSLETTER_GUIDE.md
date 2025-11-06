# Admin Hírlevél Rendszer - Használati Útmutató

## 📋 Áttekintés

Ez az útmutató lépésről lépésre bemutatja, hogyan használd az **Eredeti Csakra Admin Hírlevél Rendszert** 1000+ fős email kampányok kiküldéséhez A/B/C árváltozatokkal.

---

## 🚀 Gyors Start (5 Lépés)

### 1. **Bejelentkezés**
- Menj a következő oldalra: [https://eredeticsakra.hu/admin/login](https://eredeticsakra.hu/admin/login)
- Felhasználónév: `admin`
- Jelszó: `csakra352!`

### 2. **Hírlevél Oldal Megnyitása**
- Kattints a bal oldali menüben a **"Hírlevél" (📧)** linkre
- Vagy menj közvetlenül: [https://eredeticsakra.hu/admin/newsletter](https://eredeticsakra.hu/admin/newsletter)

### 3. **CSV Feltöltés**
- Töltsd fel a címzett listát CSV formátumban
- Formátum: `name`, `email`, `variant`, `result_id` (opcionális)
- Maximum: 1000 sor

### 4. **Kampány Beállítások**
- Válaszd ki az email template változatot (A/B/C)
- Válaszd ki a tárgy sort (3 opció)
- Adj nevet a kampánynak

### 5. **Küldés**
- Kattints a **"Kampány Indítása"** gombra
- Várd meg, amíg az összes email kiküldésre kerül (~10-20 másodperc 1000 emailnél)
- ✅ Kész!

---

## 📊 Admin Dashboard Elrendezés

```
┌──────────────────────────────────────────────────────┐
│  Eredeti Csakra Admin - Hírlevél Kampányok          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │Kampányok │ │ Emailek  │ │  Siker % │ │Utolsó   ││
│  │    12    │ │  11,234  │ │   94.5%  │ │Nov 5.   ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ ÚJ KAMPÁNY LÉTREHOZÁSA                          ││
│  ├─────────────────────────────────────────────────┤│
│  │ 1. CSV FELTÖLTÉS                                ││
│  │    [Drag & Drop vagy Fájl Választás]           ││
│  │    ✅ 1000 címzett feltöltve                    ││
│  │    └─ A: 333, B: 333, C: 334                   ││
│  │                                                  ││
│  │ 2. KAMPÁNY NÉV                                  ││
│  │    [November Welcome Campaign_____________]     ││
│  │                                                  ││
│  │ 3. EMAIL TEMPLATE VÁLASZTÓ (A/B/C)             ││
│  │    [🟪 A: 990 Ft] [✅ B: 1,990 Ft] [🟨 C: 2,990]││
│  │                                                  ││
│  │ 4. TÁRGYSOR VÁLASZTÓ                           ││
│  │    ⚪ Miért érzed magad kimerültnek? 🌀        ││
│  │    🔵 {{name}}, csakráid üzennek... ✨         ││
│  │    ⚪ Csak 48 órád maradt! ⏰                   ││
│  │                                                  ││
│  │ 5. KÜLDÉS                                       ││
│  │    [Teszt Email] [Kampány Indítása (1000)]     ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ KAMPÁNY TÖRTÉNET                                ││
│  ├──────────┬──────┬────────┬────────┬──────┬─────┤│
│  │ Név      │Dátum │Címzett │Sikeres │Siker%│Státusz│
│  ├──────────┼──────┼────────┼────────┼──────┼─────┤│
│  │Nov Camp  │Nov 5 │  1000  │   945  │94.5% │✅   ││
│  │Oct Promo │Oct 20│   500  │   478  │95.6% │✅   ││
│  └──────────┴──────┴────────┴────────┴──────┴─────┘│
└──────────────────────────────────────────────────────┘
```

---

## 📁 CSV Fájl Előkészítése

### CSV Formátum

**Kötelező oszlopok:**
- `name` - Címzett neve (pl. "Anna Kiss")
- `email` - Email cím (pl. "anna.kiss@example.com")
- `variant` - Árváltozat (`a`, `b`, vagy `c`)

**Opcionális oszlopok:**
- `result_id` - Korábbi kvíz eredmény UUID (személyre szabott linkekhez)

### Példa CSV

```csv
name,email,variant,result_id
Anna Kiss,anna.kiss@example.com,a,
Katalin Nagy,katalin.nagy@example.com,b,abc-123-def-456
Éva Szabó,eva.szabo@example.com,c,
Mária Tóth,maria.toth@example.com,a,
Judit Kovács,judit.kovacs@example.com,b,
```

### CSV Sablon Letöltése

Az admin felületen kattints a **"Sablon letöltése"** gombra a CSV feltöltő alatt.

---

## 🎯 Variant Kiválasztása (A/B/C)

### Variant A: 990 Ft (Belépő Ajánlat)
- **Célcsoport:** Ár-érzékeny vásárlók
- **Pozicionálás:** "Kezdd el most kedvező áron"
- **Várható konverzió:** 1.2-1.5%
- **Use case:** Nagy volumen, alacsony árrés

### Variant B: 1,990 Ft ⭐ LEGJOBB ÉRTÉK
- **Célcsoport:** Értékközpontú vásárlók
- **Pozicionálás:** "Legjobb ár-érték arány"
- **Várható konverzió:** 1.0-1.3%
- **Use case:** Optimális bevétel (AJÁNLOTT)

### Variant C: 2,990 Ft (Prémium)
- **Célcsoport:** Minőségközpontú vásárlók
- **Pozicionálás:** "Prémium, professzionális elemzés"
- **Várható konverzió:** 0.7-1.0%
- **Use case:** Magasabb árrés, kisebb volumen

---

## ✉️ Email Tárgysor Választó

Az admin felületen 3 tárgysor közül választhatsz minden varianthoz:

### Opció 1: Problémafókusz
**Tárgysor:** "Miért érzed magad kimerültnek naponta? 🌀"
- **Preview:** "A blokkolt csakráid üzennek... Fedezd fel őket {{price}} Ft-ért"
- **Célcsoport:** Fáradtság, kimerültség
- **Várható open rate:** 28-32%

### Opció 2: Kíváncsiság (Személyre Szabott) ⭐
**Tárgysor:** "{{name}}, csakráid üzennek neked... ✨"
- **Preview:** "20+ oldal személyre szabott elemzés - Most 87%-kal olcsóbban"
- **Célcsoport:** Spiritualitás iránt nyitottak
- **Várható open rate:** 32-38% (LEGMAGASABB)

### Opció 3: Sürgősség
**Tárgysor:** "⏰ Csak 48 órád maradt: Csakra Elemzés -87%"
- **Preview:** "7,990 Ft helyett {{price}} Ft. 234 nő már megrendelte ma."
- **Célcsoport:** FOMO érzékenyek
- **Várható open rate:** 25-30%

**Ajánlásom:** **Opció 2** (Személyre szabott) - Legmagasabb open rate

---

## 🧪 Teszt Email Küldés

### Mikor Használd?

- **Új kampány előtt:** Mindig küldj magadnak teszt emailt!
- **Template módosítás után:** Ellenőrizd, hogy minden rendben jelenik meg
- **Különböző eszközökön:** Desktop + mobil nézet

### Hogyan Használd?

1. Kattints a **"Teszt Email Küldés"** gombra
2. Írd be a saját email címed
3. Válaszd ki a variánsot (A/B/C) amit tesztelni szeretnél
4. Kattints **"Teszt Küldés"** gombra
5. Ellenőrizd az emailt:
   - Layout rendben van-e?
   - Linkek működnek-e?
   - Árak helyesen jelennek meg?
   - Mobilon is jól látszik?

---

## 📧 Kampány Indítása

### Pre-Flight Checklist

Mielőtt elküldöd a kampányt, ellenőrizd:

- [ ] CSV feltöltve (max 1000 sor)
- [ ] Minden email cím valid formátumú
- [ ] Kampány név kitöltve
- [ ] Variant kiválasztva (A/B/C)
- [ ] Tárgysor kiválasztva
- [ ] Teszt email elküldve és ellenőrizve
- [ ] Címzettek hozzájárultak a hírlevélhez (GDPR)

### Indítási Folyamat

1. **Kattints a "Kampány Indítása ([N] címzett)" gombra**
   - Megjelenik egy megerősítő popup: "Biztos vagy benne?"
   - Ellenőrizd a címzettek számát

2. **Megerősítés után:**
   - A rendszer elkezdimega készíteni az emaileket
   - Batch-ekben küldi ki (100 email/batch)
   - **NE zárd be az oldalt!**

3. **Progress Bar Megjelenik:**
   ```
   Kampány Folyamatban...
   ████████████░░░░░░░░ 60%

   ✅ Elküldve: 600
   ❌ Sikertelen: 12
   ⏳ Hátravan: 388
   ```

4. **Befejezéskor:**
   - ✅ Sikeres kampány: Zöld toast + confetti animáció
   - Automatikusan frissül a kampány történet
   - Form resetelődik új kampányhoz

---

## 📊 Kampány Eredmények Követése

### Kampány Történet Tábla

A kampány indítása után láthatóak az eredmények a "Kampány Történet" szekcióban:

| Oszlop | Leírás |
|--------|--------|
| **Név** | Kampány neve (pl. "November Welcome") |
| **Dátum** | Küldés dátuma (magyar formátum) |
| **Címzett** | Összes címzett száma |
| **Sikeres** | Sikeresen elküldött emailek |
| **Siker %** | Sikeres küldések aránya (zöld progress bar) |
| **Státusz** | `✅ Befejezve` / `🔄 Küldés alatt` / `❌ Sikertelen` |

### Részletes Nézet

Kattints egy kampány sorára a részletes statisztikák megjelenítéséhez:

```
November Welcome Campaign
════════════════════════════════════════

Tárgysor: "{{name}}, csakráid üzennek neked... ✨"
Küldés kezdete: 2025-11-05 10:00:00
Befejezés: 2025-11-05 10:15:23

📊 STATISZTIKÁK
────────────────────────────────────────
Összes címzett: 1,000
✅ Sikeresen elküldve: 945 (94.5%)
❌ Sikertelen: 55 (5.5%)

📈 VARIANT BONTÁS
────────────────────────────────────────
Variant A (990 Ft): 333 email
Variant B (1,990 Ft): 333 email
Variant C (2,990 Ft): 334 email

[Eredmények Exportálása CSV]
```

---

## 💾 Kampány Eredmények Exportálása

### CSV Export Funkció

Minden befejezett kampányhoz letöltheted a részletes küldési naplót CSV formátumban.

**Kattints az "Export CSV" gombra** a kampány sorában.

### Exportált CSV Tartalma

```csv
email,name,variant,status,sent_at,error_message
anna.kiss@example.com,Anna Kiss,b,sent,2025-11-05 10:05:12,
katalin.nagy@example.com,Katalin Nagy,a,failed,2025-11-05 10:05:13,Invalid email address
eva.szabo@example.com,Éva Szabó,c,sent,2025-11-05 10:05:14,
```

**Oszlopok:**
- `email` - Címzett email címe
- `name` - Címzett neve
- `variant` - Árváltozat (a/b/c)
- `status` - Státusz (sent/failed/bounced)
- `sent_at` - Küldés időpontja (UTC)
- `error_message` - Hibaüzenet (ha sikertelen)

### Mit Tehetsz az Exportált Adatokkal?

1. **Sikertelen emailek újraküldése:**
   - Szűrd a `status=failed` sorokat
   - Ellenőrizd az email címeket
   - Javítsd a hibás címeket
   - Töltsd fel újra CSV-ben

2. **Variant teljesítmény elemzése:**
   - Pivot tábla készítése variant szerint
   - Konverziós ráta összehasonlítása Stripe adatokkal
   - Legjobban teljesítő variant kiválasztása

3. **Leiratkozások kezelése:**
   - Bounced emailek eltávolítása a listáról
   - Complaint-ek nyomon követése

---

## 📈 Konverziós Tracking

### Hogyan Mérd a Kampány Sikerességét?

#### 1. **Stripe Dashboard**

Menj a [Stripe Dashboard](https://dashboard.stripe.com) → Payments szekció:

**Filter metadata szerint:**
```
metadata['campaign_id'] = 'november-welcome-2025'
metadata['variant_id'] = 'b'
```

**Eladások száma variant szerint:**
- Variant A: 12 eladás × 990 Ft = 11,880 Ft
- Variant B: 18 eladás × 1,990 Ft = 35,820 Ft ⭐
- Variant C: 8 eladás × 2,990 Ft = 23,920 Ft

**Győztes:** Variant B (legnagyobb bevétel)

---

#### 2. **Supabase Database Query**

```sql
SELECT
  p.variant_id,
  COUNT(*) as sales_count,
  SUM(p.amount) as total_revenue,
  AVG(p.amount) as avg_order_value
FROM purchases p
WHERE p.created_at >= '2025-11-05 10:00:00'
  AND p.status = 'completed'
GROUP BY p.variant_id
ORDER BY total_revenue DESC;
```

**Eredmény:**
| variant_id | sales_count | total_revenue | avg_order_value |
|------------|-------------|---------------|-----------------|
| b          | 18          | 35,820 Ft     | 1,990 Ft        |
| c          | 8           | 23,920 Ft     | 2,990 Ft        |
| a          | 12          | 11,880 Ft     | 990 Ft          |

---

#### 3. **Konverziós Ráta Számítása**

```
Konverziós Ráta = (Eladások Száma / Email Címzettek) × 100%
```

**Példa:**
- Variant B: 18 eladás / 333 címzett = **5.4%** ✅
- Variant A: 12 eladás / 333 címzett = **3.6%**
- Variant C: 8 eladás / 334 címzett = **2.4%**

**Megjegyzés:** 5.4% kiemelkedően jó konverziós ráta email marketingben!

---

## ⚠️ Hibaelhárítás

### Probléma: CSV Feltöltés Nem Működik

**Lehetséges okok:**
- Fájl méret > 5MB
- Hibás CSV formátum (nincs header sor)
- Speciális karakterek az email címekben
- Excel UTF-8 BOM problem

**Megoldás:**
1. Ellenőrizd, hogy a CSV első sora header (`name,email,variant`)
2. Mentsd el "CSV UTF-8" formátumban (nem "CSV")
3. Próbáld meg kisebb batch-ekben (500 sor)
4. Használj online CSV validátort: [CSVLint](https://csvlint.io/)

---

### Probléma: Emailek Nem Érkeznek Meg

**Lehetséges okok:**
- Spam folderba kerültek
- Email cím invalid
- Resend API limit túllépve
- Domain nincs verifikálva Resend-ben

**Megoldás:**
1. **Ellenőrizd a Spam foldert**
2. **Resend Dashboard:**
   - Menj a [Resend Dashboard](https://resend.com/dashboard)
   - Emails → Logs
   - Keresd meg a kampány ID-t
   - Nézd meg az email státuszokat (delivered/bounced/complained)
3. **Domain Verifikáció:**
   - Resend-ben ellenőrizd, hogy `eredeticsakra.hu` domain verifikálva van
   - Ha nincs, add hozzá az SPF és DKIM rekordokat

---

### Probléma: Kampány Küldés "Failed" Státuszba Kerül

**Lehetséges okok:**
- >50% email sikertelen volt
- Resend API hiba (rate limit, auth problem)
- Adatbázis connection timeout

**Megoldás:**
1. **Nézd meg a kampány részleteket:**
   - Kattints a kampány sorára
   - Ellenőrizd az error message-eket
2. **Exportáld a CSV-t:**
   - Szűrd a failed emaileket
   - Javítsd a hibás címeket
   - Próbáld újra
3. **Ellenőrizd a Resend API key-t:**
   - `.env.local` fájlban: `RESEND_API_KEY`
   - Teszteld: `npx tsx scripts/test-email-direct.ts`

---

### Probléma: Progress Bar Nem Frissül

**Lehetséges okok:**
- Böngésző tab háttérbe került (sleep mode)
- API polling timeout
- Hálózati kapcsolat megszakadt

**Megoldás:**
1. **Ne zárd be az oldalt** küldés közben
2. **Tartsd az oldalt előtérben** (ne válts tab-ot)
3. Ha megáll a progress:
   - Frissítsd az oldalt (F5)
   - Ellenőrizd a kampány történetben a státuszt
   - Ha "Küldés alatt", várj 2-3 percet és frissítsd újra

---

## 🔒 Biztonság & GDPR

### Email Címek Tárolása

- Email címek **CSAK a kampány idejére** tárolódnak a `newsletter_sends` táblában
- 90 nap után automatikusan törlődnek (opcionális cleanup script)
- Soha ne oszd meg a címlistát harmadik felekkel

### GDPR Megfelelés Checklist

- [ ] **Hozzájárulás:** Minden címzett hozzájárult a hírlevél fogadásához
- [ ] **Leiratkozási link:** Minden emailben kötelező (automatikusan hozzáadva)
- [ ] **Adatkezelési tájékoztató:** Linkeld az első emailben
- [ ] **Törlési kérelem:** 30 napon belül töröld a címet
- [ ] **Adattárolás:** Maximum 2 évig tárolható hozzájárulás nélkül

---

## 📞 Támogatás & Kérdések

### Technikai Probléma Esetén

1. **Ellenőrizd a Vercel function logs-okat:**
   - [Vercel Dashboard](https://vercel.com/dashboard) → Project → Functions → Logs
   - Keresd meg az `/api/admin/newsletter/send` endpoint logokat

2. **Supabase Logs:**
   - [Supabase Dashboard](https://supabase.com/dashboard) → Project → Logs
   - Keresd meg a `newsletter_campaigns` és `newsletter_sends` táblák query-it

3. **Resend Logs:**
   - [Resend Dashboard](https://resend.com/dashboard) → Emails → Logs
   - Szűrj campaign_id szerint

---

## 📚 További Dokumentáció

- **Email Template Fejlesztés:** `/lib/email/newsletter-templates.ts`
- **API Referencia:** `/docs/API.md` (ha létezik)
- **Teszt Linkek:** [/docs/NEWSLETTER_TEST_LINKS.md](/docs/NEWSLETTER_TEST_LINKS.md)
- **Supabase Schema:** `/docs/supabase-schema.sql`

---

## 🎯 Best Practices

### Email Marketing Tippek

1. **Ne küldj naponta:** Maximum hetente 1-2 email
2. **Tesztelj mindig:** Küldj teszt emailt minden új kampány előtt
3. **Segmentálj:** Használj A/B/C variantokat különböző közönségeknek
4. **Mérd az eredményeket:** Követd a konverziós rátákat
5. **Tisztítsd a listát:** Töröld a bounced és invalid email címeket

### Optimális Küldési Időpontok

**Legjobban teljesítő időpontok:**
- **Kedd - Csütörtök:** 10:00-11:00 vagy 14:00-16:00
- **Kerülendő:** Hétfő reggel, Péntek délután, Hétvégék

---

**Utoljára frissítve:** 2025-11-05
**Verzió:** v1.5 - Newsletter Campaign System
**Készítette:** Claude AI + Eredeti Csakra Dev Team
