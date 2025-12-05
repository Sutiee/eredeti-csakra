import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseClient } from '@/lib/supabase/client';
import { decrypt } from '@/lib/bulk-sender/encryption';
import { replacePlaceholders } from '@/lib/bulk-sender/placeholder';
import type {
  BulkSenderRecipient,
  BulkSenderApiResponse,
  BulkSenderSettings,
  BulkSenderUnsubscribe,
  BulkSenderHistory,
} from '@/types';

// Vercel Pro allows up to 300 seconds (5 minutes) for serverless functions
// This is needed for large email lists (e.g., 30,000 emails = ~300 batches = ~45 seconds minimum)
export const maxDuration = 300;

type SendEmailRequest = {
  recipients: BulkSenderRecipient[];
  subject: string;
  htmlContent: string;
};

type SendEmailResponse = {
  historyId: string;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
};

/**
 * Check if user is authenticated via bulk_sender_auth cookie
 */
function checkAuthentication(request: NextRequest): boolean {
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

/**
 * POST: Send bulk emails to recipients
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<SendEmailResponse>>> {
  try {
    // 1. Check authentication
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: SendEmailRequest = await request.json();
    const { recipients, subject, htmlContent } = body;

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!htmlContent || htmlContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase client
    const supabase = createSupabaseClient();

    // 4. Load settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('bulk_sender_settings')
      .select('*')
      .single();

    if (settingsError || !settingsData) {
      return NextResponse.json(
        { success: false, error: 'Failed to load settings. Please configure settings first.' },
        { status: 500 }
      );
    }

    const settings = settingsData as BulkSenderSettings;

    // Validate settings
    if (!settings.resend_api_key || !settings.from_email || !settings.from_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete settings. Please configure Resend API key, from email, and from name.',
        },
        { status: 400 }
      );
    }

    // 5. Decrypt API key
    let resendApiKey: string;
    try {
      resendApiKey = decrypt(settings.resend_api_key);
    } catch (error) {
      console.error('[BULK_SENDER_SEND] Decryption error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to decrypt API key. Please reconfigure settings.' },
        { status: 500 }
      );
    }

    // 6. Load unsubscribe list
    const { data: unsubscribesData } = await supabase
      .from('bulk_sender_unsubscribes')
      .select('email');

    const unsubscribeEmails = new Set(
      (unsubscribesData as BulkSenderUnsubscribe[] || []).map((u) => u.email.toLowerCase())
    );

    // 7. Filter out unsubscribed emails
    const filteredRecipients = recipients.filter(
      (recipient) => !unsubscribeEmails.has(recipient.email.toLowerCase())
    );

    const skippedCount = recipients.length - filteredRecipients.length;

    if (filteredRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All recipients are unsubscribed. No emails to send.',
        },
        { status: 400 }
      );
    }

    // 8. Initialize Resend client
    const resend = new Resend(resendApiKey);

    // 9. Prepare emails with placeholder replacement
    const emails = filteredRecipients.map((recipient) => ({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: recipient.email,
      subject: replacePlaceholders(subject, recipient),
      html: replacePlaceholders(htmlContent, recipient),
    }));

    // 10. Send emails using Resend batch API
    let sentCount = 0;
    let failedCount = 0;
    const errorLog: Record<string, string>[] = [];

    // Resend limits:
    // - batch.send() supports up to 100 emails per request
    // - Rate limit: 10 requests/second (free), 100 requests/second (paid)
    // - Daily limit depends on plan
    const BATCH_SIZE = 100;
    const DELAY_BETWEEN_BATCHES_MS = 150; // ~6-7 batches/second, safe for rate limits
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    // Helper function to delay
    const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

    // Helper function to send with retry
    const sendBatchWithRetry = async (
      batch: typeof emails,
      retries: number = 0
    ): Promise<{ sent: number; failed: number; error?: string }> => {
      try {
        const result = await resend.batch.send(batch);

        if (result.error) {
          // Check if rate limited
          if (result.error.message?.includes('rate') && retries < MAX_RETRIES) {
            console.log(`[BULK_SENDER_SEND] Rate limited, retrying in ${RETRY_DELAY_MS}ms...`);
            await delay(RETRY_DELAY_MS * (retries + 1)); // Exponential backoff
            return sendBatchWithRetry(batch, retries + 1);
          }
          return { sent: 0, failed: batch.length, error: result.error.message };
        }

        return { sent: batch.length, failed: 0 };
      } catch (error) {
        if (retries < MAX_RETRIES) {
          console.log(`[BULK_SENDER_SEND] Error, retrying in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS * (retries + 1));
          return sendBatchWithRetry(batch, retries + 1);
        }
        return {
          sent: 0,
          failed: batch.length,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    };

    try {
      // Split into batches
      const batches: typeof emails[] = [];
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        batches.push(emails.slice(i, i + BATCH_SIZE));
      }

      console.log(`[BULK_SENDER_SEND] Sending ${emails.length} emails in ${batches.length} batches`);

      // Process batches with rate limiting
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const result = await sendBatchWithRetry(batch);

        sentCount += result.sent;
        failedCount += result.failed;

        if (result.error) {
          errorLog.push({
            batch: `Batch ${i + 1}: ${batch[0].to} - ${batch[batch.length - 1].to}`,
            error: result.error,
          });
        }

        // Log progress every 10 batches
        if ((i + 1) % 10 === 0 || i === batches.length - 1) {
          console.log(`[BULK_SENDER_SEND] Progress: ${i + 1}/${batches.length} batches, ${sentCount} sent, ${failedCount} failed`);
        }

        // Delay between batches (except for the last one)
        if (i < batches.length - 1) {
          await delay(DELAY_BETWEEN_BATCHES_MS);
        }
      }
    } catch (error) {
      console.error('[BULK_SENDER_SEND] Send error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // 11. Determine status
    let status: BulkSenderHistory['status'];
    if (failedCount === 0) {
      status = 'completed';
    } else if (sentCount > 0) {
      status = 'partial';
    } else {
      status = 'failed';
    }

    // 12. Log to bulk_sender_history table
    const { data: historyData, error: historyError } = await supabase
      .from('bulk_sender_history')
      .insert({
        subject,
        recipient_count: filteredRecipients.length,
        sent_count: sentCount,
        failed_count: failedCount,
        skipped_count: skippedCount,
        status,
        error_log: errorLog.length > 0 ? errorLog : null,
      })
      .select()
      .single();

    if (historyError || !historyData) {
      console.error('[BULK_SENDER_SEND] History log error:', historyError);
      // Don't fail the request if logging fails
    }

    const historyId = historyData?.id || 'unknown';

    // 13. Return success response
    return NextResponse.json({
      success: true,
      data: {
        historyId,
        sentCount,
        failedCount,
        skippedCount,
      },
      message: `Successfully sent ${sentCount} email(s). ${failedCount} failed. ${skippedCount} skipped (unsubscribed).`,
    });
  } catch (error) {
    console.error('[BULK_SENDER_SEND] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
