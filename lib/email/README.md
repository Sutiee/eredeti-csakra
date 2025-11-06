# Email Templates Library

## Overview

This directory contains all email template generation functions for the Eredeti Csakra application.

## Available Templates

### 1. Purchase Confirmation Emails (`templates.ts`)

**Purpose**: Sent after successful purchase to deliver product download links.

**Functions**:
- `generatePurchaseConfirmationEmail()` - HTML version
- `generatePurchaseConfirmationEmailText()` - Plain text version
- `generateGiftBuyerEmail()` - Gift purchase confirmation
- `generateGiftRecipientEmail()` - Gift recipient notification

**Used By**: Stripe webhook handler (`/api/stripe/webhook`)

**Trigger**: Automatically sent after PDF generation completes

---

### 2. Newsletter Campaign Emails (`newsletter-templates.ts`)

**Purpose**: Conversion-optimized campaign emails for chakra analysis product sales.

**Functions**:
- `generateNewsletterEmail()` - Main template generator (HTML + subject + preview)
- `generateNewsletterEmailText()` - Plain text version
- `getAllSubjectLineVariants()` - Returns all 3 subject line options
- `generateAllVariantPreviews()` - Generate all A/B/C variants for testing

**Target Audience**: Hungarian women 35+, spirituality-focused

**Goal**: 0.5-1.3% conversion rate (5-13 sales from 1,000 emails)

---

## Quick Start Guide

### Send Newsletter Campaign Email

```typescript
import { generateNewsletterEmail } from '@/lib/email/newsletter-templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate email
const emailData = {
  name: 'Katalin',
  variantId: 'b' as const, // Pricing: 'a' (990 Ft) | 'b' (1,990 Ft) | 'c' (2,990 Ft)
  campaignId: 'campaign-2025-01',
  resultId: 'optional-quiz-result-uuid', // For personalized follow-ups
};

const { html, subject, previewText } = generateNewsletterEmail(emailData);

// Send email
await resend.emails.send({
  from: 'info@eredeticsakra.hu',
  to: 'customer@example.com',
  subject: subject,
  html: html,
});
```

### Preview Templates Locally

```bash
# Generate HTML preview files
npx tsx scripts/test-newsletter-templates.ts

# View output
open test-output/newsletter-emails/variant-b-1990ft.html
```

---

## Pricing Variants

| Variant | Price | Discount | Badge | Best For |
|---------|-------|----------|-------|----------|
| **A** | 990 Ft | 87% | None | Price-sensitive, impulse buyers |
| **B** | 1,990 Ft | 75% | ⭐ LEGJOBB ÉRTÉK | Value seekers (recommended) |
| **C** | 2,990 Ft | 63% | 👑 PRÉMIUM MINŐSÉG | Quality-focused buyers |

**Original Price (all variants)**: 7,990 Ft

---

## Subject Line Options

Test all 3 with equal distribution:

1. **Problem-Focus**: `Miért érzed magad kimerültnek naponta? 🌀`
2. **Curiosity**: `[Név], csakráid üzennek neked... ✨` (personalized)
3. **Urgency**: `⏰ Csak 48 órád maradt: Csakra Elemzés -87%`

---

## Email Structure (Newsletter)

The newsletter follows the **PAS Formula** (Problem → Agitate → Solution):

1. **Header** - Purple gradient + emoji + headline
2. **PROBLEM** - Identify 5 pain points
3. **AGITATE** - Deepen pain, show consequences
4. **SOLUTION** - Chakra harmonization
5. **CTA #1** - Primary button
6. **VALUE STACK** - 20+ benefits
7. **PRICING** - Variant-specific (A/B/C)
8. **URGENCY** - 48-hour countdown
9. **CTA #2** - Repeat button
10. **SOCIAL PROOF** - Customer testimonial
11. **CLOSING** - Emotional appeal
12. **P.S. SECTION** - Final urgency push (high-readership area)
13. **FOOTER** - Unsubscribe + contact info

---

## Key Conversion Elements

✅ **Emotional Triggers**: Exhaustion, hope, transformation
✅ **Scarcity**: 48-hour limited offer
✅ **Social Proof**: Believable testimonial
✅ **Value Stacking**: 20+ benefits listed
✅ **Multiple CTAs**: 3 call-to-action buttons
✅ **P.S. Section**: Highest-read email section utilized
✅ **Mobile-Responsive**: Optimized for all devices
✅ **Brand Consistency**: Purple gradient `#667eea → #764ba2`

---

## Testing Strategy

### Phase 1: Small Test (100 emails)
- 33 emails per variant (A/B/C)
- Test all 3 subject lines equally
- Track 24-hour performance

### Phase 2: Analysis
- Identify winning variant
- Analyze subject line performance
- Review conversion rates

### Phase 3: Scale Winner (900 emails)
- Send winning variant to full list
- Use best-performing subject line
- Monitor continuously

---

## Expected Performance

### Conservative
- **Open Rate**: 25-35%
- **Click Rate**: 5-10%
- **Conversion Rate**: 0.5-1.3%
- **Revenue**: 4,950 - 38,870 Ft (from 1,000 emails)

### Optimistic
- **Variant B** at 1.3%: 13 sales × 1,990 Ft = **25,870 Ft**
- **Variant C** at 0.8%: 8 sales × 2,990 Ft = **23,920 Ft**

---

## Files Reference

```
lib/email/
├── templates.ts              # Purchase confirmation emails
├── newsletter-templates.ts   # Campaign emails (A/B/C variants)
└── README.md                 # This file

scripts/
└── test-newsletter-templates.ts  # Preview generator

docs/
└── newsletter-campaign-guide.md  # Complete implementation guide

test-output/newsletter-emails/
├── variant-a-990ft.html      # Preview: Entry-level
├── variant-b-1990ft.html     # Preview: Best value
├── variant-c-2990ft.html     # Preview: Premium
└── CAMPAIGN-SUMMARY.txt      # Analysis report
```

---

## Documentation

📖 **Full Guide**: [`/docs/newsletter-campaign-guide.md`](../../docs/newsletter-campaign-guide.md)

Includes:
- Detailed technical implementation
- Campaign testing strategies
- Customization instructions
- Troubleshooting tips
- Future enhancement roadmap
- GDPR/CAN-SPAM compliance

---

## Brand Guidelines

### Colors (Spiritual Palette)
- **Primary**: `#667eea → #764ba2` (purple gradient)
- **Success**: `#48BB78` (green - healing)
- **Warning**: `#FC8181` (red - urgency)
- **Gold**: `#FFD700` (premium/badges)

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, readable)
- **Fallback**: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`)

### Tone of Voice
- **Language**: Hungarian (tegeződés - informal "you")
- **Style**: Empathetic, warm, spiritual, non-judgmental
- **Audience**: Women 35+, spirituality-focused

---

## Support

### Resend Configuration
- **Domain**: `eredeticsakra.hu` (must be verified)
- **Test Domain**: `onboarding@resend.dev` (for development)
- **API Key**: Set in `.env.local` as `RESEND_API_KEY`
- **Dashboard**: https://resend.com/emails

### Technical Issues
- Check `/docs/ai-context/project-structure.md`
- Review `CLAUDE.md` for project guidelines
- Contact: info@eredeticsakra.hu

---

**Last Updated**: 2025-11-05
**Status**: Production-Ready
**Conversion Goal**: 0.5-1.3% (5-13 sales per 1,000 emails)
