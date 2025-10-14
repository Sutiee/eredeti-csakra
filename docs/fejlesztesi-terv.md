# Eredeti Csakra - Fejlesztési Terv

## Projekt Áttekintés

### Cél
Egy modern, 35+ éves női közönségnek szóló csakra elemző webapp, amely:
- **Landing oldal**: Hiteles, spirituális hangvétel, konverziós fókusz
- **Quiz**: 28 kérdés a 7 csakráról (questions.md alapján)
- **Eredmény oldal**: Személyre szabott csakra elemzés vizualizációval

### Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (spirituális design: lila-rózsaszín-arany paletta)
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Animációk**: Framer Motion

---

## Fejlesztési Fázisok

### ✅ FÁZIS 0: Projekt Setup
**Státusz**: Előkészítés

**Lépések**:
1. Next.js 14 projekt inicializálás TypeScript-tel
2. Tailwind CSS konfiguráció (spirituális színpaletta)
3. Framer Motion telepítés
4. Supabase projekt setup (MCP használatával)
5. Alapvető folder struktúra létrehozása
6. Environment variables beállítása

**Deliverable**: Működő Next.js app, üres landing oldallal

**Tesztelés**: `npm run dev` fut hiba nélkül, localhost:3000 betöltődik

---

### 🎨 FÁZIS 1: Landing Oldal (35+ női közönség, spirituális)

**Cél**: Hiteles, esztétikus landing oldal, ami konvertál

#### 1.1 Design System & Layout
- Tailwind config: színpaletta, tipográfia, spacing
- Custom gradient utility-k (lila-rózsaszín-arany)
- Alap layout komponens (header, footer, navigation)

#### 1.2 Hero Section
- **Headline**: "Fedezd fel, mi tartja vissza valódi éneded kibontakozását"
- **Subheadline**: "Ingyenes csakra elemzés 3 perc alatt"
- **Visual**: Lila-rózsaszín gradient háttér, mandala motívum
- **CTA gomb**: "Kezdem az elemzést" → /kviz oldalra navigál

#### 1.3 Problem Section
- **Cím**: "Ismerd fel a jeleket"
- **Tartalom**: 6-8 tünet kártya
  - Érzelmi: "Folyamatos szorongás, félelem"
  - Fizikai: "Krónikus fáradtság, fájdalom"
  - Kapcsolati: "Nehéz mély kapcsolatokat kialakítani"
  - Spirituális: "Elakadtál, céltalan vagy"
  - Pénzügyi: "Állandó hiányérzet"
  - Mentális: "Nehezen koncentrálsz, zavaros gondolatok"

#### 1.4 Solution Section
- **Cím**: "A csakráid térképe megmutatja az utat"
- **3 oszlop**: Felfedezés → Megértés → Gyógyulás
- **Visual preview**: Egyszerűsített emberi sziluett 7 csakra ponttal

#### 1.5 Trust Building Section
- Rövid magyarázat: "Mi az a csakra?" (2-3 bekezdés)
- Spirituális hitelesség: a csakrarendszer hátterének empátikus bemutatása

#### 1.6 Final CTA Section
- **Cím**: "Készen állsz a változásra?"
- **CTA gomb**: "Igen, szeretném tudni!"
- **Háttér**: Átmeneti gradient, nyugtató vizuális

**Deliverable**: Teljesen működő, reszponzív landing oldal

**Tesztelés**:
- ✅ Desktop, tablet, mobile nézet
- ✅ CTA gombok működnek (navigáció)
- ✅ Vizuális konzisztencia
- ✅ Betűtípusok, színek helyesek
- ✅ Animációk (ha vannak) simán futnak

---

### 📝 FÁZIS 2: Supabase Backend Setup

**Cél**: Adatbázis séma és API útvonalak létrehozása

#### 2.1 Database Schema
```sql
create table quiz_results (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  age integer,
  answers jsonb not null,
  chakra_scores jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index quiz_results_email_idx on quiz_results(email);
create index quiz_results_created_at_idx on quiz_results(created_at desc);
```

#### 2.2 TypeScript Types
- Supabase client inicializálás
- Database types generálás
- QuizResult, ChakraScore, UserInfo típusok

#### 2.3 API Routes előkészítés
- `/api/submit-quiz` - Quiz eredmény mentés
- `/api/result/[id]` - Eredmény lekérés ID alapján

**Deliverable**: Működő Supabase kapcsolat, tábla létrehozva

**Tesztelés**:
- ✅ Supabase project létezik
- ✅ Tábla létrejött
- ✅ Environment variables helyesek
- ✅ Supabase client kapcsolódik

---

### 🧩 FÁZIS 3: Quiz Logika Implementálás

**Cél**: questions.md átalakítása használható TypeScript kóddá

#### 3.1 Típusok & Konstansok
```typescript
// lib/quiz/types.ts
interface Question {
  id: string;
  chakra: ChakraType;
  text: string;
  options: QuestionOption[];
}

interface QuestionOption {
  label: string;
  score: number;
}

type ChakraType =
  | 'Gyökércsakra'
  | 'Szakrális csakra'
  | 'Napfonat csakra'
  | 'Szív csakra'
  | 'Torok csakra'
  | 'Harmadik szem'
  | 'Korona csakra';
```

