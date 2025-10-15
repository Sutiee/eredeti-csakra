# Eredeti Csakra - Project Structure

This document provides the complete technology stack and file tree structure for the Eredeti Csakra project. **AI agents MUST read this file to understand the project organization before making any changes.**

## Technology Stack

### Frontend Technologies
- **Next.js 14.2.18** - React framework with App Router and Server Components
- **React 18.3.1** - UI library
- **TypeScript 5.x** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework with custom spirituális színpaletta
- **Framer Motion 11.11.11** - Animation library for smooth transitions and chakra visualizations
- **npm** - Package manager

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database, authentication, real-time)
- **@supabase/supabase-js 2.45.4** - Supabase JavaScript client
- **Next.js API Routes** - Serverless API endpoints

### Development & Quality Tools
- **ESLint 8.x** - Code linting with Next.js config
- **PostCSS 8.x** - CSS processing
- **Autoprefixer 10.x** - CSS vendor prefixes
- **TypeScript strict mode** - Type checking

### Deployment & Hosting
- **Vercel** - Next.js deployment platform (planned)
- **Supabase Cloud** - Database and backend hosting

### Future Technologies
- **Email Service** - Transactional emails (Resend / SendGrid)
- **Analytics** - Vercel Analytics / Google Analytics
- **Payment Processing** - Stripe (for future paid products)

## Complete Project Structure

```
eredeti-csakra/
├── README.md                           # Project overview and setup (TODO)
├── CLAUDE.md                           # Master AI context file
├── package.json                        # npm dependencies and scripts
├── package-lock.json                   # npm lockfile
├── .gitignore                          # Git ignore patterns
├── .env.example                        # Environment variables template
├── .env.local                          # Local environment variables (git ignored)
├── tsconfig.json                       # TypeScript configuration
├── next.config.js                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS with spirituális színpaletta
├── postcss.config.js                   # PostCSS configuration
├── .vscode/                            # VSCode workspace configuration
│   └── settings.json
├── .claude/                            # Claude Code configuration
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # Root layout (metadata, fonts, global structure)
│   ├── page.tsx                        # Landing page (/)
│   ├── globals.css                     # Global styles + Tailwind imports
│   ├── kviz/                           # Quiz page (/kviz)
│   │   └── page.tsx                    # 28 kérdéses quiz UI
│   ├── eredmeny/                       # Result pages (/eredmeny)
│   │   └── [id]/
│   │       └── page.tsx                # Dynamic result page by UUID
│   └── api/                            # Next.js API Routes (serverless)
│       ├── submit-quiz/
│       │   └── route.ts                # POST: Submit quiz, calculate scores, save to DB
│       └── result/
│           └── [id]/
│               └── route.ts            # GET: Fetch result by UUID
│
├── components/                         # React komponensek
│   ├── landing/                        # Landing oldal komponensek
│   │   ├── Hero.tsx                    # Hero section (headline, CTA)
│   │   ├── ProblemSection.tsx          # Tünetek kártyák (érzelmi, fizikai, stb.)
│   │   ├── SolutionSection.tsx         # 3 oszlop: Felfedezés → Megértés → Gyógyulás
│   │   ├── TrustSection.tsx            # "Mi az a csakra?" magyarázat
│   │   └── CTASection.tsx              # Final CTA
│   ├── quiz/                           # Quiz komponensek
│   │   ├── QuizContainer.tsx           # Quiz orchestrator (state management)
│   │   ├── ProgressBar.tsx             # Animated progress bar (1/7 → 7/7)
│   │   ├── ChakraSection.tsx           # 1 csakra intro + 4 kérdés
│   │   ├── QuestionSlider.tsx          # Radio button (1-4 skála)
│   │   └── UserInfoForm.tsx            # Név, email, kor form (utolsó lépés)
│   ├── result/                         # Result oldal komponensek
│   │   ├── BodySilhouette.tsx          # SVG női sziluett + 7 csakra pont
│   │   ├── ChakraPoint.tsx             # Animált csakra pont (pulzálás, színkód)
│   │   ├── ChakraDetailCard.tsx        # 1 csakra részletes kártya (score, értelmezés)
│   │   └── ResultSummary.tsx           # Összefoglaló szöveg
│   └── ui/                             # Reusable UI komponensek
│       ├── Button.tsx                  # Spirituális styled button
│       ├── Card.tsx                    # Card wrapper
│       ├── Slider.tsx                  # Custom slider (quiz kérdésekhez)
│       └── Input.tsx                   # Form input komponens
│
├── lib/                                # Business logic & utilities
│   ├── supabase/
│   │   ├── client.ts                   # Supabase client inicializálás
│   │   └── types.ts                    # Database TypeScript types
│   ├── quiz/
│   │   ├── questions.ts                # 28 kérdés struktúrált formában (questions.md alapján)
│   │   ├── chakras.ts                  # 7 csakra metadata (név, szín, hely, leírás)
│   │   ├── scoring.ts                  # Pontozási algoritmus (calculateChakraScores)
│   │   └── interpretations.ts          # result.md alapján értelmezések generálása
│   └── utils.ts                        # Helper functions (formatDate, cn(), stb.)
│
├── types/                              # TypeScript type definitions
│   └── index.ts                        # Global types (Question, Chakra, QuizResult, stb.)
│
├── config/                             # Configuration files
│   └── chakra-colors.ts                # Csakra színek konstansok
│
├── public/                             # Static assets
│   └── images/                         # Csakra képek, iconok, mandalák, logo
│
├── docs/                               # Dokumentáció
│   ├── ai-context/                     # AI-specific documentation
│   │   ├── project-structure.md        # This file (tech stack + file tree)
│   │   ├── docs-overview.md            # Documentation architecture
│   │   ├── system-integration.md       # Integration patterns
│   │   ├── deployment-infrastructure.md # Infrastructure docs
│   │   └── handoff.md                  # Task management
│   ├── fejlesztesi-terv.md             # Fejlesztési roadmap (8 fázis)
│   ├── questions.md                    # 28 quiz kérdés definíció (7 csakra × 4)
│   └── result.md                       # Csakra értelmezések (3 állapot/csakra)
│
├── logs/                               # Log files (git ignored)
└── node_modules/                       # npm dependencies (git ignored)
```

