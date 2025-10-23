/**
 * Retry Script: Regenerate Failed Workbook Purchases
 *
 * Purpose: Manually trigger workbook generation for all purchases
 *          where pdf_url is null (failed generations).
 *
 * Usage:
 *   npx tsx scripts/retry-failed-workbooks.ts
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - NEXT_PUBLIC_SITE_URL in .env.local
 *
 * Safety:
 *   - Only processes purchases with null pdf_url
 *   - 5-second delay between requests to avoid rate limits
 *   - Logs all results for manual verification
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

interface FailedPurchase {
  id: string;
  result_id: string;
  email: string;
  created_at: string;
  amount: number;
}

/**
 * Find all workbook purchases without PDF URLs
 */
async function findFailedPurchases(): Promise<FailedPurchase[]> {
  console.log('🔍 Searching for failed workbook purchases...\n');

  const { data, error } = await supabase
    .from('purchases')
    .select('id, result_id, email, created_at, amount')
    .eq('product_id', 'workbook_30day')
    .is('pdf_url', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching failed purchases:', error);
    throw error;
  }

  return data || [];
}

/**
 * Trigger workbook generation for a single purchase
 */
async function triggerWorkbookGeneration(purchase: FailedPurchase): Promise<boolean> {
  const { result_id, email, created_at } = purchase;

  console.log(`📝 Processing: ${email}`);
  console.log(`   Result ID: ${result_id}`);
  console.log(`   Purchase Date: ${new Date(created_at).toLocaleString('hu-HU')}`);

  try {
    const response = await fetch(`${SITE_URL}/api/generate-workbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result_id }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS - Workbook generation triggered`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ FAILED - Status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION:`, error);
    return false;
  }
}

/**
 * Wait for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   WORKBOOK RETRY SCRIPT - Failed Purchase Recovery        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Find all failed purchases
  const failedPurchases = await findFailedPurchases();

  if (failedPurchases.length === 0) {
    console.log('✅ No failed purchases found! All workbooks have been generated.\n');
    return;
  }

  console.log(`📊 Found ${failedPurchases.length} failed workbook purchases\n`);
  console.log('─────────────────────────────────────────────────────────────\n');

  // Step 2: Confirm before proceeding
  console.log('⚠️  This will trigger workbook generation for all failed purchases.');
  console.log('⏱️  Estimated time: ~6 minutes per workbook\n');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await sleep(5000);

  // Step 3: Process each purchase
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < failedPurchases.length; i++) {
    const purchase = failedPurchases[i];

    console.log(`\n[${i + 1}/${failedPurchases.length}] Processing purchase ${purchase.id}`);
    console.log('─────────────────────────────────────────────────────────────');

    const success = await triggerWorkbookGeneration(purchase);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Wait 5 seconds between requests to avoid overwhelming the API
    if (i < failedPurchases.length - 1) {
      console.log(`\n⏳ Waiting 5 seconds before next request...\n`);
      await sleep(5000);
    }
  }

  // Step 4: Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      SUMMARY                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`Total Purchases: ${failedPurchases.length}`);
  console.log(`✅ Successfully Triggered: ${successCount}`);
  console.log(`❌ Failed to Trigger: ${failCount}\n`);

  if (successCount > 0) {
    console.log('⏱️  Workbook generation takes ~5-6 minutes per purchase.');
    console.log('📧 Check customer emails in ~10 minutes to verify delivery.\n');
  }

  if (failCount > 0) {
    console.log('⚠️  Some triggers failed. Check the logs above for details.');
    console.log('💡 You can re-run this script to retry failed purchases.\n');
  }

  // Step 5: Verification instructions
  console.log('🔍 VERIFICATION STEPS:');
  console.log('1. Wait 10-15 minutes for all PDFs to generate');
  console.log('2. Run this query in Supabase SQL Editor:');
  console.log('   SELECT COUNT(*) FROM purchases');
  console.log('   WHERE product_id = \'workbook_30day\' AND pdf_url IS NULL;');
  console.log('3. Result should be 0 (all PDFs generated)\n');
}

// Execute main function
main()
  .then(() => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed with error:', error);
    process.exit(1);
  });