#### 3.2 Questions Data
- `lib/quiz/questions.ts` - questions.md importálása
- 28 kérdés strukturált formában
- Validáció: minden csakrának pontosan 4 kérdése van

#### 3.3 Scoring Algorithm
```typescript
// lib/quiz/scoring.ts
function calculateChakraScores(answers: number[]): ChakraScores {
  // Csakránként 4 kérdés összegzése
  // Gyökércsakra: q1-q4 (összeg: 4-16)
  // Szakrális: q5-q8 (összeg: 4-16)
  // ... stb
}
```

#### 3.4 Interpretation Logic
- `lib/quiz/interpretations.ts` - result.md importálása
- Score alapján megfelelő szöveg kiválasztása:
  - 4-7: Erősen blokkolt
  - 8-12: Kiegyensúlyozatlan
  - 13-16: Egészséges és kiegyensúlyozott

**Deliverable**: Működő quiz logika, unit tesztek (opcionális)

**Tesztelés**:
- ✅ Mock adatokkal scoring működik
- ✅ Minden csakrára jó értelmezés jön vissza
- ✅ Edge case-ek kezelése (hiányzó válasz, stb.)

---

### 🎯 FÁZIS 4: Quiz Oldal UI

**Cél**: Felhasználóbarát, szép quiz felület

#### 4.1 Quiz Container & State Management
- React Hook Form vagy useState
- Multi-step form (7 szakasz)
- Progress tracking (0-100%)

#### 4.2 Progress Bar
- Felül fix position
- Vizuális feedback: "Gyökércsakra (1/7)" → "Korona csakra (7/7)"
- Animált progress fill

#### 4.3 Csakra Szakasz Komponens
- Minden csakrához intro kártya:
  - Csakra neve
  - Rövid leírás (1-2 mondat)
  - Szín vizualizáció
- 4 kérdés megjelenítése
- Radio button választók (1-4 skála)

#### 4.4 Question Option Komponens
- Szép vizuális design (nem natív radio)
- Hover állapot
- Kiválasztott állapot animáció
- Accessible (keyboard navigation)

#### 4.5 User Info Form (Utolsó lépés)
- Név (text input)
- Email (email input, validáció)
- Kor (number input, opcionális)
- Submit gomb: "Eredmény megtekintése"

#### 4.6 Validáció & Error Handling
- Minden kérdésre válaszolni kell
- Email formátum ellenőrzés
- Error üzenetek (szép, empátikus)

**Deliverable**: Teljes quiz flow UI, helyi state-ben

**Tesztelés**:
- ✅ Minden csakra szakasz betöltődik
- ✅ Progress bar frissül
- ✅ Válaszok mentődnek state-be
- ✅ Validáció működik
- ✅ User info form validáció
- ✅ Mobile reszponzivitás
- ✅ Accessibility (keyboard, screen reader)

---

### 🔗 FÁZIS 5: Quiz Submit & API Integration

**Cél**: Quiz eredmények mentése Supabase-be

#### 5.1 API Route: Submit Quiz
```typescript
// app/api/submit-quiz/route.ts
POST /api/submit-quiz
Body: {
  name: string,
  email: string,
  age?: number,
  answers: number[] // [1-4, 1-4, ...] 28 válasz
}

Response: {
  id: string, // UUID
  chakra_scores: { [chakra: string]: number }
}
```

- Pontozási algoritmus futtatása
- Supabase insert
- Error handling (duplicate email, stb.)

#### 5.2 Quiz Form Submit
- Form submit → loading állapot
- API hívás
- Sikeres válasz → redirect `/eredmeny/[id]`
- Hiba esetén → error toast/message

**Deliverable**: Működő end-to-end quiz flow

**Tesztelés**:
- ✅ Quiz kitöltés → submit sikeres
- ✅ Supabase-ben megjelenik az új rekord
- ✅ Redirect működik
- ✅ Loading state látható
- ✅ Error case-ek kezelve

---

### 🎨 FÁZIS 6: Result Oldal - Vizualizáció

**Cél**: Gyönyörű, érthető eredmény megjelenítés

#### 6.1 Result Data Fetching
```typescript
// app/eredmeny/[id]/page.tsx
- URL paraméter alapján ID kiolvasása
- API hívás vagy direct Supabase query
- Loading állapot
- 404 kezelés (nem létező ID)
```

#### 6.2 Hero Section
- **Személyre szólítás**: "Üdv, [Név]! Itt az eredményed"
- Összefoglaló mondat generálása

#### 6.3 Emberi Sziluett Vizualizáció (SVG)
- Női sziluett rajz (egyszerűsített, elegáns)
- 7 csakra pont a helyén:
  1. Gyökércsakra - Farokcsont - Piros
  2. Szakrális - Alhasi régió - Narancs
  3. Napfonat - Gyomor - Sárga
  4. Szív - Szív - Zöld
  5. Torok - Torok - Kék
  6. Harmadik szem - Homlok - Indigó
  7. Korona - Fejtető - Lila/Fehér

