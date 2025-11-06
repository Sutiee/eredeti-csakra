# Newsletter Campaign Email Templates - Implementation Guide

## Overview

This document describes the conversion-optimized email campaign system for the Eredeti Csakra chakra wellness program. The system implements A/B/C pricing variants with 2025 email marketing best practices.

## Target Audience

- **Demographics**: Hungarian women aged 35+
- **Psychographics**: Spirituality-focused, interested in self-development
- **Pain Points**: Fatigue, emotional instability, relationship issues, lack of self-confidence
- **Conversion Goal**: 0.5-1.3% (5-13 sales from 1,000 emails)

## File Structure

```
lib/email/
├── newsletter-templates.ts       # Main template generation functions
└── templates.ts                  # Existing purchase confirmation templates

scripts/
└── test-newsletter-templates.ts  # Preview generation script

test-output/newsletter-emails/
├── variant-a-990ft.html          # Entry-level pricing preview
├── variant-b-1990ft.html         # Best value pricing preview
├── variant-c-2990ft.html         # Premium pricing preview
├── variant-a-990ft.txt           # Plain text version A
├── variant-b-1990ft.txt          # Plain text version B
├── variant-c-2990ft.txt          # Plain text version C
└── CAMPAIGN-SUMMARY.txt          # Campaign analysis report
```

## Pricing Variants

### Variant A: 990 Ft (Entry-Level)
- **Original Price**: 7,990 Ft
- **Discount**: 87%
- **Badge**: None
- **Positioning**: "Kezdd el most 990 Ft-ért"
- **Strategy**: Lowest barrier to entry, maximize sales volume
- **Best For**: Price-sensitive customers, impulse buyers
- **Expected Conversion**: Highest volume, lower revenue per sale

### Variant B: 1,990 Ft (Best Value) ⭐
- **Original Price**: 7,990 Ft
- **Discount**: 75%
- **Badge**: "⭐ LEGJOBB ÉRTÉK"
- **Positioning**: "Fele áron, teljes elemzés"
- **Strategy**: Sweet spot pricing, emphasize value
- **Best For**: Decision-makers comparing options
- **Expected Conversion**: Balanced volume and revenue (recommended starting point)

### Variant C: 2,990 Ft (Premium) 👑
- **Original Price**: 7,990 Ft
- **Discount**: 63%
- **Badge**: "👑 PRÉMIUM MINŐSÉG"
- **Positioning**: "Professzionális, teljes körű értékelés"
- **Strategy**: Quality positioning, higher perceived value
- **Best For**: Quality-focused buyers, serious spiritual seekers
- **Expected Conversion**: Lower volume, higher revenue per sale

## Subject Line Options (A/B Testing)

Test all 3 subject lines with equal distribution (33.3% each):

1. **Problem-Focus**: `Miért érzed magad kimerültnek naponta? 🌀`
   - Appeals to pain point awareness
   - Direct and relatable
   - High open rate expected

2. **Curiosity**: `[Név], csakráid üzennek neked... ✨`
   - Personalized with recipient's name
   - Creates mystery and intrigue
   - Leverages spiritual language

3. **Urgency**: `⏰ Csak 48 órád maradt: Csakra Elemzés -87%`
   - Scarcity and time pressure
   - Clear discount value
   - May trigger FOMO (fear of missing out)

## Email Structure (PAS Formula)

The templates follow the proven **Problem → Agitate → Solution** copywriting framework:

### 1. Header
- Purple gradient background (`#667eea → #764ba2`)
- Large emoji (🌀✨)
- Compelling headline: "Miért Érzed Magad Kimerültnek Minden Nap?"

### 2. PROBLEM Section
- Identifies 5 key pain points:
  - Constant fatigue
  - Emotional rollercoaster
  - Relationship difficulties
  - Inner restlessness
  - Lack of self-confidence
- Reassures: "Not your fault"

### 3. AGITATE Section
- Deepens the pain ("working harder makes it worse")
- Shows consequences of inaction
- Lists aspirational outcomes (what they want)
- Asks: "But where do you start?"

### 4. SOLUTION Section
- Introduces chakra harmonization as the answer
- Explains the root cause (blocked chakras)
- Positions the analysis as the first step

### 5. CTA #1 (Primary)
- Button text: "🔮 Elemzésem Megrendelése Most"
- Purple gradient, prominent placement
- Links to checkout with tracking parameters

### 6. VALUE STACK
- Lists 20+ benefits in bulleted format
- Emphasizes:
  - Complete 7-chakra assessment
  - Identification of blocked chakras
  - Root cause analysis
  - Healing practices
  - AI-generated personalization
  - 20+ page PDF
  - Instant access

### 7. PRICING BOX (Variant-Specific)
- Strikethrough old price: 7,990 Ft
- Bold new price: 990 / 1,990 / 2,990 Ft
- Discount badge: -87% / -75% / -63%
- Positioning statement
- Emphasis text (variant-specific)

