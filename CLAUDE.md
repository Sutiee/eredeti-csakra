# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Project Overview

**Eredeti Csakra** is a Hungarian-language spiritual wellness web application that helps women (35+) discover and balance their chakras through an interactive quiz experience.

- **Vision:** Provide personalized chakra health assessments with actionable guidance, monetized through digital products (reports, handbooks, meditations)
- **Current Phase:** v1.5 - Monetization & UX Improvements (Live in production)
- **Key Architecture:** Next.js 14 App Router with TypeScript, Supabase backend, Stripe payments, AI-generated content (OpenAI + ElevenLabs)
- **Target Audience:** Hungarian-speaking women aged 35+ interested in spiritual growth and self-awareness

## 2. Project Structure

**⚠️ CRITICAL: AI agents MUST read the [Project Structure documentation](/docs/ai-context/project-structure.md) before attempting any task to understand the complete technology stack, file tree and project organization.**

Eredeti Csakra follows a Next.js App Router architecture with server components, serverless API routes, and a Supabase PostgreSQL backend. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Development Commands

```bash
# Development
npm run dev                          # Start dev server (http://localhost:3000)
npm run build                        # Production build (also runs next-sitemap)
npm start                            # Start production server
npm run lint                         # ESLint check
npm run type-check                   # TypeScript validation (tsc --noEmit)

# Content Generation Scripts (Backend)
npm run generate-meditation-scripts  # Generate meditation text scripts (OpenAI)
npm run generate-meditation-audio    # Generate audio files from scripts (ElevenLabs)

# Utility Scripts
npx tsx scripts/retry-failed-workbooks.ts       # Regenerate failed workbook purchases
npx tsx scripts/investigate-workbook-purchases.ts  # Analyze workbook purchase issues
npx tsx scripts/profile-workbook-generation.ts [result-id]  # Profile workbook generation performance

# Email Testing Scripts
npx tsx scripts/test-email-direct.ts            # Test email templates via Resend API (works without domain verification)
npx tsx scripts/test-email.ts                   # Test full email flow via Next.js API (requires domain verification)
```

## 4. Core Architecture Patterns

### Quiz Flow Architecture
The application follows a multi-step funnel pattern:

1. **Landing Page** (`app/page.tsx`) → Spiritual marketing with problem/solution/CTA
2. **Pre-Quiz Ritual** (`app/kviz/bevezeto/page.tsx`) → Emotional preparation with breathing exercise
3. **28-Question Quiz** (`app/kviz/page.tsx`) → One question per page, chakra-colored backgrounds
4. **Result Page** (`app/eredmeny/[id]/page.tsx`) → SVG body silhouette + 7 detailed chakra cards
5. **Checkout Flow** (`app/checkout/[result-id]/page.tsx`) → Product selection with upsells
6. **Success Page** (`app/success/[result-id]/page.tsx`) → Download links + access tokens

### Scoring System
- **28 questions** = 7 chakras × 4 questions each
- **Scale**: 1-4 (1 = egyáltalán nem, 4 = teljes mértékben)
- **Chakra score range**: 4-16 points per chakra
- **Interpretation levels** (defined in `lib/quiz/interpretations.ts`):
  - 4-7: Erősen blokkolt (Blocked)
  - 8-12: Kiegyensúlyozatlan (Imbalanced)
  - 13-16: Egészséges és kiegyensúlyozott (Balanced)

### API Route Patterns
All API routes follow consistent patterns:
- **Input validation**: Zod schemas or manual checks
- **Error handling**: Try-catch with 500 responses
- **Response format**: `{ data: {...}, error: null }` or `{ data: null, error: {...} }`
- **Supabase integration**: Server-side client for database operations
- **Vercel timeout configuration**: Use `export const maxDuration = 300` for long-running operations (requires Vercel Pro)
- **Background processing**: Use `waitUntil()` API for fire-and-forget tasks in webhook handlers

