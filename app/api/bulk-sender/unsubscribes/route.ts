import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { BulkSenderApiResponse, BulkSenderUnsubscribe } from '@/types';

/**
 * Create Supabase client with service role for bulk sender operations
 * Note: Using direct createClient to bypass type restrictions for bulk_sender tables
 */
function createBulkSenderClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

/**
 * Verify bulk sender authentication
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

/**
 * GET: List unsubscribes with pagination and search
 * Query params: page, limit, search
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{
  unsubscribes: BulkSenderUnsubscribe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const supabase = createBulkSenderClient();

    // Build query
    let query = supabase
      .from('bulk_sender_unsubscribes')
      .select('*', { count: 'exact' });

    // Apply search filter if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,reason.ilike.%${search}%`);
    }

    // Get total count
    const { count: total } = await query;

    // Get paginated results
    const { data: unsubscribes, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('[UNSUBSCRIBES_GET] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch unsubscribes' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((total || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        unsubscribes: (unsubscribes || []) as BulkSenderUnsubscribe[],
        total: total || 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[UNSUBSCRIBES_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Add single email or bulk emails to unsubscribes
 * Body: { email?: string, emails?: string[], reason?: string }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{
  added: number;
  skipped: number;
  duplicates: string[];
}>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, emails, reason } = body;

    // Validate input
    if (!email && (!emails || !Array.isArray(emails) || emails.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Either email or emails array is required' },
        { status: 400 }
      );
    }

    const supabase = createBulkSenderClient();

    // Normalize emails to lowercase and remove duplicates
    const emailList = email
      ? [email.toLowerCase().trim()]
      : Array.from(new Set(emails.map((e: string) => e.toLowerCase().trim())));

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((e: string) => !emailRegex.test(e));

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email format: ${invalidEmails.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check for existing unsubscribes
    const { data: existingUnsubscribes } = await supabase
      .from('bulk_sender_unsubscribes')
      .select('email')
      .in('email', emailList);

    const existingSet = new Set(
      (existingUnsubscribes || []).map((u: { email: string }) => u.email)
    );

    // Filter out duplicates
    const newEmails = emailList.filter((e: string) => !existingSet.has(e));
    const duplicates = emailList.filter((e: string) => existingSet.has(e));

    // Insert new unsubscribes
    let added = 0;
    if (newEmails.length > 0) {
      const unsubscribeRecords = newEmails.map((e: string) => ({
        email: e,
        reason: reason || null,
      }));

      const { error } = await supabase
        .from('bulk_sender_unsubscribes')
        .insert(unsubscribeRecords);

      if (error) {
        console.error('[UNSUBSCRIBES_POST] Insert error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to add unsubscribes' },
          { status: 500 }
        );
      }

      added = newEmails.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        added,
        skipped: duplicates.length,
        duplicates,
      },
      message: `Added ${added} email(s), skipped ${duplicates.length} duplicate(s)`,
    });
  } catch (error) {
    console.error('[UNSUBSCRIBES_POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove unsubscribe by id or email
 * Query params: id or email
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ deleted: boolean }>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    // Validate input
    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'Either id or email is required' },
        { status: 400 }
      );
    }

    const supabase = createBulkSenderClient();

    // Delete by id or email
    let query = supabase.from('bulk_sender_unsubscribes').delete();

    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim());
    }

    const { error, count } = await query;

    if (error) {
      console.error('[UNSUBSCRIBES_DELETE] Delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete unsubscribe' },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: 'Unsubscribe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: 'Unsubscribe removed successfully',
    });
  } catch (error) {
    console.error('[UNSUBSCRIBES_DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
