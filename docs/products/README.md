# Eredeti Csakra - Upsell Products Documentation

This directory contains documentation and resources for the two premium products:
1. **Csakra Kézikönyv** (90-page Chakra Handbook) - 1,990 Ft
2. **7 Meditációs Audio** (Meditation Audio Collection) - 3,990 Ft

---

## Product 1: Csakra Kézikönyv (90 oldal PDF)

### Overview
A comprehensive 90-page handbook covering all 7 chakras with practical exercises, meditation guides, journal templates, and a 21-day challenge.

### Files
- `chakra-handbook-outline.md` - Complete 90-page structure outline
- `gpt-prompt-chakra-handbook.md` - GPT-4o-mini prompts for content generation

### Content Structure (90 pages)
1. **Introduction** (10 pages)
   - What are chakras?
   - History of the 7-chakra system
   - Chakra anatomy and physiology
   - Understanding chakra states

2. **7 Chakras Detailed** (70 pages - 10 pages each)
   - Root Chakra (Muladhara)
   - Sacral Chakra (Svadhisthana)
   - Solar Plexus (Manipura)
   - Heart Chakra (Anahata)
   - Throat Chakra (Vishuddha)
   - Third Eye (Ajna)
   - Crown Chakra (Sahasrara)

   Each chakra includes:
   - Basic data (name, location, color, element, mantra)
   - Symbol system and mythology
   - Psychological meaning
   - Physical manifestations
   - Practical toolkit (meditations, crystals, aromatherapy, nutrition, yoga, affirmations)

3. **Practical Section** (10 pages)
   - Chakra journal templates (daily, weekly, monthly)
   - 21-day Chakra Challenge
   - Recommended reading and resources

### Generation Workflow
1. Use the GPT prompts in `gpt-prompt-chakra-handbook.md`
2. Generate content in sections (Introduction → 7 Chakras → Practical)
3. Combine all sections into one Markdown document
4. Convert to PDF with professional design
5. Upload to Supabase Storage: `ebooks/chakra-kezikonyv.pdf`

### Delivery Method
- **Digital Download**: After purchase, customer receives email with signed download URL (valid for 1 year)
- **Storage**: Supabase Storage bucket `ebooks` (private)
- **Access**: Token-based signed URL from Stripe webhook

---

## Product 2: 7 Meditációs Audio

### Overview
7 guided meditation audio files (15-20 minutes each), one for each chakra, professionally narrated in Hungarian using ElevenLabs AI text-to-speech.

### Files
- `/data/meditation-scripts.ts` - Complete meditation scripts (7 meditations)
- `/lib/elevenlabs/client.ts` - ElevenLabs API client
- `/app/api/generate-meditation-audio/route.ts` - Audio generation API
- `/components/meditations/AudioPlayer.tsx` - Custom audio player component
- `/app/my-meditations/[token]/page.tsx` - Token-based meditation page

### Meditation Scripts (7 files)
Each meditation includes:
- **Duration**: 15-20 minutes
- **Structure**:
  1. Introduction (2 min): Body posture, breathing setup
  2. Main Visualization (10-15 min): Chakra-specific practice
  3. Affirmations (2 min): Positive reinforcement
  4. Closure (1 min): Return to present
- **Voice Notes**: Specific instructions for TTS (pace, pauses, tone)

#### List of Meditations:
1. **Root Chakra** - "Földelő Meditáció - Stabilizálás" (18 min)
2. **Sacral Chakra** - "Érzelmi Áramlás - Kreativitás Felébresztése" (17 min)
3. **Solar Plexus** - "Belső Erő Aktiválása - Önbizalom Építése" (16 min)
4. **Heart Chakra** - "Szeretet Kiterjesztése - Gyógyítás és Megbocsátás" (19 min)
5. **Throat Chakra** - "Hiteles Kifejezés - A Belső Hang Megtalálása" (15 min)
6. **Third Eye** - "Belső Látás Élesítése - Intuíció Fejlesztése" (17 min)
7. **Crown Chakra** - "Spirituális Kapcsolódás - Egység Megélése" (20 min)

### Audio Generation Process

#### Prerequisites
1. **ElevenLabs Account**: Sign up at https://elevenlabs.io
2. **API Key**: Get from https://elevenlabs.io/api
3. **Voice Selection**: Choose Hungarian female voice from voice library
4. **Environment Variables**:
   ```bash
   ELEVENLABS_API_KEY=your-api-key
   ELEVENLABS_VOICE_ID=chosen-voice-id
   ```

#### Generation Workflow
1. **Manual Generation** (via API):
   ```bash
   curl -X POST http://localhost:3000/api/generate-meditation-audio \
     -H "Content-Type: application/json" \
     -d '{"chakraKey": "root"}'
   ```

2. **Process**:
   - Fetch meditation script from `meditation-scripts.ts`
   - Send to ElevenLabs TTS API (model: `eleven_multilingual_v2`)
   - Receive audio stream (MP3 format)
   - Upload to Supabase Storage `meditations` bucket
   - Generate signed URL (valid for 1 year)

3. **Cost Estimation**:
   - Average script: ~2,500 characters
   - ElevenLabs cost: ~100 credits per meditation
   - Total for 7 meditations: ~700 credits (~$7 USD)

