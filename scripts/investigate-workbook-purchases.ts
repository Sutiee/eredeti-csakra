/**
 * Investigation Script: Workbook Purchase Records
 *
 * This script investigates the Supabase purchase records to understand
 * the upsell flow and identify any data inconsistencies.
 *
 * Usage: npx tsx scripts/investigate-workbook-purchases.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function investigateWorkbookPurchases() {
  console.log('🔍 Investigating Workbook Purchase Records\n');
  console.log('=' .repeat(80));
  console.log('\n');

  // Query 1: Get all workbook_30day purchases
  console.log('📊 Query 1: All workbook_30day purchases (ordered by most recent)\n');
  const { data: workbookPurchases, error: workbookError } = await supabase
    .from('purchases')
    .select('*')
    .eq('product_id', 'workbook_30day')
    .order('created_at', { ascending: false })
    .limit(10);

  if (workbookError) {
    console.error('❌ Error fetching workbook purchases:', workbookError);
  } else if (!workbookPurchases || workbookPurchases.length === 0) {
    console.log('⚠️  No workbook_30day purchases found in the database.\n');
  } else {
    console.log(`✅ Found ${workbookPurchases.length} workbook purchase(s):\n`);
    workbookPurchases.forEach((purchase, index) => {
      console.log(`  [${index + 1}] Purchase ID: ${purchase.id}`);
      console.log(`      Result ID: ${purchase.result_id}`);
      console.log(`      Email: ${purchase.email}`);
      console.log(`      Product: ${purchase.product_name} (${purchase.product_id})`);
      console.log(`      Amount: ${purchase.amount} ${purchase.currency}`);
      console.log(`      Status: ${purchase.status}`);
      console.log(`      PDF URL: ${purchase.pdf_url || '(null - pending generation)'}`);
      console.log(`      Stripe Session ID: ${purchase.stripe_session_id}`);
      console.log(`      Created At: ${purchase.created_at}`);
      console.log(`      Updated At: ${purchase.updated_at || '(null)'}`);
      console.log('');
    });
  }

  console.log('-'.repeat(80));
  console.log('\n');

  // Query 2: Get all purchases (not just workbook) to see the full context
  console.log('📊 Query 2: All purchases (last 20, ordered by most recent)\n');
  const { data: allPurchases, error: allError } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (allError) {
    console.error('❌ Error fetching all purchases:', allError);
  } else if (!allPurchases || allPurchases.length === 0) {
    console.log('⚠️  No purchases found in the database.\n');
  } else {
    console.log(`✅ Found ${allPurchases.length} total purchase(s):\n`);

    // Group by result_id to understand the purchase flow
    const purchasesByResult = new Map<string, any[]>();
    allPurchases.forEach((purchase) => {
      const resultId = purchase.result_id || 'null';
      if (!purchasesByResult.has(resultId)) {
        purchasesByResult.set(resultId, []);
      }
      purchasesByResult.get(resultId)!.push(purchase);
    });

    purchasesByResult.forEach((purchases, resultId) => {
      console.log(`  Result ID: ${resultId}`);
      console.log(`  Email: ${purchases[0].email}`);
      console.log(`  Purchases (${purchases.length}):`);
      purchases.forEach((purchase) => {
        const createdAt = new Date(purchase.created_at);
        console.log(`    • ${purchase.product_id} - ${purchase.amount} ${purchase.currency} - ${purchase.status} - ${createdAt.toLocaleString()}`);
        if (purchase.product_id === 'workbook_30day') {
          console.log(`      ⚠️  WORKBOOK PURCHASE - PDF URL: ${purchase.pdf_url || '(null)'}`);
        }
      });
      console.log('');
    });
  }

  console.log('-'.repeat(80));
  console.log('\n');

  // Query 3: Check for purchases with status issues
  console.log('📊 Query 3: Purchases with potential issues\n');

  const { data: pendingPurchases, error: pendingError } = await supabase
    .from('purchases')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (pendingError) {
    console.error('❌ Error fetching pending purchases:', pendingError);
  } else if (!pendingPurchases || pendingPurchases.length === 0) {
    console.log('✅ No pending purchases found (all completed or failed).\n');
  } else {
    console.log(`⚠️  Found ${pendingPurchases.length} pending purchase(s):\n`);
    pendingPurchases.forEach((purchase) => {
      console.log(`  • ${purchase.product_id} - ${purchase.email} - Created: ${purchase.created_at}`);
    });
    console.log('');
  }

  const { data: failedPurchases, error: failedError } = await supabase
    .from('purchases')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false });

  if (failedError) {
    console.error('❌ Error fetching failed purchases:', failedError);
  } else if (!failedPurchases || failedPurchases.length === 0) {
    console.log('✅ No failed purchases found.\n');
  } else {
    console.log(`⚠️  Found ${failedPurchases.length} failed purchase(s):\n`);
    failedPurchases.forEach((purchase) => {
      console.log(`  • ${purchase.product_id} - ${purchase.email} - Created: ${purchase.created_at}`);
    });
    console.log('');
  }

  console.log('-'.repeat(80));
  console.log('\n');

  // Query 4: Workbook purchases with missing PDF URLs
  console.log('📊 Query 4: Workbook purchases with missing PDF URLs\n');
  const { data: noPdfPurchases, error: noPdfError } = await supabase
    .from('purchases')
    .select('*')
    .eq('product_id', 'workbook_30day')
    .is('pdf_url', null)
    .order('created_at', { ascending: false });

  if (noPdfError) {
    console.error('❌ Error fetching purchases with missing PDFs:', noPdfError);
  } else if (!noPdfPurchases || noPdfPurchases.length === 0) {
    console.log('✅ All workbook purchases have PDF URLs.\n');
  } else {
    console.log(`⚠️  Found ${noPdfPurchases.length} workbook purchase(s) WITHOUT PDF URLs:\n`);
    noPdfPurchases.forEach((purchase) => {
      const createdAt = new Date(purchase.created_at);
      const age = ((Date.now() - createdAt.getTime()) / 1000 / 60).toFixed(2);
      console.log(`  • Purchase ID: ${purchase.id}`);
      console.log(`    Email: ${purchase.email}`);
      console.log(`    Result ID: ${purchase.result_id}`);
      console.log(`    Status: ${purchase.status}`);
      console.log(`    Age: ${age} minutes`);
      console.log(`    Created: ${createdAt.toLocaleString()}`);
      console.log('');
    });
  }

  console.log('-'.repeat(80));
  console.log('\n');

  // Query 5: Check timing between purchases (upsell flow timing)
  console.log('📊 Query 5: Timing analysis for multi-purchase result_ids\n');

  if (allPurchases && allPurchases.length > 0) {
    const purchasesByResult = new Map<string, any[]>();
    allPurchases.forEach((purchase) => {
      const resultId = purchase.result_id || 'null';
      if (!purchasesByResult.has(resultId)) {
        purchasesByResult.set(resultId, []);
      }
      purchasesByResult.get(resultId)!.push(purchase);
    });

    // Filter for result_ids with multiple purchases (upsell flow)
    const multiPurchaseResults = Array.from(purchasesByResult.entries())
      .filter(([_, purchases]) => purchases.length > 1);

    if (multiPurchaseResults.length === 0) {
      console.log('⚠️  No result_ids found with multiple purchases.\n');
    } else {
      console.log(`✅ Found ${multiPurchaseResults.length} result_id(s) with multiple purchases:\n`);
      multiPurchaseResults.forEach(([resultId, purchases]) => {
        console.log(`  Result ID: ${resultId}`);
        console.log(`  Email: ${purchases[0].email}`);
        console.log(`  Total Purchases: ${purchases.length}`);

        // Sort by created_at to analyze timing
        const sorted = purchases.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        sorted.forEach((purchase, index) => {
          const createdAt = new Date(purchase.created_at);
          console.log(`    [${index + 1}] ${purchase.product_id}`);
          console.log(`        Time: ${createdAt.toLocaleString()}`);
          console.log(`        Status: ${purchase.status}`);
          console.log(`        Amount: ${purchase.amount} ${purchase.currency}`);

          if (index > 0) {
            const prevCreatedAt = new Date(sorted[index - 1].created_at);
            const timeDiff = (createdAt.getTime() - prevCreatedAt.getTime()) / 1000;
            console.log(`        Time since previous: ${timeDiff.toFixed(2)} seconds`);
          }

          if (purchase.product_id === 'workbook_30day') {
            console.log(`        PDF URL: ${purchase.pdf_url || '(null)'}`);
          }
        });
        console.log('');
      });
    }
  }

  console.log('=' .repeat(80));
  console.log('\n✅ Investigation complete!\n');
}

// Run investigation
investigateWorkbookPurchases().catch((error) => {
  console.error('\n❌ Investigation failed:', error);
  process.exit(1);
});
