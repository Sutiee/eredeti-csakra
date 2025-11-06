/**
 * Recipient Lists API Routes
 * POST /api/admin/newsletter/recipient-lists - Save new recipient list
 * GET /api/admin/newsletter/recipient-lists - List all saved lists
 *
 * Protected routes requiring admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

// Constants
const MAX_LISTS_PER_USER = 20;
const BATCH_SIZE = 100; // Insert recipients in batches for performance

/**
 * Recipient schema for validation
 */
const RecipientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  variant: z.enum(['a', 'b', 'c'], { required_error: 'Variant is required' }),
  resultId: z.string().uuid().optional().nullable(),
});

/**
 * Request body schema for POST
 */
const CreateListRequestSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  recipients: z
    .array(RecipientSchema)
    .min(1, 'At least one recipient is required')
    .max(10000, 'Maximum 10,000 recipients per list'),
});

type CreateListRequest = z.infer<typeof CreateListRequestSchema>;

/**
 * Response types
 */
type CreateListResponse = {
  data: {
    listId: string;
    name: string;
    totalRecipients: number;
  } | null;
  error: { message: string; code?: string } | null;
};

type ListAllResponse = {
  data: {
    lists: Array<{
      id: string;
      name: string;
      description: string | null;
      total_recipients: number;
      variant_distribution: { a: number; b: number; c: number };
      created_at: string;
    }>;
    total: number;
    hasMore: boolean;
  } | null;
  error: { message: string; code?: string } | null;
};

/**
 * Split array into batches
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Calculate variant distribution from recipients
 */
function calculateVariantDistribution(
  recipients: Array<{ variant: 'a' | 'b' | 'c' }>
): { a: number; b: number; c: number } {
  const distribution = { a: 0, b: 0, c: 0 };
  recipients.forEach((r) => {
    distribution[r.variant]++;
  });
  return distribution;
}

/**
 * Check if a list with the same email set already exists
 */
async function checkDuplicateList(
  supabase: ReturnType<typeof createServiceRoleClient>,
  emails: string[]
): Promise<string | null> {
  try {
    // Get all lists with similar recipient counts (within ±5%)
    const targetCount = emails.length;
    const minCount = Math.floor(targetCount * 0.95);
    const maxCount = Math.ceil(targetCount * 1.05);

    const { data: candidateLists, error } = await supabase
      .from('recipient_lists')
      .select('id, name, total_recipients')
      .gte('total_recipients', minCount)
      .lte('total_recipients', maxCount);

    if (error || !candidateLists || candidateLists.length === 0) {
      return null;
    }

    // Sort emails for comparison
    const sortedNewEmails = [...emails].sort();

    // Check each candidate list
    for (const list of candidateLists) {
      const { data: existingRecipients, error: recipientsError } = await supabase
        .from('recipients')
        .select('email')
        .eq('recipient_list_id', list.id);

      if (recipientsError || !existingRecipients) {
        continue;
      }

      const sortedExistingEmails = existingRecipients
        .map((r) => r.email)
        .sort();

      // Compare email sets
      if (
        sortedExistingEmails.length === sortedNewEmails.length &&
        sortedExistingEmails.every(
          (email, index) => email === sortedNewEmails[index]
        )
      ) {
        return list.name;
      }
    }

    return null;
  } catch (error) {
    logger.error('Failed to check duplicate list', error, {
      context: 'checkDuplicateList',
    });
    return null; // Continue on error
  }
}

