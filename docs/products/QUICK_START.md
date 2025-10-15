# Quick Start Guide - Upsell Products Setup

## 5-Minute Setup Checklist

Follow these steps to get your meditation audio and handbook products live.

---

## Step 1: Environment Variables (2 minutes)

Copy `.env.local.example` to `.env.local` if you haven't already, then add:

```bash
# ElevenLabs (Required for meditation audio)
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Already have these from previous setup:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
```

**Get ElevenLabs Credentials**:
1. Sign up: https://elevenlabs.io
2. Go to Profile → API Keys
3. Copy API key
4. Browse Voice Library → Choose Hungarian female voice
5. Copy Voice ID

---

## Step 2: Database Setup (1 minute)

1. Open Supabase SQL Editor
2. Copy entire contents of `/docs/database-migrations/004_meditation_access_table.sql`
3. Paste and execute

**Verify**:
```sql
SELECT * FROM meditation_access LIMIT 1;
-- Should return empty table (no error)
```

---

## Step 3: Supabase Storage Buckets (1 minute)

**In Supabase Dashboard**:

1. Storage → New Bucket
   - Name: `ebooks`
   - Public: OFF
   - Create

2. Storage → New Bucket
   - Name: `meditations`
   - Public: OFF
   - Create

---

## Step 4: Generate Test Meditation (1 minute)

Start your dev server:
```bash
npm run dev
```

Generate ONE meditation to test:
```bash
curl -X POST http://localhost:3000/api/generate-meditation-audio \
  -H "Content-Type: application/json" \
  -d '{"chakraKey": "root"}'
```

**Expected Output**:
```json
{
  "success": true,
  "data": {
    "chakra": "Gyökércsakra",
    "audioUrl": "https://...",
    "fileSize": 15234567
  }
}
```

**Cost**: ~$0.50 USD for one 18-minute meditation

---

## Step 5: Create Test Access Token

Insert test token in Supabase SQL Editor:
```sql
INSERT INTO meditation_access (email, product_type, access_token)
VALUES (
  'test@example.com',
  'meditations',
  '550e8400-e29b-41d4-a716-446655440000'
);
```

**Test Access**:
Visit: http://localhost:3000/my-meditations/550e8400-e29b-41d4-a716-446655440000

You should see the meditation player page with 1 playable meditation.

---

## Production Deployment

### Generate All 7 Meditations

**Option A: One by one** (Recommended first time)
```bash
curl -X POST http://localhost:3000/api/generate-meditation-audio \
  -H "Content-Type: application/json" \
  -d '{"chakraKey": "root"}'

# Wait for completion, then next:
curl -X POST http://localhost:3000/api/generate-meditation-audio \
  -H "Content-Type: application/json" \
  -d '{"chakraKey": "sacral"}'

# Repeat for: solar, heart, throat, thirdEye, crown
```

**Option B: Batch script**
Create `/scripts/generate-all.sh`:
```bash
#!/bin/bash
for chakra in root sacral solar heart throat thirdEye crown; do
  echo "Generating $chakra meditation..."
  curl -X POST http://localhost:3000/api/generate-meditation-audio \
    -H "Content-Type: application/json" \
    -d "{\"chakraKey\": \"$chakra\"}"
  echo "\n"
  sleep 5 # Wait between generations
done
```

Run:
```bash
chmod +x scripts/generate-all.sh
./scripts/generate-all.sh
```

**Total Time**: ~10-15 minutes (API processing)
**Total Cost**: ~$7-10 USD

---

## Handbook Setup

### Generate Content with GPT

1. Open ChatGPT (use GPT-4o-mini for cost efficiency)
2. Copy prompts from `/docs/products/gpt-prompt-chakra-handbook.md`
3. Generate sections:
   - Introduction (Prompt 1)
   - Each chakra (Prompt 2-8, repeat 7 times)
   - Practical section (Prompt 9)
4. Save all sections as Markdown files
5. Combine into single document

### Convert to PDF

**Option A: Pandoc (Free, CLI)**
```bash
brew install pandoc
pandoc chakra-handbook.md -o chakra-kezikonyv.pdf \
  --pdf-engine=xelatex \
  --toc \
  --variable mainfont="Georgia"
```

