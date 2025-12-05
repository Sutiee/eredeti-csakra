import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { BulkSenderApiResponse, BulkSenderHistory } from '@/types';

/**
 * Helper function to verify authentication
 */
function isAuthenticated(request: NextRequest): boolean {
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
 * GET: List send history with pagination
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - status: Filter by status (optional)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ history: BulkSenderHistory[]; total: number }>>> {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Build query
    let query = supabase
      .from('bulk_sender_history' as any)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: history, error, count } = await query;

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        history: (history || []) as unknown as BulkSenderHistory[],
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/bulk-sender/history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new history record
 * Body:
 * - subject: Email subject
 * - recipient_count: Total recipients
 * - sent_count: Successfully sent
 * - failed_count: Failed sends
 * - skipped_count: Skipped (unsubscribed)
 * - status: 'completed' | 'partial' | 'failed' | 'stopped'
 * - template_id: Template ID (optional)
 * - error_log: Array of error objects (optional)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<BulkSenderHistory>>> {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      subject,
      recipient_count,
      sent_count,
      failed_count,
      skipped_count,
      status,
      template_id,
      error_log,
    } = body;

    // Validate required fields
    if (!subject || typeof recipient_count !== 'number' || typeof sent_count !== 'number' || typeof failed_count !== 'number' || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    const { data: history, error } = await supabase
      .from('bulk_sender_history' as any)
      .insert({
        subject,
        recipient_count,
        sent_count,
        failed_count,
        skipped_count: skipped_count || 0,
        status,
        template_id: template_id || null,
        error_log: error_log || null,
      })
      .select()
      .single();

    if (error || !history) {
      console.error('Error creating history record:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create history record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: history as unknown as BulkSenderHistory,
    });
  } catch (error) {
    console.error('Error in POST /api/bulk-sender/history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create history record' },
      { status: 500 }
    );
  }
}
