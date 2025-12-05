import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseClient } from '@/lib/supabase/client';
import { decrypt } from '@/lib/bulk-sender/encryption';
import { replacePlaceholders } from '@/lib/bulk-sender/placeholder';
import type { BulkSenderApiResponse, BulkSenderSettings } from '@/types';

// Allow longer execution for batch processing
export const maxDuration = 60;

type ProcessResult = {
  batchNumber: number;
  sent: number;
  failed: number;
  jobCompleted: boolean;
  nextBatchIn: number | null;
};

function checkAuthentication(request: NextRequest): boolean {
  const token = request.cookies.get('bulk_sender_auth')?.value;
  if (!token) return false;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.authenticated && decoded.expires > Date.now();
  } catch {
    return false;
  }
}

/**
 * POST: Process the next batch of emails for a job
 * This is called repeatedly from the frontend to process batches with delays
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BulkSenderApiResponse<ProcessResult>>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const supabase = createSupabaseClient();

    // Get job
    const { data: jobData, error: jobError } = await supabase
      .from('bulk_sender_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is in processable state
    if (jobData.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: `Job is ${jobData.status}, not processing` },
        { status: 400 }
      );
    }

    // Get settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('bulk_sender_settings')
      .select('*')
      .single();

    if (settingsError || !settingsData) {
      return NextResponse.json(
        { success: false, error: 'Settings not configured' },
        { status: 500 }
      );
    }

    const settings = settingsData as BulkSenderSettings;

    if (!settings.resend_api_key || !settings.from_email || !settings.from_name) {
      return NextResponse.json(
        { success: false, error: 'Incomplete email settings' },
        { status: 500 }
      );
    }

    // Decrypt API key
    let resendApiKey: string;
    try {
      resendApiKey = decrypt(settings.resend_api_key);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to decrypt API key' },
        { status: 500 }
      );
    }

    // Get next batch of pending recipients
    const { data: recipientsData, error: recipientsError } = await supabase
      .from('bulk_sender_job_recipients')
      .select('id, email, name, batch_number')
      .eq('job_id', jobId)
      .eq('status', 'pending')
      .order('batch_number', { ascending: true })
      .limit(jobData.batch_size);

    if (recipientsError) {
      console.error('[PROCESS] Failed to get recipients:', recipientsError);
      return NextResponse.json(
        { success: false, error: 'Failed to get recipients' },
        { status: 500 }
      );
    }

    // If no more pending recipients, job is complete
    if (!recipientsData || recipientsData.length === 0) {
      await supabase
        .from('bulk_sender_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Also log to history
      await supabase.from('bulk_sender_history').insert({
        subject: jobData.subject,
        recipient_count: jobData.total_recipients,
        sent_count: jobData.sent_count,
        failed_count: jobData.failed_count,
        skipped_count: jobData.skipped_count,
        status: jobData.failed_count > 0 ? 'partial' : 'completed',
        error_log: jobData.error_log,
      });

      return NextResponse.json({
        success: true,
        data: {
          batchNumber: jobData.current_batch,
          sent: 0,
          failed: 0,
          jobCompleted: true,
          nextBatchIn: null,
        },
        message: 'Job completed!',
      });
    }

    const currentBatch = recipientsData[0].batch_number;

    // Prepare emails
    const resend = new Resend(resendApiKey);
    const emails = recipientsData.map((recipient) => ({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: recipient.email,
      subject: replacePlaceholders(jobData.subject, { email: recipient.email, name: recipient.name || undefined }),
      html: replacePlaceholders(jobData.html_content, { email: recipient.email, name: recipient.name || undefined }),
    }));

    // Send batch
    let sentCount = 0;
    let failedCount = 0;
    const errorLog: Record<string, string>[] = [];

    try {
      const result = await resend.batch.send(emails);

      if (result.error) {
        console.error('[PROCESS] Batch send error:', result.error);
        failedCount = recipientsData.length;
        errorLog.push({ batch: `Batch ${currentBatch}`, error: result.error.message || 'Unknown error' });

        // Mark all as failed
        await supabase
          .from('bulk_sender_job_recipients')
          .update({
            status: 'failed',
            error_message: result.error.message,
          })
          .in('id', recipientsData.map((r) => r.id));
      } else {
        sentCount = recipientsData.length;

        // Mark all as sent
        await supabase
          .from('bulk_sender_job_recipients')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .in('id', recipientsData.map((r) => r.id));
      }
    } catch (error) {
      console.error('[PROCESS] Send error:', error);
      failedCount = recipientsData.length;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorLog.push({ batch: `Batch ${currentBatch}`, error: errorMessage });

      // Mark all as failed
      await supabase
        .from('bulk_sender_job_recipients')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .in('id', recipientsData.map((r) => r.id));
    }

    // Update job progress
    const existingLog = Array.isArray(jobData.error_log) ? jobData.error_log : [];
    const updatedErrorLog = errorLog.length > 0
      ? [...existingLog, ...errorLog]
      : existingLog.length > 0
        ? existingLog
        : null;

    await supabase
      .from('bulk_sender_jobs')
      .update({
        current_batch: currentBatch + 1,
        sent_count: jobData.sent_count + sentCount,
        failed_count: jobData.failed_count + failedCount,
        error_log: updatedErrorLog,
      })
      .eq('id', jobId);

    // Check if there are more batches
    const { count: pendingCount } = await supabase
      .from('bulk_sender_job_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('status', 'pending');

    const hasMore = (pendingCount || 0) > 0;

    return NextResponse.json({
      success: true,
      data: {
        batchNumber: currentBatch,
        sent: sentCount,
        failed: failedCount,
        jobCompleted: !hasMore,
        nextBatchIn: hasMore ? jobData.delay_between_batches_ms : null,
      },
      message: `Batch ${currentBatch + 1}/${jobData.total_batches} processed: ${sentCount} sent, ${failedCount} failed`,
    });
  } catch (error) {
    console.error('[PROCESS] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
