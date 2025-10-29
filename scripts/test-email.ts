/**
 * Email Testing Script
 *
 * Tests the email sending functionality for both product types
 *
 * Usage:
 * npx tsx scripts/test-email.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const TEST_EMAIL = 'laszlo.s.szabo@ecomxpert.hu';
const TEST_NAME = 'Teszt László';
const TEST_RESULT_ID = '00000000-0000-0000-0000-000000000000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface TestEmailParams {
  productType: 'ai_analysis_pdf' | 'workbook_30day';
  productName: string;
}

async function sendTestEmail(params: TestEmailParams): Promise<void> {
  const { productType, productName } = params;

  console.log('\n📧 Teszt email küldése...');
  console.log(`   Termék típus: ${productType}`);
  console.log(`   Termék név: ${productName}`);
  console.log(`   Email cím: ${TEST_EMAIL}`);
  console.log(`   Név: ${TEST_NAME}`);

  try {
    const response = await fetch(`${SITE_URL}/api/send-purchase-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        downloadUrl: 'https://example.com/test-pdf-download-link',
        resultId: TEST_RESULT_ID,
        productName: productName,
        productType: productType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Email küldés sikertelen:', errorData);
      throw new Error(`Email send failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email sikeresen elküldve!');
    console.log(`   Email ID: ${data.data?.emailId}`);
    console.log(`   Resend Dashboard: https://resend.com/emails/${data.data?.emailId}`);
  } catch (error) {
    console.error('❌ Hiba történt:', error);
    throw error;
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 Email Teszt Program');
  console.log('='.repeat(60));

  // Ellenőrizzük a szükséges környezeti változókat
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Hiányzó RESEND_API_KEY környezeti változó!');
    process.exit(1);
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ Hiányzó RESEND_FROM_EMAIL környezeti változó!');
    process.exit(1);
  }

  console.log('\n✅ Környezeti változók rendben');
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
  console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL}`);
  console.log(`   SITE_URL: ${SITE_URL}`);

  // Indítsuk el a Next.js szervert, ha még nem fut
  console.log('\n⚠️  Győződj meg róla, hogy a Next.js szerver fut!');
  console.log('   (Futtasd: npm run dev)');
  console.log('\nFolytatás 5 másodperc múlva...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Teszt 1: AI Analysis PDF
    console.log('\n' + '='.repeat(60));
    console.log('TESZT #1: AI Csakra Elemzés PDF');
    console.log('='.repeat(60));
    await sendTestEmail({
      productType: 'ai_analysis_pdf',
      productName: 'Személyre Szabott Csakra Elsősegély Csomag',
    });

    // Várunk 2 másodpercet a következő email előtt
    console.log('\n⏳ Várakozás 2 másodperc...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teszt 2: 30-Day Workbook
    console.log('\n' + '='.repeat(60));
    console.log('TESZT #2: 30 Napos Csakra Munkafüzet');
    console.log('='.repeat(60));
    await sendTestEmail({
      productType: 'workbook_30day',
      productName: '30 Napos Csakra Munkafüzet',
    });

    // Összegzés
    console.log('\n' + '='.repeat(60));
    console.log('✅ MINDEN TESZT SIKERES!');
    console.log('='.repeat(60));
    console.log('\n📬 Ellenőrizd az email fiókodat:');
    console.log(`   ${TEST_EMAIL}`);
    console.log('\n📊 Resend Dashboard:');
    console.log('   https://resend.com/emails');
    console.log('\n💡 Tippek:');
    console.log('   - Ellenőrizd a spam mappát is');
    console.log('   - Az emailek 1-2 percen belül meg kell, hogy érkezzenek');
    console.log('   - Ha nem érkeznek meg, ellenőrizd a Resend Dashboard-ot');
    console.log('');

  } catch (error) {
    console.error('\n❌ A teszt sikertelen volt!');
    console.error('Ellenőrizd a következőket:');
    console.error('  1. A Next.js szerver fut? (npm run dev)');
    console.error('  2. A RESEND_API_KEY helyes?');
    console.error('  3. A RESEND_FROM_EMAIL domain hitelesítve van?');
    console.error('');
    process.exit(1);
  }
}

// Futtassuk a teszteket
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
