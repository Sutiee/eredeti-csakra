/**
 * Direct Resend API Test Script
 * Tests email sending directly via Resend SDK (bypassing Next.js API)
 *
 * Usage:
 *   npx tsx scripts/test-resend-direct.ts
 */

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendEmail() {
  console.log('🧪 Testing Resend Email...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || '❌ Missing'}\n`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env.local');
    process.exit(1);
  }

  try {
    console.log('📤 Sending test email...');

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'test@example.com', // Change this to your email for actual testing
      subject: '🧪 Resend Test Email - Eredeti Csakra',
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email from Eredeti Csakra Resend integration.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>From:</strong> ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}</p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('\n❌ Resend API Error:', error);
      console.error('\n🔍 Possible Issues:');
      console.error('  1. Invalid API key');
      console.error('  2. Domain not verified (if using custom domain)');
      console.error('  3. Rate limit exceeded');
      console.error('  4. Invalid sender email address\n');
      process.exit(1);
    }

    console.log('\n✅ Email sent successfully!');
    console.log('📧 Email ID:', data?.id);
    console.log('\n📊 Next Steps:');
    console.log('  1. Check Resend Dashboard: https://resend.com/emails');
    console.log('  2. Verify domain if using custom email');
    console.log('  3. Check recipient inbox (may be in spam)');
    console.log('  4. Try sending to real email address (change "to" field)\n');
  } catch (err) {
    console.error('\n❌ Unexpected Error:', err);
    process.exit(1);
  }
}

testResendEmail();