### Delivery Method
- **Token-Based Access Page**: `/my-meditations/[token]`
- **Lifetime Access**: No expiration (unless manually revoked)
- **Features**:
  - Custom audio player (play/pause, seek, progress bar)
  - All 7 meditations on one page
  - Beautiful UI with chakra colors
  - Usage instructions
  - Mobile-responsive

### Database Schema
```sql
-- meditation_access table
CREATE TABLE meditation_access (
  id UUID PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id),
  email TEXT NOT NULL,
  access_token UUID UNIQUE NOT NULL, -- Used in URL
  product_type TEXT, -- 'meditations', 'handbook', 'bundle'
  is_active BOOLEAN DEFAULT true,
  access_granted_at TIMESTAMP,
  expires_at TIMESTAMP, -- NULL for lifetime access
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0
);
```

### Webhook Flow (Purchase → Access)
1. Customer completes Stripe payment
2. Stripe webhook fires: `/api/stripe/webhook`
3. Webhook handler:
   - Verify purchase
   - Generate unique `access_token` (UUID)
   - Insert into `meditation_access` table
   - Send email with access link: `https://eredeticsakra.hu/my-meditations/{token}`
4. Customer clicks link → Token validated → Meditation player page loads

---

## Supabase Storage Buckets

### Required Buckets (create in Supabase Dashboard)

#### 1. `ebooks` (Private)
- **Purpose**: Store PDF handbook
- **Files**: `chakra-kezikonyv.pdf`
- **Access**: Signed URLs (1 year expiration)
- **Settings**:
  - Public: OFF
  - File size limit: 50 MB
  - Allowed MIME types: `application/pdf`

#### 2. `meditations` (Private)
- **Purpose**: Store meditation MP3 files
- **Files**: `{chakra}_meditation_*.mp3` (7 files)
- **Access**: Token-based via meditation_access table
- **Settings**:
  - Public: OFF
  - File size limit: 100 MB per file
  - Allowed MIME types: `audio/mpeg`

---

## Testing Checklist

### Handbook Testing
- [ ] PDF generated successfully (90 pages)
- [ ] Uploaded to Supabase `ebooks` bucket
- [ ] Signed URL generated and valid
- [ ] Download link in email works
- [ ] PDF readable on mobile and desktop

### Meditation Testing
- [ ] All 7 meditation scripts complete (15-20 min each)
- [ ] ElevenLabs API working (test with 1 chakra first)
- [ ] Audio files generated successfully (MP3 format)
- [ ] Uploaded to Supabase `meditations` bucket
- [ ] Token-based page loads correctly
- [ ] Audio player works (play/pause, seek, time display)
- [ ] Mobile responsive
- [ ] Email with access link sent after purchase

### Database Testing
- [ ] `meditation_access` table created
- [ ] Token validation function works
- [ ] Access tracking increments correctly
- [ ] Expired tokens handled properly
- [ ] RLS policies applied (if enabled)

### Integration Testing
- [ ] Full purchase flow (Stripe → Webhook → Email → Access)
- [ ] Multiple users can access simultaneously
- [ ] Token uniqueness enforced
- [ ] Webhook retries handled correctly

---

## Pricing & Bundle Options

| Product | Price | Value Proposition |
|---------|-------|-------------------|
| Csakra Kézikönyv | 1,990 Ft | 90-page comprehensive guide + journal templates |
| 7 Meditációs Audio | 3,990 Ft | Professional AI narration, lifetime access |
| **Bundle** | **4,990 Ft** | **Both products (save 990 Ft!)** |

### Stripe Product IDs
```javascript
const PRODUCTS = {
  handbook: 'prod_handbook_123',
  meditations: 'prod_meditations_456',
  bundle: 'prod_bundle_789'
};
```

---

## Maintenance & Updates

### Adding New Meditations
1. Add script to `/data/meditation-scripts.ts`
2. Generate audio via API
3. Upload to Supabase Storage
4. Update meditation player page UI

### Updating Handbook
1. Regenerate content sections with GPT
2. Combine into new PDF
3. Upload new version to Supabase (with versioning)
4. Notify existing customers (optional)

### Voice Changes
If switching to a different ElevenLabs voice:
1. Update `ELEVENLABS_VOICE_ID` in `.env.local`
2. Regenerate all 7 audio files
3. Replace files in Supabase Storage
4. Test audio quality across all meditations

---

## Security Considerations

### Token Security
- Tokens are UUIDs (cryptographically random)
- Never expose service role keys
- Tokens should be treated as passwords (don't log them)

### Access Control
- RLS on `meditation_access` table (optional but recommended)
- Rate limiting on meditation page (prevent abuse)
- Signed URLs expire after 1 year (refresh if needed)

### Content Protection
- No DRM on audio files (ethical approach)
- Token URL is personal (don't share warning)
- Revoke access if abuse detected

---

## Future Enhancements

### Potential Features
- [ ] Offline download option (ZIP package)
- [ ] Interactive PDF with clickable links
- [ ] Multi-language support (English, German)
- [ ] Progress tracking across meditations
- [ ] Community forum access with purchase
- [ ] Monthly new meditation releases (subscription)

---

*Last updated: 2025-10-14*