- **Vizuális állapot**:
  - Harmonikus (13-16): Teljes fényben, pulzáló
  - Kiegyensúlyozatlan (8-12): Közepesen fényes
  - Blokkolt (4-7): Halvány, gyenge pulzálás

- Hover/tooltip: pontszám megjelenítése
- Framer Motion animációk

#### 6.4 Csakra Részletes Kártyák (7 db)
- Accordion vagy külön szekciók
- Minden kártyán:
  - **Csakra neve + szimbólum**
  - **Pontszám bar** (színezett, animált)
  - **Státusz badge**: "Harmonikus" / "Figyelem" / "Blokkolva"
  - **Értelmezés**: result.md alapján a megfelelő szöveg
    - Summary (1-2 mondat)
    - Manifestations (lista)
    - First Aid Plan (gyakorlati javaslat)

#### 6.5 CTA Section (Későbbi termékre)
- "Szeretnéd megtudni a pontos lépéseket a csakráid feloldásához?"
- Email feliratkozás később (most csak placeholder CTA)

**Deliverable**: Teljes result oldal vizualizációval

**Tesztelés**:
- ✅ ID alapján betöltődik az eredmény
- ✅ Sziluett SVG megjelenik, színek helyesek
- ✅ 7 csakra kártya helyesen jeleníti meg az adatokat
- ✅ Animációk simák
- ✅ Mobile reszponzív
- ✅ 404 kezelés (rossz ID esetén)

---

### 🎨 FÁZIS 7: Design Polish & Animációk

**Cél**: Professzionális UX és spirituális atmoszféra

#### 7.1 Framer Motion Animációk
- Landing oldal: Fade in, parallax scroll
- Quiz: Smooth page transitions
- Result: Staggered card animations, pulzáló csakra pontok

#### 7.2 Loading States
- Landing → Quiz: Route transition
- Quiz submit: Spinner + motiváló üzenet ("Elemzés folyamatban...")
- Result load: Skeleton screen

#### 7.3 Error Handling UI
- Szép error message komponens
- Toast notifications (opcionális)
- 404, 500 error pages

#### 7.4 Responsive Design Finomítás
- Mobile: Stack layout, nagy gombfelületek
- Tablet: Optimalizált grid
- Desktop: Full width hero, 3 column layout

#### 7.5 Accessibility (a11y)
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast ellenőrzés (WCAG AA)

**Deliverable**: Production-ready webapp

**Tesztelés**:
- ✅ Lighthouse audit (Performance, Accessibility, SEO)
- ✅ Cross-browser testing (Chrome, Safari, Firefox)
- ✅ Device testing (iPhone, Android, iPad)
- ✅ Keyboard only navigation
- ✅ Screen reader testing

---

### 🚀 FÁZIS 8: SEO & Deployment

**Cél**: Vercel deploy, SEO optimalizálás

#### 8.1 SEO Meta Tags
- Landing: Title, description, OG tags
- Quiz: noindex (nincs értelme indexelni)
- Result: dynamic OG image generálás (opcionális)

#### 8.2 Environment Setup
- .env.local (development)
- Vercel environment variables (production)
- Supabase production DB

#### 8.3 Vercel Deployment
- GitHub repo push
- Vercel projekt kapcsolás
- Environment variables beállítása
- Deploy & domain setup

#### 8.4 Analytics (Opcionális később)
- Vercel Analytics
- Google Analytics (GA4)
- Conversion tracking

**Deliverable**: Éles webapp live URL-lel

**Tesztelés**:
- ✅ Production URL betöltődik
- ✅ Supabase production connect működik
- ✅ Quiz end-to-end működik live-on
- ✅ SEO meta tagok helyesek
- ✅ Performance megfelelő (Lighthouse > 90)

---

## Fejlesztési Stratégia

### Lépésről Lépésre Haladás
1. **Minden fázis után megállunk**
2. **Tesztelés a fenti checklist alapján**
3. **User approval a továbblépéshez**
4. **Iteráció ha szükséges**

### Git Workflow
- Feature branch minden fázishoz
- Commit után review
- Merge csak approval után

### Kommunikáció
- Minden fázis végén: screenshot / demo
- Kérdések, feedback gyűjtése
- Következő lépés egyeztetése

---

## Dokumentációk

### Már létező:
- ✅ `questions.md` - 28 kérdés definíció
- ✅ `result.md` - Csakra értelmezések

### Létrehozandó:
- `tech-stack.md` - Részletes tech stack dokumentáció
- `api-documentation.md` - API endpointok leírása
- `component-library.md` - UI komponensek (később)
- `deployment-guide.md` - Deployment lépések

---

## Következő Lépés

**Kezdjük a Landing oldallal (FÁZIS 1)!**

Készen állsz elindítani a projektet?