## Key Directories Explained

### `/app` - Next.js App Router
- **Server Components by default** - Használd `"use client"` direktívát ahol szükséges
- **File-based routing** - page.tsx fájlok automatikusan útvonalak
- **API Routes** - Serverless functions a `/app/api` mappában

### `/components` - Reusable React Components
- **Funkció alapján csoportosítva**: landing, quiz, result, ui
- **Naming convention**: PascalCase (Hero.tsx, BodySilhouette.tsx)
- **Props typed** - Minden komponens strict TypeScript

### `/lib` - Business Logic
- **Pure functions** - Ne legyen UI logic
- **Supabase integration** - Client setup + types
- **Quiz logic** - Questions, scoring, interpretations

### `/docs` - Documentation
- **AI context** - Az AI agent-ek ezt olvassák először
- **Content files** - questions.md, result.md (quiz tartalom)
- **Development plan** - fejlesztesi-terv.md (8 fázis roadmap)

## Tailwind CSS Configuration

### Spirituális Színpaletta (35+ női közönségnek)

```typescript
// tailwind.config.ts
colors: {
  spiritual: {
    purple: { 50-900 },  // Lila árnyalatok
    rose: { 50-900 },    // Rózsaszín árnyalatok
    gold: { 50-900 },    // Arany árnyalatok
  },
  chakra: {
    root: '#DC143C',     // Gyökércsakra - Piros
    sacral: '#FF8C00',   // Szakrális - Narancs
    solar: '#FFD700',    // Napfonat - Arany/Sárga
    heart: '#32CD32',    // Szív - Zöld
    throat: '#4169E1',   // Torok - Kék
    third: '#9370DB',    // Harmadik szem - Indigó
    crown: '#9400D3',    // Korona - Lila
  },
}

backgroundImage: {
  'gradient-spiritual': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-rose-gold': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'gradient-purple-pink': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'gradient-mystical': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
}
```

### Tipográfia
- **Headings**: `font-serif` (Playfair Display) - Elegáns, spirituális
- **Body**: `font-sans` (Inter) - Modern, olvasható

### Animációk
- `animate-pulse-slow` - Lassú pulzálás (csakra pontokhoz)
- `animate-float` - Lebegő mozgás (dekoratív elemekhez)

## Database Schema (Supabase PostgreSQL)

```sql
create table quiz_results (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  age integer,
  answers jsonb not null,           -- [1, 2, 3, 4, ...] 28 válasz (1-4 skála)
  chakra_scores jsonb not null,     -- { gyökércsakra: 12, szakrális_csakra: 8, ... }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index quiz_results_email_idx on quiz_results(email);
create index quiz_results_created_at_idx on quiz_results(created_at desc);
```

## Quiz Logic

### Kérdés Struktúra
- **28 kérdés** = 7 csakra × 4 kérdés
- **Skála**: 1-4 (1 = egyáltalán nem, 4 = teljes mértékben)
- **Forrás**: `docs/questions.md`

### Pontozási Algoritmus
```typescript
// lib/quiz/scoring.ts
Gyökércsakra: q1 + q2 + q3 + q4 = 4-16 pont
Szakrális: q5 + q6 + q7 + q8 = 4-16 pont
... (7 csakra összesen)

// Értelmezés (lib/quiz/interpretations.ts):
4-7:   Erősen blokkolt (result.md "blocked" szekció)
8-12:  Kiegyensúlyozatlan (result.md "imbalanced" szekció)
13-16: Egészséges és kiegyensúlyozott (result.md "balanced" szekció)
```

## API Endpoints

### POST `/api/submit-quiz`
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "age": "number (optional)",
  "answers": [1, 2, 3, 4, ...] // 28 válasz (1-4)
}
```

**Response:**
```json
{
  "id": "uuid",
  "chakra_scores": {
    "gyökércsakra": 12,
    "szakrális_csakra": 8,
    "napfonat_csakra": 14,
    "szív_csakra": 10,
    "torok_csakra": 15,
    "harmadik_szem": 9,
    "korona_csakra": 13
  }
}
```

### GET `/api/result/[id]`
**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "age": "number",
  "answers": [1, 2, 3, ...],
  "chakra_scores": {...},
  "interpretations": {
    "gyökércsakra": {
      "score": 12,
      "status": "kiegyensúlyozatlan",
      "summary": "...",
      "manifestations": [...],
      "first_aid": "..."
    }
  },
  "created_at": "timestamp"
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Deployment Strategy

### Vercel (Frontend + API Routes)
1. GitHub repo push
2. Vercel projekt import
3. Environment variables beállítása (Supabase credentials)
4. Auto-deploy from `main` branch

### Supabase (Database)
- Cloud-hosted PostgreSQL
- Automatic backups
- Row Level Security (RLS) később

## Project Status

**Current Phase**: ✅ FÁZIS 0 - Projekt Setup (Completed)

**Next Phase**: 🎨 FÁZIS 1 - Landing Oldal fejlesztés

See [fejlesztesi-terv.md](../fejlesztesi-terv.md) for full roadmap (8 phases).

---

*Last updated: 2025-10-14 | This is a living document - update as project evolves.*