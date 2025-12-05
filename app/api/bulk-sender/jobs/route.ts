import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { BulkSenderRecipient, BulkSenderApiResponse, BulkSenderUnsubscribe } from '@/types';

// Types for jobs
type EmailJob = {
  id: string;
  subject: string;
  html_content: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'failed';
  current_batch: number;
  total_batches: number;
  batch_size: number;
  delay_between_batches_ms: number;
  error_log: Record<string, string>[] | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CreateJobRequest = {
  recipients: BulkSenderRecipient[];
  subject: string;
  htmlContent: string;
  batchSize?: number;
  delayBetweenBatchesMs?: number;
};

type CreateJobResponse = {
  jobId: string;
  totalRecipients: number;
  totalBatches: number;
  estimatedTimeMinutes: number;
};

/**
 * Check if user is authenticated via bulk_sender_auth cookie
 */
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
 * POST: Create a new email job (queue emails for background sending)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<CreateJobResponse>>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const body: CreateJobRequest = await request.json();
    const {
      recipients,
      subject,
      htmlContent,
      batchSize = 100,
      delayBetweenBatchesMs = 10000, // 10 seconds default
    } = body;

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!subject?.trim() || !htmlContent?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Subject and HTML content are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Load unsubscribe list
    const { data: unsubscribesData } = await supabase
      .from('bulk_sender_unsubscribes')
      .select('email');

    const unsubscribeEmails = new Set(
      (unsubscribesData as BulkSenderUnsubscribe[] || []).map((u) => u.email.toLowerCase())
    );

    // Filter recipients
    const filteredRecipients: BulkSenderRecipient[] = [];
    let skippedCount = 0;

    for (const recipient of recipients) {
      if (unsubscribeEmails.has(recipient.email.toLowerCase())) {
        skippedCount++;
      } else {
        filteredRecipients.push(recipient);
      }
    }

    if (filteredRecipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All recipients are unsubscribed. No emails to send.' },
        { status: 400 }
      );
    }

    // Calculate batches
    const totalBatches = Math.ceil(filteredRecipients.length / batchSize);
    const estimatedTimeMinutes = Math.ceil((totalBatches * delayBetweenBatchesMs) / 60000);

    // Create job record
    const { data: jobData, error: jobError } = await supabase
      .from('bulk_sender_jobs')
      .insert({
        subject,
        html_content: htmlContent,
        total_recipients: filteredRecipients.length,
        skipped_count: skippedCount,
        total_batches: totalBatches,
        batch_size: batchSize,
        delay_between_batches_ms: delayBetweenBatchesMs,
        status: 'pending',
      })
      .select()
      .single();

    if (jobError || !jobData) {
      console.error('[JOBS] Failed to create job:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create email job' },
        { status: 500 }
      );
    }

    const job = jobData as EmailJob;

    // Create recipient records with batch numbers
    const recipientRecords = filteredRecipients.map((recipient, index) => ({
      job_id: job.id,
      email: recipient.email,
      name: recipient.name || null,
      batch_number: Math.floor(index / batchSize),
      status: 'pending',
    }));

    // Insert in chunks to avoid hitting limits
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < recipientRecords.length; i += CHUNK_SIZE) {
      const chunk = recipientRecords.slice(i, i + CHUNK_SIZE);
      const { error: recipientError } = await supabase
        .from('bulk_sender_job_recipients')
        .insert(chunk);

      if (recipientError) {
        console.error('[JOBS] Failed to insert recipients chunk:', recipientError);
        // Clean up the job if recipient insertion fails
        await supabase.from('bulk_sender_jobs').delete().eq('id', job.id);
        return NextResponse.json(
          { success: false, error: 'Failed to queue recipients' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        totalRecipients: filteredRecipients.length,
        totalBatches,
        estimatedTimeMinutes,
      },
      message: `Job created! ${filteredRecipients.length} emails queued in ${totalBatches} batches. Estimated time: ~${estimatedTimeMinutes} minutes.`,
    });
  } catch (error) {
    console.error('[JOBS] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * GET: List all jobs or get active job
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ jobs: EmailJob[]; activeJob: EmailJob | null }>>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient();

    // Get all jobs, most recent first
    const { data: jobsData, error: jobsError } = await supabase
      .from('bulk_sender_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (jobsError) {
      console.error('[JOBS] Failed to fetch jobs:', jobsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    const jobs = (jobsData || []) as EmailJob[];

    // Find active job (pending or processing)
    const activeJob = jobs.find(
      (job) => job.status === 'pending' || job.status === 'processing'
    ) || null;

    return NextResponse.json({
      success: true,
      data: { jobs, activeJob },
    });
  } catch (error) {
    console.error('[JOBS] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