### 8. URGENCY TIMER
- Clock emoji ⏰
- "48 hours remaining" message
- Creates scarcity

### 9. CTA #2 (Repeat)
- Button text: "🔮 Igen, Megrendelem Most!"
- Same styling as CTA #1
- Reinforces call-to-action

### 10. SOCIAL PROOF
- Believable customer testimonial
- Name and location: "Éva, 42 éves, Budapest"
- Specific results: "3 weeks to feel the change"
- Emotional language and gratitude

### 11. CLOSING
- Personal message using recipient's name
- Emotional appeal: "You don't have to live like this"
- Signature: "Eredeti Csakra csapata 💜"

### 12. P.S. SECTION
- **Highest-readership area** in emails
- Final urgency reminder
- Contrasts: "Same exhaustion in 1 year OR change now"
- Third CTA link

### 13. FOOTER
- Company info
- Contact email
- Unsubscribe link (required)
- Privacy compliance

## Technical Implementation

### Basic Usage

```typescript
import { generateNewsletterEmail } from '@/lib/email/newsletter-templates';

const emailData = {
  name: 'Katalin',
  variantId: 'b' as const, // 'a' | 'b' | 'c'
  resultId: 'optional-result-uuid', // For personalized links
  campaignId: 'campaign-2025-01',
};

const { html, subject, previewText } = generateNewsletterEmail(emailData);

// Send via Resend API
await resend.emails.send({
  from: 'info@eredeticsakra.hu',
  to: 'customer@example.com',
  subject: subject,
  html: html,
  text: generateNewsletterEmailText(emailData), // Plain text fallback
});
```

### Tracking URLs

All CTAs link to:
```
https://eredeticsakra.hu/checkout/[result-id]?variant=[a|b|c]&campaign=[campaign-id]
```

Or for cold traffic (no quiz result yet):
```
https://eredeticsakra.hu?campaign=[campaign-id]&variant=[a|b|c]
```

Parameters:
- `variant`: Pricing variant (a/b/c) - track which price converts best
- `campaign`: Campaign identifier - track overall campaign performance
- `result-id`: Optional personalized quiz result - for follow-up emails

### Testing Previews

Generate preview files:
```bash
npx tsx scripts/test-newsletter-templates.ts
```

Outputs to: `test-output/newsletter-emails/`

Open HTML files in browser to preview design.

## Email Marketing Best Practices Applied

### ✅ Conversion Optimization Techniques

1. **PAS Formula** - Problem → Agitate → Solution structure
2. **Emotional Triggers** - Exhaustion, hope, transformation
3. **Scarcity** - 48-hour limited offer
4. **Urgency** - Countdown timer visual
5. **Social Proof** - Believable customer testimonial
6. **Value Stacking** - 20+ benefits listed
7. **Multiple CTAs** - 3 call-to-action buttons
8. **P.S. Section** - High-readership area utilized
9. **Personalization** - Recipient's name in subject and body
10. **Mobile-Responsive** - Optimized for all screen sizes

### ✅ Email Deliverability

- **Inline CSS** - All styles inline for email client compatibility
- **Alt Text** - Images have fallback text
- **Plain Text Version** - Always include text-only alternative
- **Unsubscribe Link** - Required for CAN-SPAM compliance
- **Fallback Fonts** - System fonts for universal rendering
- **Tested HTML Structure** - Matches existing templates pattern

### ✅ Brand Consistency

- **Purple Gradient** - Signature `#667eea → #764ba2` gradient
- **Typography** - Same fonts as website (Inter, Playfair Display)
- **Tone of Voice** - Empathetic, warm, spiritual (tegeződés)
- **Color Psychology** - Spiritual purple, healing green, urgent red
- **Visual Hierarchy** - Clear structure, scannable content

## Campaign Testing Strategy

### Phase 1: Small-Scale Test (100 emails)
1. Send 33 emails per variant (A/B/C)
2. Test all 3 subject lines equally
3. Track 24-hour performance:
   - Open rate
   - Click-through rate
   - Conversion rate
   - Revenue per email

### Phase 2: Analysis (24 hours)
1. Identify winning variant
2. Analyze subject line performance
3. Check time-of-day patterns
4. Review unsubscribe rates

### Phase 3: Scale Winner (900 emails)
1. Send winning variant to remaining list
2. Use best-performing subject line
3. Monitor results continuously
4. Implement learnings for future campaigns

## Expected Performance Metrics

### Conservative Estimates
- **Open Rate**: 25-35%
- **Click Rate**: 5-10%
- **Conversion Rate**: 0.5-1.3%
- **Sales from 1,000 emails**: 5-13 sales
- **Revenue Range**: 4,950 - 38,870 Ft

### Optimistic Scenario
- **Variant B (1,990 Ft)** at 1.3% conversion: 13 sales = **25,870 Ft**
- **Variant C (2,990 Ft)** at 0.8% conversion: 8 sales = **23,920 Ft**

