# PDF & Email Automation System

Automated report generation and email delivery system for Eredeti Csakra using GPT-5-mini, @react-pdf/renderer, and Resend.

## Overview

This system automatically generates personalized chakra PDFs and sends email notifications when products are ready:
- **AI Analysis PDF** (990 Ft) - 20+ page personalized chakra analysis
- **30-Day Workbook** (3,990 Ft) - 80+ page personalized workbook with daily exercises

## Architecture

```
Purchase Complete (Stripe Webhook)
  ↓
Background Task (waitUntil API)
  ↓
Generate Product PDF
  ├─ AI Analysis: /api/generate-detailed-report-gpt5 (~60-90s)
  └─ Workbook: /api/generate-workbook (~232s / 4 min)
     ↓
  1. Call GPT-5-mini to generate personalized content
  2. Render PDF with @react-pdf/renderer
  3. Upload to Supabase Storage
  4. Update purchase record with pdf_url
  5. Send Email Notification (/api/send-purchase-email)
     → Product-specific template (AI Analysis vs Workbook)
     → Send via Resend API
     → Include download link
```

## Technologies

- **OpenAI GPT-5-mini** (gpt-4o-mini): Generates personalized chakra content
- **@react-pdf/renderer**: Creates React-based PDF documents
- **Resend**: Email delivery service with product-specific templates
- **Supabase Storage**: Stores generated PDF files (private buckets)
- **Next.js API Routes**: Server-side PDF generation with 5-minute timeout (Vercel Pro)
- **Vercel waitUntil()**: Background processing without blocking webhook responses

## Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Resend Email Configuration
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...
RESEND_FROM_EMAIL=hello@eredeticsakra.hu

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## API Endpoints

### 1. POST /api/generate-detailed-report

Generates a personalized PDF report using GPT-4o-mini and uploads to Supabase Storage.

**Request:**
```json
{
  "resultId": "uuid-of-quiz-result"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "downloadUrl": "https://...",
    "filePath": "detailed-reports/..."
  },
  "error": null
}
```

**Process:**
1. Fetches quiz result from Supabase
2. Calls GPT-4o-mini to generate:
   - Chakra connections map (how chakras relate)
   - 3-step first aid plans for each chakra
   - Weekly action plan (7 days)
   - Meditation recommendations
3. Generates PDF with jsPDF (11 pages):
   - Cover page
   - Summary page (wellness score, chakra status)
   - 7 chakra detail pages
   - Weekly action plan page
   - Meditation recommendations page
4. Uploads PDF to Supabase Storage
5. Returns signed URL (valid for 30 days)

### 2. POST /api/send-purchase-email

