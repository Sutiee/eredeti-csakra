/**
 * Direct Email Testing Script (Resend API)
 *
 * Tests the email sending directly using Resend API
 * Bypasses the Next.js API route to test templates
 *
 * Usage:
 * npx tsx scripts/test-email-direct.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Resend } from 'resend';
import {
  generatePurchaseConfirmationEmail,
  generatePurchaseConfirmationEmailText,
} from '../lib/email/templates';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const TEST_EMAIL = 'laszlo.s.szabo@ecomxpert.hu';
const TEST_NAME = 'Teszt László';
const TEST_RESULT_ID = '00000000-0000-0000-0000-000000000000';

interface TestEmailParams {
  productType: 'ai_analysis_pdf' | 'workbook_30day';
  productName: string;
}

async function sendTestEmail(
  resend: Resend,
  params: TestEmailParams
): Promise<void> {
  const { productType, productName } = params;

  console.log('\n📧 Teszt email küldése...');
  console.log(`   Termék típus: ${productType}`);
  console.log(`   Termék név: ${productName}`);
  console.log(`   Email cím: ${TEST_EMAIL}`);
  console.log(`   Név: ${TEST_NAME}`);

  try {
    // Generate email content using our templates
    const emailHtml = generatePurchaseConfirmationEmail({
      name: TEST_NAME,
      downloadUrl: 'https://example.com/test-pdf-download-link',
      resultId: TEST_RESULT_ID,
      productName: productName,
      productType: productType,
    });

    const emailText = generatePurchaseConfirmationEmailText({
      name: TEST_NAME,
      downloadUrl: 'https://example.com/test-pdf-download-link',
      resultId: TEST_RESULT_ID,
      productName: productName,
      productType: productType,
    });

    // Dynamic subject line
    const subject =
      productType === 'workbook_30day'
        ? 'Készen áll a 30 Napos Csakra Munkafüzeted! 📖'
        : 'Köszönjük a vásárlásod! - Személyre Szabott Csakra Elemzésed';

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's test domain
      to: [TEST_EMAIL],
      subject: `[TESZT] ${subject}`,
      html: emailHtml,
      text: emailText,
      tags: [
        { name: 'type', value: 'test-email' },
        { name: 'product_type', value: productType },
        { name: 'result_id', value: TEST_RESULT_ID },
      ],
    });

    if (error) {
      console.error('❌ Resend API hiba:', error);
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    console.log('✅ Email sikeresen elküldve!');
    console.log(`   Email ID: ${data?.id}`);
    console.log(`   Resend Dashboard: https://resend.com/emails/${data?.id}`);
  } catch (error) {
    console.error('❌ Hiba történt:', error);
    throw error;
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 Direct Email Teszt Program (Resend API)');
  console.log('='.repeat(60));

  // Ellenőrizzük a szükséges környezeti változókat
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Hiányzó RESEND_API_KEY környezeti változó!');
    process.exit(1);
  }

  console.log('\n✅ Környezeti változók rendben');
  console.log(
    `   RESEND_API_KEY: ${process.env.RESEND_API_KEY.substring(0, 10)}...`
  );
  console.log(
    `   Test from: onboarding@resend.dev (Resend test domain)`
  );
  console.log(`   Test to: ${TEST_EMAIL}`);

  // Initialize Resend client
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Teszt 1: AI Analysis PDF
    console.log('\n' + '='.repeat(60));
    console.log('TESZT #1: AI Csakra Elemzés PDF');
    console.log('='.repeat(60));
    await sendTestEmail(resend, {
      productType: 'ai_analysis_pdf',
      productName: 'Személyre Szabott Csakra Elsősegély Csomag',
    });

    // Várunk 2 másodpercet a következő email előtt
    console.log('\n⏳ Várakozás 2 másodperc...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Teszt 2: 30-Day Workbook
    console.log('\n' + '='.repeat(60));
    console.log('TESZT #2: 30 Napos Csakra Munkafüzet');
    console.log('='.repeat(60));
    await sendTestEmail(resend, {
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
    console.log('\n⚠️  Fontos:');
    console.log(
      '   - Ezek a teszt emailek onboarding@resend.dev címről érkeznek'
    );
    console.log(
      '   - Production-ban az eredeticsakra.hu domain-t kell hitelesíteni'
    );
    console.log(
      '   - Domain hitelesítés: https://resend.com/domains'
    );
    console.log('');
  } catch (error) {
    console.error('\n❌ A teszt sikertelen volt!');
    console.error('Ellenőrizd a következőket:');
    console.error('  1. A RESEND_API_KEY helyes?');
    console.error('  2. Van internet kapcsolat?');
    console.error('  3. A Resend account aktív?');
    console.error('');
    process.exit(1);
  }
}

// Futtassuk a teszteket
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
