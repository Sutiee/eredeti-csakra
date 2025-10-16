/**
 * Create Stripe Products Script
 * Creates the two new products for the upsell flow
 *
 * Run: npx tsx scripts/create-stripe-products.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

async function createProducts() {
  console.log('🚀 Creating Stripe products...\n');

  try {
    // 1. Create "AI Csakra Elemzés PDF" product
    console.log('📄 Creating: AI Csakra Elemzés PDF (2990 HUF)...');
    const aiAnalysisProduct = await stripe.products.create({
      name: 'AI Csakra Elemzés PDF',
      description: '20+ oldalas AI-generált személyre szabott csakra jelentés a 7 csakra részletes diagnosztikájával, konkrét gyakorlatokkal és 7 napos akciótervvel.',
      metadata: {
        product_type: 'ai_pdf',
        is_entry_product: 'true',
        ai_generated: 'true',
      },
    });

    const aiAnalysisPrice = await stripe.prices.create({
      product: aiAnalysisProduct.id,
      unit_amount: 299000, // 2990 HUF in fillér (cents)
      currency: 'huf',
      metadata: {
        display_price: '2990',
      },
    });

    console.log('✅ AI Elemzés Product created!');
    console.log(`   Product ID: ${aiAnalysisProduct.id}`);
    console.log(`   Price ID: ${aiAnalysisPrice.id}\n`);

    // 2. Create "30 Napos Csakra Munkafüzet" product
    console.log('📘 Creating: 30 Napos Csakra Munkafüzet (3990 HUF)...');
    const workbookProduct = await stripe.products.create({
      name: '30 Napos Csakra Munkafüzet',
      description: 'Személyre szabott 30 napos gyakorlati program napi meditációkkal, journaling kérdésekkel, heti értékelő lapokkal és konkrét csakra gyakorlatokkal.',
      metadata: {
        product_type: 'workbook',
        is_upsell: 'true',
        original_price: '9990',
      },
    });

    const workbookPrice = await stripe.prices.create({
      product: workbookProduct.id,
      unit_amount: 399000, // 3990 HUF in fillér
      currency: 'huf',
      metadata: {
        display_price: '3990',
        original_price: '9990',
        discount_percent: '60',
      },
    });

    console.log('✅ Munkafüzet Product created!');
    console.log(`   Product ID: ${workbookProduct.id}`);
    console.log(`   Price ID: ${workbookPrice.id}\n`);

    // 3. Print summary for .env.local
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Add these to your .env.local file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('# AI Csakra Elemzés PDF (2990 HUF)');
    console.log(`STRIPE_PRODUCT_ID_AI_ANALYSIS=${aiAnalysisProduct.id}`);
    console.log(`STRIPE_PRICE_ID_AI_ANALYSIS=${aiAnalysisPrice.id}\n`);
    console.log('# 30 Napos Csakra Munkafüzet (3990 HUF - Upsell)');
    console.log(`STRIPE_PRODUCT_ID_WORKBOOK=${workbookProduct.id}`);
    console.log(`STRIPE_PRICE_ID_WORKBOOK=${workbookPrice.id}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 All products created successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Copy the environment variables above to .env.local');
    console.log('   2. Also add them to Vercel environment variables');
    console.log('   3. Continue with code implementation\n');

  } catch (error) {
    console.error('❌ Error creating products:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createProducts();
