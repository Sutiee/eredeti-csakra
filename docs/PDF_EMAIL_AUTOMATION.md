# PDF & Email Automation System

Automated detailed report generation and email delivery system for Eredeti Csakra using GPT-4o-mini, jsPDF, and Resend.

## Overview

This system automatically generates personalized chakra analysis PDFs and sends them via email after a user purchases the "Személyre Szabott Csakra Elsősegély Csomag" (2990 Ft).

## Architecture

```
Purchase Complete (Stripe Webhook)
  ↓
1. Generate Detailed Report (/api/generate-detailed-report)
  → Call GPT-4o-mini (OpenAI) to generate personalized content
  → Generate PDF with jsPDF
  → Upload to Supabase Storage
  → Return signed download URL
  ↓
2. Send Purchase Email (/api/send-purchase-email)
  → Generate HTML email from template
  → Send via Resend API
  → Include download link
```

## Technologies

- **OpenAI GPT-4o-mini**: Generates personalized chakra analysis text
- **jsPDF**: Creates PDF documents with custom layouts
- **Resend**: Email delivery service
- **Supabase Storage**: Stores generated PDF files
- **Next.js API Routes**: Backend endpoints

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

Sends purchase confirmation email with PDF download link using Resend.

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "downloadUrl": "https://...",
  "resultId": "uuid"
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

**Email Template:**
- HTML email with gradient header
- Clear download button
- Lists PDF contents
- Professional footer

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

### Manual Testing

1. **Test Report Generation:**
```bash
curl -X POST http://localhost:3000/api/generate-detailed-report \
  -H "Content-Type: application/json" \
  -d '{"resultId":"your-test-result-id"}'
```

2. **Test Email Sending:**
```bash
curl -X POST http://localhost:3000/api/send-purchase-email \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "downloadUrl":"https://...",
    "resultId":"test-id"
  }'
```

### Integration Testing

Create a test quiz result and verify:
1. PDF generates successfully
2. PDF contains all expected pages
3. GPT-4o-mini content is coherent and personalized
4. Email is delivered with correct template
5. Download link works and expires correctly

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
│   ├── client.ts           # OpenAI client setup
│   └── report-generator.ts # GPT-4o-mini prompt & logic
├── pdf/
│   └── report-template.ts  # jsPDF PDF generation
└── email/
    └── templates.ts        # HTML email templates

app/api/
├── generate-detailed-report/
│   └── route.ts           # PDF generation endpoint
└── send-purchase-email/
    └── route.ts           # Email sending endpoint
```

## Dependencies

```json
{
  "openai": "^6.3.0",
  "jspdf": "^3.0.3",
  "resend": "^6.1.3",
  "@supabase/supabase-js": "^2.45.4"
}
```

## Success Criteria

- [x] GPT-4o-mini generates coherent, personalized content
- [x] PDF contains all required pages (11 pages)
- [x] Supabase Storage upload works with signed URLs
- [x] Resend email delivery works with HTML template
- [x] TypeScript type checking passes
- [x] All error cases handled gracefully
- [x] Logging implemented for debugging
- [x] Documentation complete

## Support

For issues or questions:
- **Email**: hello@eredeticsakra.hu
- **Documentation**: This file + inline code comments
- **Logs**: Check server logs for detailed error messages
