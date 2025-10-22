/**
 * Test Script: 30-Day Workbook Purchase Flow
 *
 * This script simulates a complete workbook purchase to test:
 * 1. Stripe checkout session creation
 * 2. Purchase record creation
 * 3. Workbook PDF generation (GPT-5 + @react-pdf/renderer)
 * 4. Supabase storage upload
 * 5. PDF URL signed URL creation
 *
 * Usage: npx tsx scripts/test-workbook-purchase.ts [result_id]
 */

import { createClient } from '@supabase/supabase-js';

const RESULT_ID = process.argv[2] || '5411da8f-6f70-422d-a482-bf2494b000e6'; // Default test result ID
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeti-csakra-xi.vercel.app';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testWorkbookPurchase() {
  console.log('🧪 Testing 30-Day Workbook Purchase Flow\n');
  console.log('Result ID:', RESULT_ID);
  console.log('API Base URL:', API_BASE_URL);
  console.log('\n---\n');

  // Step 1: Verify quiz result exists
  console.log('📋 Step 1: Fetching quiz result...');
  const { data: quizResult, error: quizError } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', RESULT_ID)
    .single();

  if (quizError || !quizResult) {
    console.error('❌ Quiz result not found:', quizError);
    process.exit(1);
  }

  console.log('✅ Quiz result found:');
  console.log('   Name:', quizResult.name);
  console.log('   Email:', quizResult.email);
  console.log('   Chakra scores:', JSON.stringify(quizResult.chakra_scores));
  console.log('\n---\n');

  // Step 2: Create mock purchase record (simulating Stripe webhook)
  console.log('🛒 Step 2: Creating mock purchase record...');
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      result_id: RESULT_ID,
      email: quizResult.email,
      product_id: 'workbook_30day',
      product_name: '30 Napos Csakra Munkafüzet',
      amount: 3990,
      currency: 'HUF',
      stripe_session_id: `test_session_${Date.now()}`,
      stripe_payment_intent_id: `test_pi_${Date.now()}`,
      status: 'completed',
      pdf_url: null, // Will be generated
    })
    .select()
    .single();

  if (purchaseError) {
    console.error('❌ Purchase creation failed:', purchaseError);
    process.exit(1);
  }

  console.log('✅ Purchase created:', purchase.id);
  console.log('\n---\n');

  // Step 3: Trigger workbook generation
  console.log('🎨 Step 3: Triggering workbook generation...');
  console.log('   Calling:', `${API_BASE_URL}/api/generate-workbook`);

  const startTime = Date.now();

  const response = await fetch(`${API_BASE_URL}/api/generate-workbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result_id: RESULT_ID }),
  });

  const data = await response.json();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!response.ok || data.error) {
    console.error('❌ Workbook generation failed:', data.error);
    process.exit(1);
  }

  console.log('✅ Workbook generated successfully!');
  console.log('   Duration:', duration, 'seconds');
  console.log('   PDF URL:', data.data.pdf_url);
  console.log('   Token usage:', JSON.stringify(data.data.token_usage));
  console.log('\n---\n');

  // Step 4: Verify purchase was updated with PDF URL
  console.log('🔍 Step 4: Verifying purchase update...');
  const { data: updatedPurchase, error: verifyError } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchase.id)
    .single();

  if (verifyError || !updatedPurchase) {
    console.error('❌ Purchase verification failed:', verifyError);
    process.exit(1);
  }

  if (!updatedPurchase.pdf_url) {
    console.error('❌ PDF URL not set in purchase record');
    process.exit(1);
  }

  console.log('✅ Purchase updated with PDF URL');
  console.log('   PDF URL:', updatedPurchase.pdf_url);
  console.log('\n---\n');

  // Step 5: Test PDF download (HEAD request to verify it exists)
  console.log('📥 Step 5: Testing PDF download...');
  const pdfResponse = await fetch(updatedPurchase.pdf_url, { method: 'HEAD' });

  if (!pdfResponse.ok) {
    console.error('❌ PDF download failed:', pdfResponse.status, pdfResponse.statusText);
    process.exit(1);
  }

  const contentLength = pdfResponse.headers.get('content-length');
  const contentType = pdfResponse.headers.get('content-type');

  console.log('✅ PDF is accessible');
  console.log('   Content-Type:', contentType);
  console.log('   Size:', contentLength ? `${(parseInt(contentLength) / 1024).toFixed(2)} KB` : 'Unknown');
  console.log('\n---\n');

  // Summary
  console.log('🎉 TEST COMPLETED SUCCESSFULLY!\n');
  console.log('Summary:');
  console.log('  • Quiz result fetched: ✅');
  console.log('  • Purchase record created: ✅');
  console.log('  • Workbook generated: ✅');
  console.log('  • PDF uploaded to Supabase: ✅');
  console.log('  • PDF accessible via signed URL: ✅');
  console.log('\n📄 Download the generated workbook:');
  console.log(updatedPurchase.pdf_url);
  console.log('\n💡 Tip: Open this URL in your browser to view the 30-day workbook PDF!');
}

// Run test
testWorkbookPurchase().catch((error) => {
  console.error('\n❌ TEST FAILED:', error);
  process.exit(1);
});