Key endpoints:
- `POST /api/submit-quiz` - Save quiz results, return chakra scores
- `GET /api/result/[id]` - Fetch result with interpretations
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle payment events (uses waitUntil() for background processing)
- `POST /api/generate-detailed-report-gpt5` - AI Analysis PDF generation (includes email notification)
- `POST /api/generate-workbook` - 30-Day Workbook generation (maxDuration=300 for 232s processing, includes email notification)
- `POST /api/generate-meditation-audio` - ElevenLabs audio synthesis
- `POST /api/send-purchase-email` - Resend email notification (product-specific templates)

### Monetization System
**Products** (defined in `lib/stripe/products.ts`):
1. **Személyre Szabott Csakra Elsősegély Csomag** - 2,990 Ft (PDF report)
2. **Csakra Kézikönyv** - 1,990 Ft (80+ page handbook)
3. **Csakra Aktivizáló Meditációk** - 3,990 Ft (7 audio meditations)
4. **Teljes Csakra Harmónia Csomag** - 6,990 Ft (bundle with 22% discount)

**Payment Flow**:
1. User completes quiz → redirected to checkout
2. Stripe Checkout Session created with metadata (result_id, email)
3. Webhook receives `checkout.session.completed` event
4. Purchase record created in `purchases` table
5. PDF generation triggered in background (waitUntil API)
   - AI Analysis PDF: ~60-90 seconds
   - 30-Day Workbook: ~232 seconds (~4 minutes)
6. PDF uploaded to Supabase Storage
7. Purchase record updated with `pdf_url`
8. **Email notification sent (Resend)** with download link
9. Meditation access tokens created if applicable

**Email Notification System**:
- Resend API integration for product delivery emails
- Product-specific templates (AI Analysis PDF vs Workbook)
- Emails sent immediately after PDF upload completes
- Non-blocking: Email failures don't affect product generation
- Test domain: `onboarding@resend.dev` (production requires `eredeticsakra.hu` domain verification)

### Content Generation Architecture
**AI-Generated Content**:
- **Detailed Reports**: OpenAI GPT-4o-mini generates personalized chakra analysis
- **Meditation Audio**: ElevenLabs generates Hungarian voice audio from scripts
- **Scripts**: Stored in `data/meditation-scripts.ts` (7 meditations, 15-20 min each)

## 5. TypeScript & Type Safety

### Strict TypeScript Rules
- **Always run `npm run type-check`** after making changes
- All functions must have explicit return types
- Props must be typed with interfaces or types
- Avoid `any` - use `unknown` and type guards instead
- Use discriminated unions for complex state

### Key Type Definitions
Located in `/types/index.ts`:
- `QuizAnswers` - Array of 28 numbers (1-4)
- `ChakraScores` - Object mapping chakra names to scores
- `ChakraName` - Union of 7 chakra Hungarian names
- `InterpretationLevel` - 'blocked' | 'imbalanced' | 'balanced'
- `Product` - Stripe product metadata
- `ProductId` - Union of 4 product IDs

### Next.js Specific Patterns
- **Server Components by default** - Use `"use client"` only when needed (state, effects, browser APIs)
- **Server Actions** - NOT used in this project (API routes preferred)
- **Metadata API** - Used in layouts for SEO (viewport, description, OG images)
- **Dynamic Routes** - Use `[param]` folders with typed `params` objects

## 6. Styling & Design System

### Tailwind Configuration
**Spiritual Color Palette** (`tailwind.config.ts`):
- `spiritual.purple.*` - Primary brand color (lila)
- `spiritual.rose.*` - Secondary accent (rózsaszín)
- `spiritual.gold.*` - Highlight accent (arany)
- `chakra.root` through `chakra.crown` - 7 chakra-specific colors

**Custom Animations**:
- `animate-pulse-slow` - Slow pulsing for chakra points
- `animate-float` - Floating motion for decorative elements
- `animate-breathe` - Breathing effect (scale + opacity)
- `animate-chakra-pulse` - Pulsing glow effect
- `animate-energy-flow` - Upward flowing particles

**Background Gradients**:
- `bg-gradient-spiritual` - Purple gradient (primary)
- `bg-gradient-rose-gold` - Rose-gold gradient
- `bg-gradient-mystical` - Soft mystical gradient

