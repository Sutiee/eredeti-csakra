# Eredeti Csakra - API Routes Documentation

This document provides comprehensive documentation for the Next.js API routes implemented in Phase 2 of the project.

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Validation](#validation)
6. [Database Integration](#database-integration)
7. [Testing](#testing)

---

## Overview

The Eredeti Csakra application uses Next.js 14 App Router API routes to handle:
- Quiz submission and scoring
- Result retrieval with interpretations
- Data persistence with Supabase PostgreSQL

**Technology Stack:**
- **Framework**: Next.js 14 App Router (serverless functions)
- **Validation**: Zod 3.x
- **Database**: Supabase PostgreSQL
- **TypeScript**: Strict mode with full type safety

---

## API Endpoints

### 1. POST /api/submit-quiz

Submit quiz answers, calculate chakra scores, and save to database.

**File**: `/app/api/submit-quiz/route.ts`

#### Request

```http
POST /api/submit-quiz
Content-Type: application/json
```

**Body**:
```json
{
  "name": "string",              // Required: User's full name (1-100 chars)
  "email": "string",             // Required: Valid email address
  "age": "number",               // Optional: Age (16-99)
  "answers": [1, 2, 3, ..., 4]  // Required: Exactly 28 numbers (1-4 scale)
}
```

**Validation Rules**:
- `name`: Non-empty string, max 100 characters
- `email`: Valid email format
- `age`: Integer between 16-99 (optional)
- `answers`: Array of exactly 28 integers, each between 1-4

#### Response

**Success (201 Created)**:
```json
{
  "data": {
    "id": "uuid",                // Result UUID for retrieval
    "chakra_scores": {
      "Gyökércsakra": 12,
      "Szakrális csakra": 8,
      "Napfonat csakra": 14,
      "Szív csakra": 10,
      "Torok csakra": 15,
      "Harmadik szem": 9,
      "Korona csakra": 13
    }
  },
  "error": null
}
```

**Error Responses**:

*Validation Error (400)*:
```json
{
  "data": null,
  "error": {
    "message": "Érvénytelen adatok",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["answers"],
        "message": "Expected array, received string"
      }
    ]
  }
}
```

*Invalid Answers (400)*:
```json
{
  "data": null,
  "error": {
    "message": "Expected 28 answers, got 25",
    "code": "INVALID_ANSWERS"
  }
}
```

*Database Error (500)*:
```json
{
  "data": null,
  "error": {
    "message": "Hiba történt az adatok mentése során",
    "code": "DATABASE_ERROR",
    "details": "connection refused"
  }
}
```

#### Example Usage

```javascript
const response = await fetch('/api/submit-quiz', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Anna Kovács',
    email: 'anna@example.com',
    age: 35,
    answers: [3, 4, 2, 3, 2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 2, 3, 4, 2, 3, 2, 3, 4]
  })
});

const { data, error } = await response.json();

if (error) {
  console.error('Submission failed:', error.message);
} else {
  console.log('Result ID:', data.id);
  console.log('Scores:', data.chakra_scores);
}
```

---

### 2. GET /api/result/[id]

Fetch quiz result by UUID with full chakra interpretations.

**File**: `/app/api/result/[id]/route.ts`

#### Request

```http
GET /api/result/{uuid}
```

**Path Parameters**:
- `id`: UUID of the quiz result (e.g., `123e4567-e89b-12d3-a456-426614174000`)

#### Response

**Success (200 OK)**:
```json
{
  "data": {
    "id": "uuid",
    "name": "Anna Kovács",
    "email": "anna@example.com",
    "age": 35,
    "answers": [3, 4, 2, 3, ...],
    "chakra_scores": {
      "Gyökércsakra": 12,
      "Szakrális csakra": 8,
      ...
    },
    "interpretations": {
      "Gyökércsakra": {
        "chakra": "Gyökércsakra",
        "score": 12,
        "level": "imbalanced",
        "interpretation": {
          "status": "Kiegyensúlyozatlan",
          "summary": "A stabilitásod ingadozó...",
          "manifestations": [
            "Ingadozó pénzügyi helyzet",
            "Hajlam a halogatásra",
            ...
          ],
          "first_aid_plan": "Fókuszálj a rutinok kialakítására..."
        }
      },
      "Szakrális csakra": { ... },
      ...
    },
    "created_at": "2025-10-14T12:30:00Z"
  },
  "error": null
}
```

**Error Responses**:

*Invalid UUID (400)*:
```json
{
  "data": null,
  "error": {
    "message": "Érvénytelen azonosító formátum",
    "code": "INVALID_UUID",
    "details": [...]
  }
}
```

*Not Found (404)*:
```json
{
  "data": null,
  "error": {
    "message": "Az eredmény nem található",
    "code": "NOT_FOUND"
  }
}
```

*Interpretation Error (500)*:
```json
{
  "data": null,
  "error": {
    "message": "Hiba történt az értelmezés generálása során",
    "code": "INTERPRETATION_ERROR",
    "details": "No interpretation data found for chakra..."
  }
}
```

#### Example Usage

```javascript
const resultId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`/api/result/${resultId}`);

const { data, error } = await response.json();

if (error) {
  console.error('Failed to fetch result:', error.message);
} else {
  console.log('User:', data.name);
  console.log('Scores:', data.chakra_scores);
  console.log('Interpretations:', data.interpretations);
}
```

---

## Request/Response Formats

### Standard Response Structure

All API responses follow this consistent format:

```typescript
interface APIResponse<T> {
  data: T | null;
  error: APIError['error'] | null;
}

interface APIError {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
```

**Rules**:
- On success: `data` contains the response, `error` is `null`
- On error: `data` is `null`, `error` contains error details
- Never both `data` and `error` are non-null

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Validation error or malformed request |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error (database, scoring, etc.) |

---

## Error Handling

### Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `VALIDATION_ERROR` | Zod validation failed | 400 |
| `INVALID_ANSWERS` | Answers array validation failed | 400 |
| `INVALID_UUID` | UUID format validation failed | 400 |
| `NOT_FOUND` | Result not found in database | 404 |
| `SCORING_ERROR` | Chakra score calculation failed | 500 |
| `DATABASE_ERROR` | Supabase database operation failed | 500 |
| `INTERPRETATION_ERROR` | Failed to generate interpretations | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Error Response Examples

**Client Errors (4xx)**:
```json
{
  "data": null,
  "error": {
    "message": "Human-readable error message in Hungarian",
    "code": "ERROR_CODE",
    "details": { /* Additional context */ }
  }
}
```

**Server Errors (5xx)**:
```json
{
  "data": null,
  "error": {
    "message": "Váratlan hiba történt",
    "code": "INTERNAL_ERROR",
    "details": "Error stack trace or message"
  }
}
```

### Error Handling Best Practices

1. **Always check the `error` field first**:
```javascript
const { data, error } = await response.json();
if (error) {
  // Handle error
  console.error(error.message);
  return;
}
// Use data
console.log(data);
```

2. **Display user-friendly messages**:
```javascript
if (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      showToast('Kérjük, ellenőrizd a megadott adatokat.');
      break;
    case 'NOT_FOUND':
      showToast('Az eredmény nem található.');
      break;
    default:
      showToast('Hiba történt. Kérjük, próbáld újra később.');
  }
}
```

3. **Log detailed errors for debugging**:
```javascript
if (error) {
  console.error('API Error:', {
    code: error.code,
    message: error.message,
    details: error.details,
  });
}
```

---

## Validation

### Zod Schemas

**Quiz Submission Schema**:
```typescript
const QuizSubmissionSchema = z.object({
  name: z.string().min(1, 'Név megadása kötelező').max(100, 'A név maximum 100 karakter lehet'),
  email: z.string().email('Érvényes email cím megadása kötelező'),
  age: z.number().int().min(16, 'Minimum 16 éves korhatár').max(99, 'Maximum 99 év lehet').optional(),
  answers: z
    .array(z.number().int().min(1).max(4))
    .length(28, 'Pontosan 28 válasz szükséges (7 csakra × 4 kérdés)'),
});
```

**UUID Schema**:
```typescript
const UUIDSchema = z.string().uuid('Érvénytelen UUID formátum');
```

### Custom Validation

Additional validation beyond Zod:

**Answers Array Validation** (`lib/quiz/scoring.ts`):
```typescript
export function validateQuizAnswers(answers: unknown): answers is QuizAnswers {
  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }
  if (answers.length !== 28) {
    throw new Error(`Expected 28 answers, got ${answers.length}`);
  }
  const invalidAnswers = answers.filter(
    (answer) => typeof answer !== 'number' || answer < 1 || answer > 4
  );
  if (invalidAnswers.length > 0) {
    throw new Error('All answers must be numbers between 1 and 4');
  }
  return true;
}
```

---

## Database Integration

### Supabase Configuration

**Client Setup** (`lib/supabase/client.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
```

### Database Schema

**Table: `quiz_results`**

```sql
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  answers JSONB NOT NULL,           -- Array of 28 numbers (1-4)
  chakra_scores JSONB NOT NULL,     -- Object with chakra names and scores
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX quiz_results_email_idx ON quiz_results(email);
CREATE INDEX quiz_results_created_at_idx ON quiz_results(created_at DESC);
```

### Database Operations

**Insert Result**:
```typescript
const { data, error } = await supabase
  .from('quiz_results')
  .insert({
    name,
    email,
    age: age || null,
    answers,
    chakra_scores: chakraScores,
  })
  .select('id, chakra_scores')
  .single();
```

**Fetch Result by ID**:
```typescript
const { data, error } = await supabase
  .from('quiz_results')
  .select('*')
  .eq('id', id)
  .single();
```

---

## Testing

### Manual Testing with cURL

**Submit Quiz**:
```bash
curl -X POST http://localhost:3000/api/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "age": 30,
    "answers": [3,4,2,3,2,3,4,2,3,2,4,3,2,3,4,2,3,4,2,3,2,3,4,2,3,2,3,4]
  }'
```

**Fetch Result**:
```bash
curl http://localhost:3000/api/result/{uuid}
```

### Testing Checklist

#### POST /api/submit-quiz
- [ ] Valid submission with all fields
- [ ] Valid submission without optional age
- [ ] Invalid email format
- [ ] Name too long (>100 chars)
- [ ] Age out of range (<16 or >99)
- [ ] Answers array with wrong length (!= 28)
- [ ] Answers with invalid values (<1 or >4)
- [ ] Missing required fields
- [ ] Database connection error handling

#### GET /api/result/[id]
- [ ] Valid UUID returns correct result
- [ ] Invalid UUID format (400 error)
- [ ] Non-existent UUID (404 error)
- [ ] Interpretations are correctly generated
- [ ] All 7 chakras have interpretations
- [ ] Database connection error handling

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Quiz Logic

### Scoring Algorithm

**Formula**:
- Each chakra: 4 questions × (1-4 points) = **4-16 points**
- Total: 28 questions across 7 chakras

**Score Ranges**:
- **4-7 points**: Erősen blokkolt (Blocked)
- **8-12 points**: Kiegyensúlyozatlan (Imbalanced)
- **13-16 points**: Egészséges és kiegyensúlyozott (Balanced)

**Implementation** (`lib/quiz/scoring.ts`):
```typescript
export function calculateChakraScores(answers: QuizAnswers | number[]): ChakraScores {
  // Validate 28 answers
  // Calculate score for each chakra (sum of 4 answers)
  // Return ChakraScores object
}

export function getInterpretationLevel(score: number): InterpretationLevel {
  if (score >= 4 && score <= 7) return 'blocked';
  else if (score >= 8 && score <= 12) return 'imbalanced';
  else if (score >= 13 && score <= 16) return 'balanced';
}
```

### Interpretations

**Data Source**: `/lib/quiz/interpretations.ts` (embedded from `/docs/result.md`)

**Structure**:
```typescript
{
  "Gyökércsakra": {
    "title": "...",
    "4-7": { status, summary, manifestations[], first_aid_plan },
    "8-12": { ... },
    "13-16": { ... }
  },
  // ... 6 more chakras
}
```

**Generation** (`lib/quiz/interpretations.ts`):
```typescript
export function getInterpretationsSummary(scores: ChakraScores): Record<string, ChakraScore> {
  // For each chakra:
  // 1. Get score
  // 2. Determine range (4-7, 8-12, 13-16)
  // 3. Fetch interpretation data
  // 4. Return ChakraScore object
}
```

---

## Next Steps

1. **Frontend Integration**: Connect quiz UI to `/api/submit-quiz`
2. **Result Page**: Fetch and display interpretations from `/api/result/[id]`
3. **Error Handling**: Implement toast notifications for API errors
4. **Loading States**: Add spinners during API calls
5. **Email Notifications**: (Future) Send results via email
6. **Analytics**: (Future) Track quiz completion rates

---

## File Structure

```
app/
├── api/
│   ├── submit-quiz/
│   │   └── route.ts          # POST endpoint for quiz submission
│   └── result/
│       └── [id]/
│           └── route.ts      # GET endpoint for result retrieval

lib/
├── supabase/
│   ├── client.ts             # Supabase client configuration
│   └── types.ts              # Database TypeScript types
└── quiz/
    ├── chakras.ts            # Chakra metadata and constants
    ├── scoring.ts            # Scoring algorithm
    └── interpretations.ts    # Interpretation generator

types/
└── index.ts                  # Global TypeScript types
```

---

## Contact & Support

For questions or issues related to the API routes:
- Check error logs in the browser console
- Review Supabase dashboard for database errors
- Consult `/docs/fejlesztesi-terv.md` for project roadmap

---

*Last updated: 2025-10-14 | Phase 2 - API Routes Design ✅ COMPLETE*
