/**
 * Recipient List Detail API Routes
 * GET /api/admin/newsletter/recipient-lists/[listId] - Get recipients for a list
 * DELETE /api/admin/newsletter/recipient-lists/[listId] - Delete saved list
 *
 * Protected routes requiring admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Response types
 */
type Recipient = {
  id: string;
  name: string;
  email: string;
  variant: 'a' | 'b' | 'c';
  resultId: string | null;
  created_at: string;
};

type RecipientList = {
  id: string;
  name: string;
  description: string | null;
  total_recipients: number;
  variant_distribution: { a: number; b: number; c: number };
  created_at: string;
};

type GetListResponse = {
  data: {
    list: RecipientList;
    recipients: Recipient[];
  } | null;
  error: { message: string; code?: string } | null;
};

type DeleteListResponse = {
  data: { success: boolean } | null;
  error: { message: string; code?: string } | null;
};

/**
 * Route params type
 */
type RouteParams = {
  params: {
    listId: string;
  };
};

/**
 * GET handler - Get recipients for a specific list
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { listId } = params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listId)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid list ID format',
            code: 'INVALID_LIST_ID',
          },
        },
        { status: 400 }
      );
    }

    logger.debug('Fetching recipient list details', {
      context: 'GET /api/admin/newsletter/recipient-lists/[listId]',
      data: { listId },
    });

    const supabase = createServiceRoleClient();

    // Fetch list metadata
    const { data: list, error: listError } = await supabase
      .from('recipient_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (listError) {
      if (listError.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Recipient list not found',
              code: 'LIST_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }
      throw listError;
    }

    if (!list) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Recipient list not found',
            code: 'LIST_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Fetch all recipients for this list
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipients')
      .select('*')
      .eq('recipient_list_id', listId)
      .order('created_at', { ascending: true });

    if (recipientsError) {
      throw recipientsError;
    }

    // Transform response data
    const transformedList: RecipientList = {
      id: list.id,
      name: list.name,
      description: list.description,
      total_recipients: list.total_recipients,
      variant_distribution: list.variant_distribution as {
        a: number;
        b: number;
        c: number;
      },
      created_at: list.created_at,
    };

    const transformedRecipients: Recipient[] = (recipients || []).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      variant: r.variant as 'a' | 'b' | 'c',
      resultId: r.result_id,
      created_at: r.created_at,
    }));

    const response: GetListResponse = {
      data: {
        list: transformedList,
        recipients: transformedRecipients,
      },
      error: null,
    };

    logger.info('Recipient list fetched successfully', {
      context: 'GET /api/admin/newsletter/recipient-lists/[listId]',
      data: {
        listId,
        listName: list.name,
        recipientCount: transformedRecipients.length,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch recipient list', error, {
      context: 'GET /api/admin/newsletter/recipient-lists/[listId]',
    });

    const response: GetListResponse = {
      data: null,
      error: {
        message: 'Failed to fetch recipient list',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE handler - Delete a saved recipient list
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { listId } = params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listId)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid list ID format',
            code: 'INVALID_LIST_ID',
          },
        },
        { status: 400 }
      );
    }

    logger.info('Deleting recipient list', {
      context: 'DELETE /api/admin/newsletter/recipient-lists/[listId]',
      data: { listId },
    });

    const supabase = createServiceRoleClient();

    // First, check if the list exists
    const { data: existingList, error: checkError } = await supabase
      .from('recipient_lists')
      .select('id, name')
      .eq('id', listId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Recipient list not found',
              code: 'LIST_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }
      throw checkError;
    }

    if (!existingList) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Recipient list not found',
            code: 'LIST_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Delete the list (CASCADE will automatically delete all recipients)
    const { error: deleteError } = await supabase
      .from('recipient_lists')
      .delete()
      .eq('id', listId);

    if (deleteError) {
      throw deleteError;
    }

    logger.info('Recipient list deleted successfully', {
      context: 'DELETE /api/admin/newsletter/recipient-lists/[listId]',
      data: { listId, listName: existingList.name },
    });

    const response: DeleteListResponse = {
      data: { success: true },
      error: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to delete recipient list', error, {
      context: 'DELETE /api/admin/newsletter/recipient-lists/[listId]',
    });

    const response: DeleteListResponse = {
      data: null,
      error: {
        message: 'Failed to delete recipient list',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