Sends product-ready notification email with PDF download link using Resend.

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "downloadUrl": "https://...",
  "resultId": "uuid",
  "productName": "Személyre Szabott Csakra Elemzés PDF",
  "productType": "ai_analysis_pdf" | "workbook_30day"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "emailId": "resend-email-id"
  },
  "error": null
}
```

**Email Templates:**
Product-specific HTML emails with:
- **AI Analysis PDF**:
  - Subject: "Köszönjük a vásárlásod! - Személyre Szabott Csakra Elemzésed"
  - Emoji: ✨
  - Content: 7 részletes csakra elemzés, összefüggések térképe, személyre szabott tartalom
- **Workbook**:
  - Subject: "Készen áll a 30 Napos Csakra Munkafüzeted! 📖"
  - Emoji: 📖
  - Content: 30 napos program, napi gyakorlatok, journaling kérdések, affirmációk
- Gradient header, clear download button, product-specific feature list, professional footer
- **Test domain**: `onboarding@resend.dev` (production requires `eredeticsakra.hu` domain verification)

## PDF Structure

### Page 1: Cover Page
- Title: "Személyre Szabott Csakra Elemzésed"
- User name
- Date
- Gradient background (purple to pink)

### Page 2: Summary
- Overall wellness score (percentage)
- Balanced/Imbalanced/Blocked chakra counts
- Primary blocked chakra (if any)
- Bar chart visualization of all chakra scores

### Pages 3-9: Chakra Details (7 chakras)

Each chakra page contains:

**Header:**
- Chakra name (Hungarian + Sanskrit)
- Element
- Color-coded background

**Score & Status:**
- Score (X/16)
- Status badge (green/yellow/red)

**Connections Map (GPT-generated):**
> "A {csakra} csakrád azért {status}, mert {ok}. Ez összefügg a {másik_csakra} csakrádéval..."

Example:
> "A torokcsakrád azért blokkolt, mert a szakrális csakrádból nem jön elég érzelmi energia. A napfonat csakrád túlműködik, ami azt jelenti, hogy az erővel próbálod kompenzálni a hiányzó önkifejezést."

**Manifestations (from interpretations.ts):**
- Bullet-point list of symptoms/behaviors

**3-Step First Aid Plan (GPT-generated):**
1. **Azonnali gyakorlat**: Concrete, immediate action
2. **Napi rutin**: Sustainable daily practice
3. **Hosszú távú stratégia**: Deep healing strategy

### Page 10: Weekly Action Plan
- 7 days of specific practices (GPT-generated)
- Focus on most blocked chakras
- Progressive and varied exercises

### Page 11: Meditation Recommendations
- Morning meditation topics (3-5 items)
- Evening meditation topics (3-5 items)
- Resources (Spotify, YouTube)
- Recommended times

## GPT-4o-mini Prompt Engineering

### System Role
```
Te egy empatikus, tapasztalt energiaterapeuta és csakra szakértő vagy.
```

### User Prompt Structure
1. **Input Data**: Name, chakra scores, interpretation levels
2. **Required Outputs**: Connections, first aid plans, weekly plan, meditations
3. **Style Guidelines**:
   - Empathetic, supportive tone
   - Concrete, actionable advice (NOT generic spiritual clichés)
   - Hungarian language, professional but accessible
   - Optimized for 35+ year old women
4. **Format**: JSON object with strict structure

### Output Schema
```typescript
{
  chakra_connections: Record<ChakraName, string>,
  first_aid_plans: Record<ChakraName, {
    step1: string,
    step2: string,
    step3: string
  }>,
  weekly_plan: {
    monday: string,
    tuesday: string,
    ...
  },
  meditation_recommendations: {
    morning: string[],
    evening: string[]
  }
}
```

## Supabase Storage Configuration

### Bucket: `detailed-reports`
- **Access**: Private
- **File naming**: `{resultId}_report_{timestamp}.pdf`
- **Signed URLs**: Valid for 30 days
- **File size limit**: 10MB

### Bucket Creation (Automatic)
The API route automatically creates the bucket if it doesn't exist:
```typescript
await supabase.storage.createBucket('detailed-reports', {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024
});
```

## Email Configuration (Resend)

### From Address
```
Eredeti Csakra <hello@eredeticsakra.hu>
```

### Email Tags (for tracking)
- `type: purchase-confirmation`
- `result_id: {resultId}`

### Email Features
- HTML + plain text versions
- Responsive design
- Gradient header styling
- Clear CTA button
- Professional footer

## Integration with Stripe Webhook

### Recommended Workflow

When a Stripe checkout completes (`checkout.session.completed`):

```typescript
// In /api/stripe/webhook
const session = event.data.object;
const resultId = session.metadata.resultId;
const customerEmail = session.customer_details.email;
const customerName = session.customer_details.name;

// 1. Generate PDF
const reportResponse = await fetch('/api/generate-detailed-report', {
  method: 'POST',
  body: JSON.stringify({ resultId })
});
const { downloadUrl } = await reportResponse.json();

