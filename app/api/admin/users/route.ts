/**
 * GET /api/admin/users
 * Admin users list with filtering, sorting, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { UserTableRow, UsersListResponse } from '@/types/admin-users';

/**
 * Calculate chakra health status from chakra scores
 */
function calculateChakraHealth(
  chakraScores: Record<string, number>
): 'healthy' | 'warning' | 'critical' {
  const scores = Object.values(chakraScores);
  const lowScores = scores.filter((s) => s < 12); // out of 16

  if (lowScores.length === 0) return 'healthy';
  if (lowScores.length <= 2) return 'warning';
  return 'critical';
}

/**
 * GET handler for users list
 */
export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limitParam = parseInt(searchParams.get('limit') || '25');
    const limit = [10, 25, 50, 100].includes(limitParam) ? limitParam : 25;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const purchase = searchParams.get('purchase') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    logger.debug('Fetching users list', {
      context: 'GET /api/admin/users',
      data: { page, limit, search, status, purchase, dateFrom, dateTo, sortBy, sortOrder },
    });

    const supabase = createSupabaseClient();

    // Start building the query
    let query = supabase.from('quiz_results').select('*', { count: 'exact' });

    // Search filter (name or email)
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Date filters
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Sorting
    const validSortColumns = ['name', 'email', 'created_at', 'age'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: quizResults, error: queryError, count } = await query;

    if (queryError) {
      throw queryError;
    }

    if (!quizResults) {
      throw new Error('No data returned from query');
    }

    // Fetch purchase counts for all users
    const emails = quizResults.map((r) => r.email);
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('email')
      .eq('status', 'completed')
      .in('email', emails);

    if (purchaseError) {
      logger.warn('Failed to fetch purchase counts', {
        context: 'GET /api/admin/users',
        error: purchaseError,
      });
    }

    // Count purchases per email
    const purchaseCounts = new Map<string, number>();
    (purchases || []).forEach((p) => {
      purchaseCounts.set(p.email, (purchaseCounts.get(p.email) || 0) + 1);
    });

    // Transform data
    let users: UserTableRow[] = quizResults.map((row) => {
      const chakraScores = (row.chakra_scores as Record<string, number>) || {};
      const purchaseCount = purchaseCounts.get(row.email) || 0;

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        age: row.age,
        quizStatus: 'completed' as const,
        reachedQuestion: 28,
        totalQuestions: 28,
        chakraHealth: calculateChakraHealth(chakraScores),
        hasPurchased: purchaseCount > 0,
        purchaseCount,
        createdAt: row.created_at,
      };
    });

    // Apply purchase filter (client-side since we already have the data)
    if (purchase === 'purchased') {
      users = users.filter((u) => u.hasPurchased);
    } else if (purchase === 'not_purchased') {
      users = users.filter((u) => !u.hasPurchased);
    }

    // Recalculate pagination for filtered results
    const totalItems = purchase === 'all' ? count || 0 : users.length;
    const totalPages = Math.ceil(totalItems / limit);

    // If we filtered by purchase status, we need to apply pagination client-side
    if (purchase !== 'all') {
      users = users.slice(0, limit);
    }

    const response: UsersListResponse = {
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };

    logger.info('Users list fetched successfully', {
      context: 'GET /api/admin/users',
      data: { count: users.length, totalItems, page, totalPages },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch users list', error, {
      context: 'GET /api/admin/users',
    });

    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
