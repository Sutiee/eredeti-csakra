/**
 * Bulk Sender Templates API Route
 * Handles CRUD operations for email templates
 *
 * GET: List all templates with pagination
 * POST: Create new template
 * PUT: Update existing template
 * DELETE: Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { BulkSenderApiResponse, BulkSenderTemplate } from '@/types';

/**
 * Verify authentication from cookie
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
 * GET: List all templates with pagination
 * Query params: page (default: 1), limit (default: 20)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ templates: BulkSenderTemplate[]; total: number }>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    // Get total count
    const { count, error: countError } = await (supabase as any)
      .from('bulk_sender_templates')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[GET /api/bulk-sender/templates] Count error:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to count templates' },
        { status: 500 }
      );
    }

    // Get paginated templates
    const { data: templates, error: fetchError } = await (supabase as any)
      .from('bulk_sender_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('[GET /api/bulk-sender/templates] Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        templates: (templates || []) as BulkSenderTemplate[],
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('[GET /api/bulk-sender/templates] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create new template
 * Body: { name, subject, html_content, is_default }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<BulkSenderTemplate>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, html_content, is_default = false } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template subject is required' },
        { status: 400 }
      );
    }

    if (!html_content || typeof html_content !== 'string' || html_content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template HTML content is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // If this is set as default, unset other defaults
    if (is_default) {
      await (supabase as any)
        .from('bulk_sender_templates')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    // Insert new template
    const { data: template, error: insertError } = await (supabase as any)
      .from('bulk_sender_templates')
      .insert({
        name: name.trim(),
        subject: subject.trim(),
        html_content: html_content.trim(),
        is_default: Boolean(is_default),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[POST /api/bulk-sender/templates] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template as BulkSenderTemplate,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('[POST /api/bulk-sender/templates] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update existing template
 * Body: { id, name, subject, html_content, is_default }
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<BulkSenderTemplate>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, subject, html_content, is_default } = body;

    // Validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template subject is required' },
        { status: 400 }
      );
    }

    if (!html_content || typeof html_content !== 'string' || html_content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template HTML content is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // If this is set as default, unset other defaults
    if (is_default) {
      await (supabase as any)
        .from('bulk_sender_templates')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id);
    }

    // Update template
    const { data: template, error: updateError } = await (supabase as any)
      .from('bulk_sender_templates')
      .update({
        name: name.trim(),
        subject: subject.trim(),
        html_content: html_content.trim(),
        is_default: Boolean(is_default),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[PUT /api/bulk-sender/templates] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update template' },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template as BulkSenderTemplate,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/bulk-sender/templates] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete template
 * Query params: id
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Delete template
    const { error: deleteError } = await (supabase as any)
      .from('bulk_sender_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[DELETE /api/bulk-sender/templates] Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/bulk-sender/templates] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
