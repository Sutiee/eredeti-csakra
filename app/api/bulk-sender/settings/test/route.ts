import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { decrypt } from '@/lib/bulk-sender/encryption';
import type { BulkSenderApiResponse } from '@/types';
import { Resend } from 'resend';

/**
 * Verify authentication by checking the bulk_sender_auth cookie
 */
function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get('bulk_sender_auth')?.value;

  if (!token) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.authenticated && decoded.expires > Date.now();
  } catch {
    return false;
  }
}

// POST: Test email settings by sending a test email
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ emailId: string }>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { test_email } = body;

    // Validate test email
    if (!test_email) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(test_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid test email format' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Fetch settings from database
    const { data: settings, error: dbError } = await supabase
      .from('bulk_sender_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError || !settings) {
      return NextResponse.json(
        { success: false, error: 'No settings found. Please configure settings first.' },
        { status: 400 }
      );
    }

    // Validate settings
    if (!settings.resend_api_key || !settings.from_email || !settings.from_name) {
      return NextResponse.json(
        { success: false, error: 'Incomplete settings. Please configure all required fields.' },
        { status: 400 }
      );
    }

    // Decrypt API key
    let decryptedApiKey: string;
    try {
      decryptedApiKey = decrypt(settings.resend_api_key);
    } catch (error) {
      console.error('[BULK_SENDER_SETTINGS_TEST] Decryption error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to decrypt API key' },
        { status: 500 }
      );
    }

    // Initialize Resend client
    const resend = new Resend(decryptedApiKey);

    // Send test email
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: `${settings.from_name} <${settings.from_email}>`,
        to: test_email,
        subject: 'Test Email - Bulk Sender Settings',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Test Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Test Email Successful</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  This is a test email from your Bulk Sender configuration.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                  <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Configuration Details</h2>
                  <p style="margin: 10px 0;">
                    <strong>From Name:</strong> ${settings.from_name}
                  </p>
                  <p style="margin: 10px 0;">
                    <strong>From Email:</strong> ${settings.from_email}
                  </p>
                  <p style="margin: 10px 0;">
                    <strong>Test Recipient:</strong> ${test_email}
                  </p>
                  <p style="margin: 10px 0;">
                    <strong>Test Time:</strong> ${new Date().toLocaleString('hu-HU')}
                  </p>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  If you received this email, your Bulk Sender settings are configured correctly and ready to use.
                </p>
              </div>
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999; margin: 0;">
                  Sent via Bulk Sender - Eredeti Csakra
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('[BULK_SENDER_SETTINGS_TEST] Resend error:', emailError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to send test email: ${emailError.message || 'Unknown error'}`
          },
          { status: 500 }
        );
      }

      if (!emailData?.id) {
        return NextResponse.json(
          { success: false, error: 'No email ID returned from Resend' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { emailId: emailData.id },
        message: `Test email sent successfully to ${test_email}`,
      });
    } catch (error) {
      console.error('[BULK_SENDER_SETTINGS_TEST] Send error:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid Resend API key. Please check your settings.' },
          { status: 401 }
        );
      }

      if (errorMessage.includes('domain')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Domain not verified in Resend. Please verify your sending domain or use onboarding@resend.dev for testing.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Failed to send test email: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[BULK_SENDER_SETTINGS_TEST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test email settings' },
      { status: 500 }
    );
  }
}