// 2. Send Email
await fetch('/api/send-purchase-email', {
  method: 'POST',
  body: JSON.stringify({
    name: customerName,
    email: customerEmail,
    downloadUrl,
    resultId
  })
});
```

## Error Handling

### Common Errors

**1. OpenAI API Errors**
- Rate limits
- Invalid API key
- Token limits exceeded

**Solution**: Implement retry logic with exponential backoff

**2. PDF Generation Errors**
- Memory issues with large PDFs
- Font loading failures

**Solution**: Monitor memory usage, use efficient jsPDF options

**3. Supabase Storage Errors**
- Upload failures
- Bucket doesn't exist
- Signed URL generation fails

**Solution**: Automatic bucket creation, retry logic

**4. Email Delivery Errors**
- Invalid email address
- Resend API errors
- Rate limits

**Solution**: Email validation, queue system for retries

## Monitoring & Logging

All operations are logged using the `logger` utility:

```typescript
logger.info("Generating detailed report", { resultId });
logger.error("Failed to generate report", { error });
```

### Key Metrics to Track
- PDF generation time
- GPT-4o-mini response time
- Email delivery rate
- Storage usage
- Error rates

## Cost Analysis

### OpenAI GPT-4o-mini
- **Model**: gpt-4o-mini
- **Cost**: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens
- **Average per report**: ~$0.02-0.05
- **Monthly (100 reports)**: ~$2-5

### Resend
- **Free tier**: 3,000 emails/month
- **Beyond free tier**: $20/month for 50,000 emails

### Supabase Storage
- **Free tier**: 1 GB storage, 2 GB bandwidth
- **PDF size**: ~500KB-1MB per report
- **Monthly (100 reports)**: ~50-100MB storage

### Total Monthly Cost (100 reports)
- OpenAI: $2-5
- Resend: Free (under 3,000 emails)
- Supabase: Free (under 1GB)
- **Total**: $2-5/month

## Testing

### Email Testing Scripts

Two dedicated test scripts are available:

**1. Direct Resend API Test (Recommended for testing):**
```bash
npx tsx scripts/test-email-direct.ts
```
- Tests email templates via Resend API directly
- Works without domain verification (uses `onboarding@resend.dev`)
- Sends test emails for both products (AI Analysis + Workbook)
- Returns Resend email IDs for tracking

**2. Full Next.js API Test (For production verification):**
```bash
npx tsx scripts/test-email.ts
```
- Tests complete email flow via Next.js API routes
- Requires `npm run dev` server running
- Requires `eredeticsakra.hu` domain verification in Resend
- Tests full integration path

### Manual API Testing

1. **Test AI Analysis PDF Generation:**
```bash
curl -X POST http://localhost:3000/api/generate-detailed-report-gpt5 \
  -H "Content-Type: application/json" \
  -d '{"result_id":"your-test-result-id"}'
```

2. **Test Workbook Generation:**
```bash
curl -X POST http://localhost:3000/api/generate-workbook \
  -H "Content-Type: application/json" \
  -d '{"result_id":"your-test-result-id"}'
```

3. **Test Email Sending:**
```bash
curl -X POST http://localhost:3000/api/send-purchase-email \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "downloadUrl":"https://...",
    "resultId":"test-id",
    "productType":"ai_analysis_pdf"
  }'