### Typography
- **Headings**: `font-serif` (Playfair Display) - Elegant, spiritual
- **Body**: `font-sans` (Inter) - Modern, readable
- Fonts loaded via `app/fonts.ts` using `next/font/google`

### Component Patterns
- **Card Backgrounds**: Glass morphism (`backdrop-blur-sm`, `bg-white/10`)
- **Hover States**: Smooth transitions with `transition-all duration-300`
- **Chakra-Colored Sections**: Dynamic background colors per chakra
- **Framer Motion**: Used for page transitions, scroll animations, entrance effects

## 7. Database Schema (Supabase)

### Tables
**quiz_results** - Stores completed quiz data
- `id` (UUID) - Primary key
- `name`, `email`, `age` - User info
- `answers` (JSONB) - Array of 28 scores
- `chakra_scores` (JSONB) - Calculated scores per chakra
- `created_at`, `updated_at` - Timestamps

**purchases** - E-commerce transactions
- `id` (UUID) - Primary key
- `result_id` (FK) - Links to quiz result
- `email`, `product_id`, `amount`, `currency`
- `stripe_session_id`, `stripe_payment_intent_id`
- `status` - 'pending' | 'completed' | 'failed'
- `pdf_url` - Supabase Storage URL

**meditation_access** - Token-based meditation access
- `id` (UUID) - Primary key
- `purchase_id` (FK) - Links to purchase
- `email`, `access_token` (unique)
- `expires_at` - Expiration timestamp

### Row Level Security (RLS)
- **quiz_results**: Public read/write (no auth required)
- **purchases**: Secured by server-side API only
- **meditation_access**: Token-based validation in API routes

## 8. Environment Variables

Required in `.env.local`:
```bash
# Supabase (Backend)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Stripe (Payments - LIVE keys)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# OpenAI (AI Report Generation)
OPENAI_API_KEY=sk-proj-xxx
OPENAI_MODEL=gpt-4o-mini

# Resend (Email Delivery)
RESEND_API_KEY=re_xxx                           # API key from Resend Dashboard
RESEND_AUDIENCE_ID=xxx                          # Optional: for contact management
RESEND_FROM_EMAIL=info@eredeticsakra.hu        # Verified sender email (domain must be verified for production)

# ElevenLabs (AI Voice Synthesis)
ELEVENLABS_API_KEY=xxx
ELEVENLABS_VOICE_ID=xxx  # Hungarian female voice

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://eredeticsakra.hu
```

## 9. Coding Standards

### Component Organization
- **Client Components**: Mark with `"use client"` at top
- **Component Files**: PascalCase (e.g., `ChakraSilhouette.tsx`)
- **Props Types**: Define as `type ComponentNameProps = {...}` above component
- **Conditional Rendering**: Use early returns for loading/error states
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`)

### Business Logic Separation
- **lib/** - Pure functions, no UI dependencies
- **components/** - UI only, import from lib/ for logic
- **app/api/** - Server-side logic, database operations
- **data/** - Static content (products, testimonials, meditations)

### Error Handling Patterns
```typescript
// API Routes
try {
  // ... operation
  return NextResponse.json({ data: result, error: null });
} catch (error) {
  console.error('[API_ROUTE_NAME] Error:', error);
  return NextResponse.json(
    { data: null, error: { message: 'Error description' } },
    { status: 500 }
  );
}

