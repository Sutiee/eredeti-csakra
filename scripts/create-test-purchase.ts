/**
 * Create test purchase record for testing success page
 * Run with: npx tsx scripts/create-test-purchase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestPurchase() {
  const testPurchase = {
    result_id: '00000000-0000-0000-0000-000000000001', // Same as quiz result
    email: 'teszt@eredeticsakra.hu',
    product_id: 'ai_analysis_pdf',
    product_name: 'Személyre Szabott Csakra Elemzés PDF',
    amount: 2990,
    currency: 'HUF',
    stripe_session_id: 'cs_test_b1A9RqU1hG665HjfT0sH35tZlulD9bvyp0gLxtFSPkiQeYzkxJ1bzIdGyk',
    stripe_payment_intent_id: 'pi_test_12345',
    status: 'completed',
    pdf_url: null, // Will be generated
  };

  console.log('Creating test purchase...');
  console.log('Product:', testPurchase.product_name);
  console.log('Result ID:', testPurchase.result_id);
  console.log('Session ID:', testPurchase.stripe_session_id);

  const { data, error } = await supabase
    .from('purchases')
    .insert(testPurchase)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating test purchase:', error);
    process.exit(1);
  }

  console.log('✅ Test purchase created successfully!');
  console.log('');
  console.log('Purchase ID:', data.id);
  console.log('PDF URL:', data.pdf_url || '(not generated yet)');
  console.log('');
  console.log('Test URLs:');
  console.log(`  Success page: http://localhost:3000/success/${testPurchase.result_id}?session_id=${testPurchase.stripe_session_id}`);
  console.log('');
  console.log('Next step: Trigger PDF generation');
  console.log(`  curl -X POST http://localhost:3000/api/generate-detailed-report-gpt5 \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"result_id": "${testPurchase.result_id}"}'`);
}

createTestPurchase();
