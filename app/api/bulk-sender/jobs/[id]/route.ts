import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { BulkSenderApiResponse } from '@/types';

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

type JobStats = {
  pending: number;
  sent: number;
  failed: number;
  skipped: number;
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
 * GET: Get job details with progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BulkSenderApiResponse<{ job: EmailJob; stats: JobStats }>>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createSupabaseClient();

    // Get job
    const { data: jobData, error: jobError } = await supabase
      .from('bulk_sender_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobData as EmailJob;

    // Get recipient stats
    const { data: statsData } = await supabase
      .from('bulk_sender_job_recipients')
      .select('status')
      .eq('job_id', id);

    const stats: JobStats = {
      pending: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    if (statsData) {
      for (const row of statsData) {
        if (row.status === 'pending') stats.pending++;
        else if (row.status === 'sent') stats.sent++;
        else if (row.status === 'failed') stats.failed++;
        else if (row.status === 'skipped') stats.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { job, stats },
    });
  } catch (error) {
    console.error('[JOB_DETAIL] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update job status (start, pause, resume)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BulkSenderApiResponse<{ job: EmailJob }>>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: 'start' | 'pause' | 'resume' | 'cancel' };

    const supabase = createSupabaseClient();

    // Get current job
    const { data: jobData, error: jobError } = await supabase
      .from('bulk_sender_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobData as EmailJob;

    // Determine new status based on action
    let newStatus: EmailJob['status'];
    const updates: Partial<EmailJob> = {};

    switch (action) {
      case 'start':
        if (job.status !== 'pending') {
          return NextResponse.json(
            { success: false, error: 'Can only start pending jobs' },
            { status: 400 }
          );
        }
        newStatus = 'processing';
        updates.started_at = new Date().toISOString();
        break;

      case 'pause':
        if (job.status !== 'processing') {
          return NextResponse.json(
            { success: false, error: 'Can only pause processing jobs' },
            { status: 400 }
          );
        }
        newStatus = 'paused';
        break;

      case 'resume':
        if (job.status !== 'paused') {
          return NextResponse.json(
            { success: false, error: 'Can only resume paused jobs' },
            { status: 400 }
          );
        }
        newStatus = 'processing';
        break;

      case 'cancel':
        if (job.status === 'completed') {
          return NextResponse.json(
            { success: false, error: 'Cannot cancel completed jobs' },
            { status: 400 }
          );
        }
        newStatus = 'failed';
        updates.completed_at = new Date().toISOString();
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update job
    const { data: updatedJob, error: updateError } = await supabase
      .from('bulk_sender_jobs')
      .update({ status: newStatus, ...updates })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedJob) {
      return NextResponse.json(
        { success: false, error: 'Failed to update job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { job: updatedJob as EmailJob },
      message: `Job ${action}ed successfully`,
    });
  } catch (error) {
    console.error('[JOB_UPDATE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BulkSenderApiResponse>> {
  try {
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createSupabaseClient();

    // Check if job is processing
    const { data: jobData } = await supabase
      .from('bulk_sender_jobs')
      .select('status')
      .eq('id', id)
      .single();

    if (jobData?.status === 'processing') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a processing job. Pause it first.' },
        { status: 400 }
      );
    }

    // Delete job (recipients will cascade)
    const { error: deleteError } = await supabase
      .from('bulk_sender_jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('[JOB_DELETE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
