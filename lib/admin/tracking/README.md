# Event Tracking System - Usage Guide

This directory contains the complete event tracking infrastructure for the Eredeti Csakra admin system.

## Overview

The event tracking system consists of:

1. **Client-side tracking** (`client.ts`) - React hook for tracking user interactions in the browser
2. **Server-side logging** (`server.ts`) - Utility for logging backend events
3. **API endpoint** (`/app/api/admin/events/route.ts`) - Receives and stores events from the client
4. **TypeScript types** (`/types/admin.ts`) - Type definitions for all analytics-related data

## Client-Side Tracking

### Basic Usage

```tsx
'use client';

import { useAnalytics } from '@/lib/admin/tracking/client';

function QuizPage() {
  const { trackEvent } = useAnalytics();

  const handleStartQuiz = () => {
    // Track quiz start
    trackEvent('quiz_start', { source: 'landing_cta' });

    // Your quiz logic...
  };

  const handleAnswerChange = (questionIndex: number, value: number) => {
    // Track answer selection
    trackEvent('quiz_question_answered', {
      question_index: questionIndex,
      answer_value: value,
    });

    // Update state...
  };

  return (
    <div>
      <button onClick={handleStartQuiz}>Start Quiz</button>
    </div>
  );
}
```

### Track Page Views

```tsx
'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/admin/tracking/client';

export default function LandingPage() {
  useEffect(() => {
    // Track page view on mount
    trackPageView('Landing Page');
  }, []);

  return <div>Welcome!</div>;
}
```

### Track with Result ID

```tsx
const { trackEvent } = useAnalytics();

// Track checkout view with result ID
trackEvent('checkout_view', { product_count: 3 }, resultId);
```

## Server-Side Tracking

### In API Routes

```ts
import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/admin/tracking/server';

export async function POST(request: NextRequest) {
  // Your API logic...
  const result = await processQuiz(data);

  // Log the event
  await logEvent(
    'quiz_submitted',
    {
      question_count: 28,
      completion_time: 180,
    },
    {
      sessionId: 'session_123',
      resultId: result.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    }
  );

  return NextResponse.json({ data: result });
}
```

### Log System Events

```ts
import { logSystemEvent } from '@/lib/admin/tracking/server';

// After sending email
await logSystemEvent('email_sent', {
  email_type: 'quiz_result',
  recipient: email,
  template: 'result_pdf',
});

// After PDF generation
await logSystemEvent('pdf_generated', {
  result_id: resultId,
  file_size: pdfBuffer.length,
  generation_time: Date.now() - startTime,
});
```

### Batch Event Logging

```ts
import { logEventsBatch } from '@/lib/admin/tracking/server';

await logEventsBatch([
  {
    eventName: 'stripe_checkout_created',
    eventData: { product_ids: ['pdf', 'meditations'], amount: 15990 },
    context: { resultId, sessionId },
  },
  {
    eventName: 'checkout_started',
    eventData: { bundle_selected: true },
    context: { resultId, sessionId },
  },
]);
```

## Event Naming Convention

Follow this naming pattern for consistency:

### Page Events
- `page_view` - Generic page view
- `landing_view` - Landing page specific
- `result_view` - Result page view
- `checkout_view` - Checkout page view

### Quiz Events
- `quiz_start` - User starts quiz
- `quiz_question_answered` - Answer selected
- `quiz_progress` - Progress to next question
- `testimonial_view` - Testimonial break shown
- `quiz_complete` - All questions answered
- `quiz_submitted` - Quiz data submitted to API

### Checkout Events
- `product_selected` - Product checkbox clicked
- `bundle_viewed` - Bundle offer displayed
- `checkout_abandoned` - User leaves checkout
- `checkout_started` - Stripe session created
- `purchase_completed` - Payment successful

### System Events
- `stripe_payment_success` - Stripe webhook confirmed
- `stripe_payment_failed` - Payment failed
- `pdf_generated` - PDF created successfully
- `email_sent` - Email delivered
- `email_failed` - Email delivery failed

## Event Categories

Events are automatically categorized:

- **page** - Navigation and page views
- **quiz** - Quiz interactions
- **checkout** - Payment and checkout
- **product** - Product-related actions
- **system** - Backend operations

## Session Management

Session IDs are automatically:
- Generated on first page load
- Stored in localStorage
- Included in all events
- Used to track user journey

## Error Handling

All tracking functions:
- Handle errors silently (won't break user experience)
- Log errors in development mode
- Use try-catch blocks
- Don't throw exceptions

## Performance

- Events are sent with `keepalive: true` (fire-and-forget)
- No waiting for API response
- Minimal impact on user experience
- Batch operations available for efficiency

## Data Privacy

- IP addresses are collected for analytics
- User agents tracked for device info
- No personal data in event_data unless explicitly added
- GDPR-compliant (analytics only)

## Database Schema

Events are stored in the `analytics_events` table:

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB,
  session_id TEXT,
  result_id UUID REFERENCES quiz_results(id),
  ip_address TEXT,
  user_agent TEXT,
  page_path TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

After implementing this tracking system:

1. Add tracking calls throughout the app (quiz, checkout, etc.)
2. Create the admin dashboard to view the data
3. Build analytics queries for KPIs and funnels
4. Set up automated reports

## Files Created

- `/types/admin.ts` - Type definitions
- `/lib/admin/tracking/client.ts` - Client-side hook
- `/lib/admin/tracking/server.ts` - Server-side utilities
- `/app/api/admin/events/route.ts` - API endpoint