// Client Components
const [error, setError] = useState<string | null>(null);
// ... show error in UI with conditional rendering
```

### Quiz Logic Rules
- **Question Order**: NEVER shuffle - chakra order is sacred (root → crown)
- **Score Calculation**: Use functions from `lib/quiz/scoring.ts`
- **Interpretations**: Fetch from `lib/quiz/interpretations.ts` based on score ranges
- **Validation**: All 28 questions must be answered before submission

## 10. Testing & Quality Assurance

### Pre-Deployment Checklist
1. **Type Check**: `npm run type-check` (must pass with 0 errors)
2. **Linting**: `npm run lint` (fix all issues)
3. **Build**: `npm run build` (must succeed)
4. **Manual Testing Flow**:
   - Landing → Pre-Quiz → Complete all 28 questions → Result page
   - Result → Checkout → Test Stripe payment (use test card)
   - Verify email delivery (check Resend logs)
   - Test PDF download links

### Common Issues
- **Build Errors**: Usually missing `export default` or async/await in Server Components
- **Hydration Errors**: Client/Server state mismatch - check `"use client"` placement
- **Stripe Webhook Failures**: Verify webhook secret in `.env.local`
- **Supabase Errors**: Check RLS policies and connection credentials
- **Vercel Function Timeouts**: For long-running operations (>60s), add `export const maxDuration = 300` (requires Vercel Pro plan)
- **Background Task Interruption**: Use `waitUntil()` API in webhooks to prevent premature termination of async operations

## 11. Deployment (Vercel)

### Deployment Process
1. Push to `main` branch on GitHub
2. Vercel auto-deploys (connected to repository)
3. Verify environment variables in Vercel dashboard
4. Check build logs for errors
5. Test production site thoroughly

### Post-Deployment Verification
- Test complete quiz flow end-to-end
- Verify Stripe webhook endpoint (check Vercel function logs)
- Test email delivery
- Verify Supabase Storage access (PDFs, meditation audio)
- Monitor workbook generation completion (check for 232s processing time in logs)
- Verify Vercel Pro plan is active (required for maxDuration=300)

## 12. Content & Translation

### Language Requirements
- **All UI text**: Hungarian only
- **Tone**: Empátikus, meleg, spirituális (empathetic, warm, spiritual)
- **Target Audience**: Tegeződés (informal "you") for 35+ women
- **Copywriting Style**: Solution-focused, non-judgmental, nurturing

### Spiritual Terminology
Use consistent Hungarian terms:
- Gyökércsakra (Root Chakra)
- Szakrális csakra (Sacral Chakra)
- Napfonat csakra (Solar Plexus)
- Szív csakra (Heart Chakra)
- Torok csakra (Throat Chakra)
- Harmadik szem (Third Eye)
- Korona csakra (Crown Chakra)

## 13. Security Considerations

### Sensitive Data Handling
- **Never log**: User emails, answers, payment details
- **Sanitize inputs**: Validate all user inputs before database insertion
- **API Keys**: Never expose in client-side code (use server-side only)
- **Stripe Keys**: Use publishable key in client, secret key only in API routes/webhooks

### Supabase Security
- **RLS Policies**: Properly configured for public quiz access
- **Storage Buckets**: Use private buckets for user-generated content
- **API Keys**: Use anon key for public operations only

## 14. AI Integration Patterns

### OpenAI Report Generation
- **Model**: GPT-4o-mini (cost-effective, fast)
- **Prompt Engineering**: Structured prompts in `lib/openai/report-generator.ts`
- **Content**: Personalized based on chakra scores and interpretation levels
- **Output**: Markdown format converted to HTML/PDF

### ElevenLabs Audio Synthesis
- **Voice ID**: Hungarian female voice (configured in env)
- **Input**: Pre-written meditation scripts from `data/meditation-scripts.ts`
- **Output**: MP3 files uploaded to Supabase Storage
- **Access**: Token-based URLs with expiration

## 15. Known Limitations & Future Considerations

### Current Limitations
- No user authentication (email-based identification only)
- No admin dashboard (database management via Supabase UI)
- Single language support (Hungarian only)
- No A/B testing framework

### Future Enhancements (Not Yet Implemented)
- User accounts with login/dashboard
- Retake quiz feature with history tracking
- Mobile app (React Native)
- Additional languages (English, German)
- Subscription model for ongoing content

---

**Last Updated**: 2025-10-15 | **Version**: v1.5 (Monetization & UX Complete)

For detailed development history and phase breakdowns, see [docs/v1.5-DEVELOPMENT-PLAN.md](docs/v1.5-DEVELOPMENT-PLAN.md).