```

### Integration Testing Checklist

For each product (AI Analysis PDF and Workbook):
1. [ ] PDF generates successfully within timeout (AI: <2min, Workbook: <5min)
2. [ ] PDF contains all expected pages with correct content
3. [ ] GPT-5-mini content is coherent and personalized (not generic)
4. [ ] PDF uploads to Supabase Storage successfully
5. [ ] Purchase record updates with `pdf_url`
6. [ ] Email is sent with product-specific template
7. [ ] Email arrives with correct subject line and content
8. [ ] Download link works and PDF is accessible
9. [ ] Signed URL expires after 30 days
10. [ ] Error handling works (email failure doesn't block PDF generation)

## Security Considerations

1. **API Keys**: Never expose in client-side code
2. **Signed URLs**: Use time-limited URLs (30 days)
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement rate limits on API routes
5. **Email Validation**: Verify email addresses before sending
6. **Storage Access**: Use private buckets with RLS

## Future Enhancements

### Potential Improvements
1. **Caching**: Cache GPT-4o-mini responses for common patterns
2. **Background Jobs**: Use queue system for long-running operations
3. **PDF Customization**: Allow users to customize PDF styling
4. **Multi-language**: Support multiple languages
5. **Analytics**: Track which sections users find most valuable
6. **A/B Testing**: Test different email templates
7. **Retry Logic**: Automatic retry for failed operations
8. **Webhook**: Notify user when PDF is ready (for async generation)

## Troubleshooting

### Issue: PDF generation is slow
- **Solution**: Optimize jsPDF operations, consider caching
- **Alternative**: Generate PDF asynchronously and notify user

### Issue: GPT-4o-mini returns invalid JSON
- **Solution**: Use `response_format: { type: "json_object" }` in API call
- **Validation**: Parse and validate JSON response

### Issue: Emails not arriving
- **Check**: Resend API key validity
- **Check**: Email address validity
- **Check**: Spam folder
- **Solution**: Verify domain authentication in Resend

### Issue: Storage quota exceeded
- **Solution**: Implement cleanup policy for old PDFs
- **Alternative**: Store only recent reports, archive old ones

## File Structure

```
lib/
├── openai/
│   ├── prompts-gpt5.ts              # GPT-5-mini prompts for AI Analysis
│   ├── workbook-prompts-gpt5.ts     # GPT-5-mini prompts for Workbook
│   ├── workbook-generator-gpt5.ts   # Workbook content generation logic
│   └── report-generator-gpt5.ts     # Report content generation logic
├── pdf/
│   ├── report-template-gpt5.tsx     # React PDF template for AI Analysis
│   └── workbook-template-gpt5.tsx   # React PDF template for Workbook
└── email/
    └── templates.ts                 # Product-specific HTML email templates

app/api/
├── generate-detailed-report-gpt5/
│   └── route.ts                     # AI Analysis PDF generation + email
├── generate-workbook/
│   └── route.ts                     # Workbook PDF generation + email
├── send-purchase-email/
│   └── route.ts                     # Email notification endpoint
└── stripe/webhook/
    └── route.ts                     # Triggers background PDF generation

scripts/
├── test-email-direct.ts             # Direct Resend API email test
├── test-email.ts                    # Full Next.js API email test
└── retry-failed-workbooks.ts        # Regenerate failed workbooks
```

## Dependencies

```json
{
  "openai": "^4.73.0",
  "@react-pdf/renderer": "^4.1.7",
  "resend": "^6.1.3",
  "@supabase/supabase-js": "^2.48.1",
  "zod": "^3.24.1"
}
```

**Key Libraries:**
- **openai**: GPT-5-mini API client for content generation
- **@react-pdf/renderer**: React-based PDF rendering engine
- **resend**: Email delivery API with template support
- **@supabase/supabase-js**: Database and storage client
- **zod**: Request validation schemas

## Success Criteria

### AI Analysis PDF (990 Ft)
- [x] GPT-5-mini generates coherent, personalized content
- [x] PDF contains all required pages (20+ pages)
- [x] Supabase Storage upload works with signed URLs (30-day expiry)
- [x] Email notification sent with product-specific template
- [x] Generation completes within 2 minutes
- [x] Email includes accurate product features list
- [x] Non-blocking email errors (PDF generation succeeds even if email fails)

### 30-Day Workbook (3,990 Ft)
- [x] GPT-5-mini generates personalized 30-day content (dual API calls)
- [x] PDF renders 80+ pages with @react-pdf/renderer
- [x] Supabase Storage upload works with retry logic
- [x] Email notification sent with workbook-specific template
- [x] Generation completes within 5 minutes (maxDuration=300)
- [x] Day distribution personalized based on chakra scores (blocked = more days)
- [x] Email includes journaling, exercises, and affirmations in feature list

### Email System
- [x] Resend integration works with product-specific templates
- [x] Dynamic subject lines based on product type
- [x] Test scripts available for both direct API and full flow testing
- [x] Works with test domain `onboarding@resend.dev` (production ready for domain verification)
- [x] TypeScript type checking passes
- [x] All error cases handled gracefully
- [x] Comprehensive logging for debugging
- [x] Documentation updated

## Support

For issues or questions:
- **Email**: hello@eredeticsakra.hu
- **Documentation**: This file + inline code comments
- **Logs**: Check server logs for detailed error messages