/**
 * POST handler - Save new recipient list
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateListRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          data: null,
          error: {
            message: firstError.message,
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const { name, description, recipients } = validationResult.data;

    logger.info('Creating recipient list', {
      context: 'POST /api/admin/newsletter/recipient-lists',
      data: { name, recipientCount: recipients.length },
    });

    const supabase = createServiceRoleClient();

    // Check max lists per user
    const { count: listCount, error: countError } = await supabase
      .from('recipient_lists')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    if (listCount !== null && listCount >= MAX_LISTS_PER_USER) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `Maximum ${MAX_LISTS_PER_USER} recipient lists allowed`,
            code: 'MAX_LISTS_EXCEEDED',
          },
        },
        { status: 400 }
      );
    }

    // Check for duplicate emails within the list
    const emailSet = new Set<string>();
    const duplicateEmails: string[] = [];

    recipients.forEach((recipient) => {
      const email = recipient.email.toLowerCase().trim();
      if (emailSet.has(email)) {
        duplicateEmails.push(email);
      } else {
        emailSet.add(email);
      }
    });

    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `Duplicate emails found in list: ${duplicateEmails.slice(0, 3).join(', ')}${duplicateEmails.length > 3 ? ` and ${duplicateEmails.length - 3} more` : ''}`,
            code: 'DUPLICATE_EMAILS',
          },
        },
        { status: 400 }
      );
    }

    // Check if a list with the same email set already exists
    const duplicateListName = await checkDuplicateList(
      supabase,
      Array.from(emailSet)
    );

    if (duplicateListName) {
      logger.warn('Duplicate list detected', {
        context: 'POST /api/admin/newsletter/recipient-lists',
        data: { existingListName: duplicateListName, newListName: name },
      });
      // Note: We return a warning but still allow creation
      // Frontend can show this as a confirmation dialog
    }

    // Calculate variant distribution
    const variantDistribution = calculateVariantDistribution(recipients);

    // Create recipient list record
    const { data: list, error: listError } = await supabase
      .from('recipient_lists')
      .insert({
        name,
        description: description || null,
        total_recipients: recipients.length,
        variant_distribution: variantDistribution,
      })
      .select()
      .single();

    if (listError || !list) {
      throw listError || new Error('Failed to create recipient list');
    }

    const listId = list.id;

    logger.info('Recipient list created', {
      context: 'POST /api/admin/newsletter/recipient-lists',
      data: { listId, name },
    });

    // Insert recipients in batches
    const recipientBatches = chunkArray(recipients, BATCH_SIZE);
    let totalInserted = 0;

    for (let i = 0; i < recipientBatches.length; i++) {
      const batch = recipientBatches[i];

      const recipientRecords = batch.map((r) => ({
        recipient_list_id: listId,
        name: r.name,
        email: r.email.toLowerCase().trim(),
        variant: r.variant,
        result_id: r.resultId || null,
      }));

      const { error: insertError } = await supabase
        .from('recipients')
        .insert(recipientRecords);

      if (insertError) {
        logger.error(`Failed to insert batch ${i + 1}`, insertError, {
          context: 'POST /api/admin/newsletter/recipient-lists',
        });

        // Rollback: Delete the list (CASCADE will delete any inserted recipients)
        await supabase.from('recipient_lists').delete().eq('id', listId);

        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Failed to insert recipients. List creation aborted.',
              code: 'INSERT_FAILED',
            },
          },
          { status: 500 }
        );
      }

      totalInserted += batch.length;

      logger.debug(`Inserted batch ${i + 1}/${recipientBatches.length}`, {
        context: 'POST /api/admin/newsletter/recipient-lists',
        data: { batchSize: batch.length, totalInserted },
      });
    }

    logger.info('Recipient list saved successfully', {
      context: 'POST /api/admin/newsletter/recipient-lists',
      data: { listId, name, totalRecipients: totalInserted },
    });

    const response: CreateListResponse = {
      data: {
        listId,
        name,
        totalRecipients: totalInserted,
      },
      error: null,
    };

    // Include warning if duplicate list detected
    if (duplicateListName) {
      return NextResponse.json(
        {
          ...response,
          warning: {
            message: `A similar list already exists: "${duplicateListName}"`,
            code: 'DUPLICATE_LIST_WARNING',
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Failed to create recipient list', error, {
      context: 'POST /api/admin/newsletter/recipient-lists',
    });

    const response: CreateListResponse = {
      data: null,
      error: {
        message: 'Failed to create recipient list',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * GET handler - List all saved recipient lists
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.debug('Fetching recipient lists', {
      context: 'GET /api/admin/newsletter/recipient-lists',
      data: { limit, offset },
    });

    const supabase = createServiceRoleClient();

    // Fetch recipient lists with pagination
    const { data: lists, error: listsError, count } = await supabase
      .from('recipient_lists')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listsError) {
      throw listsError;
    }

    if (!lists) {
      logger.warn('No recipient lists found', {
        context: 'GET /api/admin/newsletter/recipient-lists',
      });

      const response: ListAllResponse = {
        data: {
          lists: [],
          total: 0,
          hasMore: false,
        },
        error: null,
      };

      return NextResponse.json(response);
    }

    // Transform lists
    const transformedLists = lists.map((list) => ({
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
    }));

    // Prepare response
    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: ListAllResponse = {
      data: {
        lists: transformedLists,
        total,
        hasMore,
      },
      error: null,
    };

    logger.info('Recipient lists fetched successfully', {
      context: 'GET /api/admin/newsletter/recipient-lists',
      data: {
        count: transformedLists.length,
        total,
        hasMore,
        offset,
        limit,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch recipient lists', error, {
      context: 'GET /api/admin/newsletter/recipient-lists',
    });

    const response: ListAllResponse = {
      data: null,
      error: {
        message: 'Failed to fetch recipient lists',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