### KPIs to Track
1. **Open Rate** - Subject line effectiveness
2. **Click Rate** - Email content engagement
3. **Conversion Rate** - Offer attractiveness
4. **Revenue Per Email (RPE)** - Overall campaign profitability
5. **Unsubscribe Rate** - List health (should be <0.5%)
6. **Time to Purchase** - Decision-making speed

## Integration with Existing System

### Database Schema (Future Enhancement)

```sql
-- Newsletter campaigns table
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  variant TEXT CHECK (variant IN ('a', 'b', 'c')),
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'draft'
);

-- Newsletter sends tracking
CREATE TABLE newsletter_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id),
  email TEXT NOT NULL,
  name TEXT,
  variant TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  converted_at TIMESTAMP,
  purchase_id UUID REFERENCES purchases(id)
);
```

### API Route Example

```typescript
// app/api/newsletter/send/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateNewsletterEmail } from '@/lib/email/newsletter-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { recipients, variantId, campaignId } = await request.json();

  const results = [];

  for (const recipient of recipients) {
    const { html, subject, previewText } = generateNewsletterEmail({
      name: recipient.name,
      variantId,
      campaignId,
      resultId: recipient.resultId, // Optional
    });

    const { data, error } = await resend.emails.send({
      from: 'info@eredeticsakra.hu',
      to: recipient.email,
      subject: subject,
      html: html,
      headers: {
        'X-Entity-Ref-ID': `${campaignId}-${recipient.email}`,
      },
    });

    results.push({ email: recipient.email, success: !error });
  }

  return NextResponse.json({ results });
}
```

## Customization Guide

### Changing Prices

Edit `PRICING_VARIANTS` in `/lib/email/newsletter-templates.ts`:

```typescript
const PRICING_VARIANTS = {
  a: {
    price: 990, // Change here
    originalPrice: 7990,
    discount: 87, // Update discount %
    // ... rest of config
  },
  // ...
};
```

### Changing Content

All content is in Hungarian and follows spiritual wellness tone. To modify:

1. **Problem Section**: Update pain points in the template
2. **Value Stack**: Modify benefit list
3. **Testimonial**: Change customer quote
4. **Urgency**: Adjust time limit (currently 48 hours)

### Changing Design

Modify inline CSS in the template:
- **Colors**: Update gradient values
- **Fonts**: Change font-family declarations
- **Spacing**: Adjust padding/margin values
- **Button Style**: Modify `.button` class

## Compliance & Privacy

### GDPR Compliance
- Unsubscribe link in every email
- Only send to opted-in subscribers
- Store consent timestamp
- Honor unsubscribe requests immediately

### CAN-SPAM Act
- Include physical address (footer)
- Clear "From" name (Eredeti Csakra)
- Accurate subject lines
- Easy opt-out mechanism

### Best Practices
- Don't buy email lists
- Segment audiences appropriately
- Respect frequency preferences
- Monitor spam complaints

## Troubleshooting

### Low Open Rates (<20%)
- Test different subject lines
- Check spam score (use mail-tester.com)
- Verify sender authentication (SPF, DKIM, DMARC)
- Send at different times of day
- Clean inactive subscribers

### Low Click Rates (<3%)
- Strengthen CTAs
- Add more urgency
- Test different pricing variants
- Improve value proposition clarity
- Add more social proof

### High Unsubscribe Rates (>1%)
- Review email frequency
- Ensure content relevance
- Check tone and messaging
- Segment list more carefully
- Survey unsubscribers for feedback

## Future Enhancements

### Phase 2 Features
1. **Dynamic Content**: Real-time personalization based on quiz results
2. **A/B Testing Dashboard**: Track variant performance in admin panel
3. **Automated Sequences**: Multi-touch email campaigns
4. **Behavioral Triggers**: Send based on user actions
5. **Advanced Segmentation**: Target by chakra imbalance type

### Phase 3 Features
1. **Predictive Send Times**: AI-optimized delivery timing
2. **Smart Subject Lines**: GPT-4 generated variants
3. **Image Personalization**: Dynamic chakra visualizations
4. **Multi-language**: English and German versions
5. **SMS Integration**: Text message follow-ups

## Support & Maintenance

### Monitoring
- Check Resend dashboard daily during campaigns
- Monitor conversion rates in real-time
- Track unsubscribe patterns
- Review bounce rates

### Optimization Cycle
1. Send campaign
2. Collect data (48 hours)
3. Analyze results
4. Iterate on winning elements
5. Scale successful patterns

### Contact
For technical questions or campaign strategy:
- **Email**: info@eredeticsakra.hu
- **System**: Check `/docs/ai-context/project-structure.md`

---

**Last Updated**: 2025-11-05
**Version**: 1.0
**Author**: Claude AI (Sonnet 4.5)
**Status**: Production-Ready