**Option B: Typora (Free, GUI)**
1. Open combined Markdown in Typora
2. File → Export → PDF
3. Adjust styling as needed

**Option C: Canva (Beautiful, Paid)**
1. Import content to Canva
2. Design with beautiful templates
3. Export as PDF

### Upload to Supabase

1. Supabase Storage → `ebooks` bucket
2. Upload `chakra-kezikonyv.pdf`
3. Generate signed URL (1 year):
```javascript
const { data } = await supabase.storage
  .from('ebooks')
  .createSignedUrl('chakra-kezikonyv.pdf', 31536000); // 1 year in seconds
```

---

## Testing Full Purchase Flow

### 1. Create Stripe Test Product

In Stripe Dashboard:
1. Products → Add Product
   - Name: "7 Csakra Meditációs Audio"
   - Price: 3,990 Ft (or 39.90 USD for testing)
   - Save product ID

### 2. Test Checkout

```bash
# Start your app
npm run dev

# Visit checkout page (with test result ID)
http://localhost:3000/checkout/test-result-id
```

### 3. Complete Test Payment

Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### 4. Verify Webhook

Check Stripe Dashboard:
- Webhooks → Events
- Should see `checkout.session.completed`

Check database:
```sql
SELECT * FROM meditation_access ORDER BY created_at DESC LIMIT 1;
```

### 5. Test Email

Check your email (if Resend configured):
- Subject: "Meditációid elérhetők!"
- Should contain access link

### 6. Test Access

Click link from email or visit:
```
http://localhost:3000/my-meditations/{YOUR_TOKEN}
```

Should see all 7 meditations with working audio players.

---

## Troubleshooting

### Audio Generation Fails

**Error**: "ELEVENLABS_VOICE_ID not configured"
- **Fix**: Add `ELEVENLABS_VOICE_ID` to `.env.local`

**Error**: "Failed to generate meditation audio"
- **Fix**: Check ElevenLabs API key is valid
- **Fix**: Verify you have credits in ElevenLabs account

### Token Page Not Loading

**Error**: 404 Not Found
- **Fix**: Verify token exists in database
- **Fix**: Check `is_active = true`
- **Fix**: Ensure token is valid UUID format

**Error**: "Access has expired"
- **Fix**: Set `expires_at = NULL` for lifetime access

### Audio Won't Play

**Error**: "Failed to load audio"
- **Fix**: Check Supabase bucket is created
- **Fix**: Verify audio file uploaded successfully
- **Fix**: Generate signed URL if expired

---

## Production Checklist

Before going live:

- [ ] All 7 meditation audio files generated
- [ ] Handbook PDF created and uploaded
- [ ] Environment variables set in Vercel
- [ ] Database migration executed on production
- [ ] Supabase buckets created in production
- [ ] Stripe webhook configured (production URL)
- [ ] Stripe products created (production mode)
- [ ] Email templates tested
- [ ] Test purchase completed successfully
- [ ] Access token system verified
- [ ] Audio player works on mobile
- [ ] Error handling tested

---

## Support

If you encounter issues:

1. Check logs: Vercel Dashboard → Functions → Logs
2. Check Stripe: Dashboard → Webhooks → Events
3. Check Supabase: Dashboard → Logs
4. Check database: SQL Editor → `SELECT * FROM meditation_access`

For ElevenLabs issues:
- https://help.elevenlabs.io/

For Supabase issues:
- https://supabase.com/docs

---

## Estimated Costs

### Development Phase
- ElevenLabs testing: $1-2 USD (1-2 test meditations)
- Total: < $5 USD

### Production Setup
- ElevenLabs (7 meditations): $7-10 USD (one-time)
- Handbook: $0 (DIY) - $50 (professional design)
- Total: $7-60 USD (one-time)

### Monthly Costs
- Supabase Storage: ~$0.01/month (700MB audio)
- ElevenLabs: $0 (unless regenerating)
- Total: < $1/month

### Revenue Per Sale
- Meditations: 3,990 Ft (~$11 USD)
- Handbook: 1,990 Ft (~$5.50 USD)
- Bundle: 4,990 Ft (~$13.80 USD)
- **Break-even**: 1-2 sales

---

*Setup time: 5 minutes + audio generation (15 minutes) = 20 minutes total*
*Ready to launch in under 1 hour!*
