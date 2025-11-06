/**
 * Test Newsletter Email Templates
 * Usage: npx tsx scripts/test-newsletter-templates.ts
 *
 * This script generates sample emails for all 3 variants and saves them as HTML files for preview.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  generateNewsletterEmail,
  generateNewsletterEmailText,
  generateAllVariantPreviews,
  getAllSubjectLineVariants,
} from '../lib/email/newsletter-templates';

const OUTPUT_DIR = path.join(process.cwd(), 'test-output', 'newsletter-emails');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Generating newsletter email template previews...\n');

// Test data
const testData = {
  name: 'Katalin',
  campaignId: 'test-campaign-2025-01',
};

// Generate all variants
const previews = generateAllVariantPreviews(testData.name, testData.campaignId);

// Save Variant A (990 Ft)
console.log('📧 Variant A (990 Ft - Entry Level):');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'variant-a-990ft.html'),
  previews.variantA.html
);
console.log(`   Subject: ${previews.variantA.subject}`);
console.log(`   Preview: ${previews.variantA.previewText}`);
console.log(`   ✅ Saved to: variant-a-990ft.html\n`);

// Save Variant B (1,990 Ft) - Best Value
console.log('📧 Variant B (1,990 Ft - Best Value):');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'variant-b-1990ft.html'),
  previews.variantB.html
);
console.log(`   Subject: ${previews.variantB.subject}`);
console.log(`   Preview: ${previews.variantB.previewText}`);
console.log(`   ✅ Saved to: variant-b-1990ft.html\n`);

// Save Variant C (2,990 Ft) - Premium
console.log('📧 Variant C (2,990 Ft - Premium):');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'variant-c-2990ft.html'),
  previews.variantC.html
);
console.log(`   Subject: ${previews.variantC.subject}`);
console.log(`   Preview: ${previews.variantC.previewText}`);
console.log(`   ✅ Saved to: variant-c-2990ft.html\n`);

// Save plain text versions
console.log('📝 Plain Text Versions:');
const textA = generateNewsletterEmailText({
  name: testData.name,
  variantId: 'a',
  campaignId: testData.campaignId,
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'variant-a-990ft.txt'), textA);

const textB = generateNewsletterEmailText({
  name: testData.name,
  variantId: 'b',
  campaignId: testData.campaignId,
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'variant-b-1990ft.txt'), textB);

const textC = generateNewsletterEmailText({
  name: testData.name,
  variantId: 'c',
  campaignId: testData.campaignId,
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'variant-c-2990ft.txt'), textC);
console.log('   ✅ Saved all .txt versions\n');

// Display subject line options
console.log('📬 Subject Line Options for A/B Testing:');
previews.subjectLines.forEach((subject, index) => {
  console.log(`   ${index + 1}. ${subject}`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ All email templates generated successfully!');
console.log('='.repeat(70));
console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
console.log('\n💡 Next steps:');
console.log('   1. Open the HTML files in your browser to preview');
console.log('   2. Test responsive design by resizing browser window');
console.log('   3. Send test emails via Resend API');
console.log('   4. Track conversion rates for each variant\n');

// Generate a comparison summary
const summary = `
Newsletter Campaign Email Templates - Conversion Analysis
=========================================================

TARGET AUDIENCE: Hungarian women 35+, spirituality-focused
GOAL: 0.5-1.3% conversion rate (5-13 sales from 1000 emails)
CAMPAIGN: ${testData.campaignId}

VARIANT COMPARISON:
-------------------

Variant A: 990 Ft (Entry-Level)
- Original Price: 7,990 Ft
- Discount: 87%
- Badge: None
- Positioning: "Kezdd el most 990 Ft-ért"
- Strategy: Lowest barrier to entry, maximize volume
- Best for: Price-sensitive customers, impulse buyers

Variant B: 1,990 Ft (Best Value) ⭐
- Original Price: 7,990 Ft
- Discount: 75%
- Badge: "LEGJOBB ÉRTÉK"
- Positioning: "Fele áron, teljes elemzés"
- Strategy: Sweet spot pricing, value emphasis
- Best for: Decision-makers comparing options

Variant C: 2,990 Ft (Premium) 👑
- Original Price: 7,990 Ft
- Discount: 63%
- Badge: "PRÉMIUM MINŐSÉG"
- Positioning: "Professzionális, teljes körű értékelés"
- Strategy: Quality positioning, higher perceived value
- Best for: Quality-focused buyers, serious seekers

SUBJECT LINE OPTIONS:
--------------------
1. Problem-Focus: "Miért érzed magad kimerültnek naponta? 🌀"
2. Curiosity: "${testData.name}, csakráid üzennek neked... ✨"
3. Urgency: "⏰ Csak 48 órád maradt: Csakra Elemzés -87%"

EMAIL STRUCTURE (PAS Formula):
------------------------------
1. Header: Gradient background with emoji + headline
2. PROBLEM: Identify pain points (fatigue, emotions, relationships)
3. AGITATE: Deepen the pain, show consequences of inaction
4. SOLUTION: Chakra analysis as the answer
5. CTA #1: Primary call-to-action button
6. VALUE STACK: List all benefits (20+ items)
7. PRICING BOX: Variant-specific pricing with urgency
8. URGENCY TIMER: 48-hour countdown
9. CTA #2: Repeat call-to-action
10. SOCIAL PROOF: Customer testimonial
11. CLOSING: Emotional appeal
12. P.S. SECTION: High-readership area with final urgency push

KEY CONVERSION ELEMENTS:
-----------------------
✓ Emotional triggers (exhaustion, hope, transformation)
✓ Scarcity (48-hour limited offer)
✓ Social proof (believable testimonial)
✓ Value stacking (20+ benefits listed)
✓ Multiple CTAs (3 buttons throughout)
✓ P.S. section (highest-read email section)
✓ Mobile-responsive design
✓ Purple gradient brand consistency

TRACKING PARAMETERS:
-------------------
- variant: a/b/c (pricing test)
- campaign: ${testData.campaignId}
- resultId: [optional] for personalized follow-up

RECOMMENDED TESTING:
-------------------
1. Split test all 3 subject lines (33.3% each)
2. Evenly distribute pricing variants (33.3% each)
3. Track metrics: Open rate, click rate, conversion rate, revenue per email
4. Run for 48 hours, analyze results
5. Scale winner to full list

Expected Results (Conservative):
- Open Rate: 25-35% (engaging subject lines)
- Click Rate: 5-10% (strong CTA + urgency)
- Conversion Rate: 0.5-1.3% (5-13 sales from 1000)
- Average Order Value: 990-2,990 Ft depending on variant
- Total Revenue: 4,950-38,870 Ft from 1000 emails

Best Case Scenario (Optimistic):
- If Variant B wins at 1.3% conversion: 13 sales × 1,990 Ft = 25,870 Ft
- If Variant C wins at 0.8% conversion: 8 sales × 2,990 Ft = 23,920 Ft

Generated: ${new Date().toLocaleString('hu-HU')}
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'CAMPAIGN-SUMMARY.txt'), summary.trim());
console.log('📊 Campaign summary saved to: CAMPAIGN-SUMMARY.txt\n');
