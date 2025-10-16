/**
 * GET /api/admin/users/export
 * Export filtered users to CSV or JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { UserTableRow, UserFilters, ExportDataResponse } from '@/types/admin-users';

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
 * Convert users array to CSV format
 */
function generateCSV(users: UserTableRow[]): string {
  // CSV header
  const header =
    'Név,Email,Kor,Kvíz Állapot,Elért Kérdés,Csakra Egészség,Vásárolt,Vásárlások Száma,Létrehozva\n';

  // CSV rows
  const rows = users.map((user) => {
    const name = `"${user.name.replace(/"/g, '""')}"`;
    const email = `"${user.email.replace(/"/g, '""')}"`;
    const age = user.age || '';
    const quizStatus = user.quizStatus === 'completed' ? 'Befejezett' : 'Elhagyott';
    const reachedQuestion = `${user.reachedQuestion}/${user.totalQuestions}`;
    const chakraHealth =
      user.chakraHealth === 'healthy'
        ? 'Egészséges'
        : user.chakraHealth === 'warning'
          ? 'Figyelmeztető'
          : 'Kritikus';
    const purchased = user.hasPurchased ? 'Igen' : 'Nem';
    const purchaseCount = user.purchaseCount;
    const createdAt = new Date(user.createdAt).toLocaleString('hu-HU');

    return `${name},${email},${age},${quizStatus},${reachedQuestion},${chakraHealth},${purchased},${purchaseCount},"${createdAt}"`;
  });

  return header + rows.join('\n');
}

/**
 * Fetch filtered users (reuse logic from users list API)
 */
async function fetchFilteredUsers(filters: UserFilters): Promise<UserTableRow[]> {
  const supabase = createSupabaseClient();

  // Start building the query
  let query = supabase.from('quiz_results').select('*');

  // Search filter
  if (filters.search && filters.search.trim()) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  // Date filters
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Sorting
  const validSortColumns = ['name', 'email', 'created_at', 'age'];
  const sortColumn = validSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
  query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });

  // Execute query (no pagination for export - get all)
  const { data: quizResults, error: queryError } = await query;

  if (queryError) {
    throw queryError;
  }

  if (!quizResults) {
    return [];
  }

  // Fetch purchase counts for all users
  const emails = quizResults.map((r) => r.email);
  const { data: purchases } = await supabase
    .from('purchases')
    .select('email')
    .eq('status', 'completed')
    .in('email', emails);

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

  // Apply purchase filter
  if (filters.purchase === 'purchased') {
    users = users.filter((u) => u.hasPurchased);
  } else if (filters.purchase === 'not_purchased') {
    users = users.filter((u) => !u.hasPurchased);
  }

  return users;
}

/**
 * GET handler for export
 */
export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    // Parse parameters
    const format = searchParams.get('format') || 'csv';
    const filtersParam = searchParams.get('filters');

    let filters: UserFilters = {
      search: '',
      status: 'all',
      purchase: 'all',
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam);
        filters = { ...filters, ...parsed };
      } catch (parseError) {
        logger.warn('Failed to parse filters, using defaults', {
          context: 'GET /api/admin/users/export',
          error: parseError,
        });
      }
    }

    logger.debug('Exporting users', {
      context: 'GET /api/admin/users/export',
      data: { format, filters },
    });

    // Fetch users with filters
    const users = await fetchFilteredUsers(filters);

    if (format === 'csv') {
      const csv = generateCSV(users);
      const filename = `users_${new Date().toISOString().split('T')[0]}.csv`;

      logger.info('Users exported as CSV', {
        context: 'GET /api/admin/users/export',
        data: { count: users.length, filename },
      });

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (format === 'json') {
      const response: ExportDataResponse = {
        data: users,
        exportedAt: new Date().toISOString(),
        totalRecords: users.length,
        filters,
      };

      logger.info('Users exported as JSON', {
        context: 'GET /api/admin/users/export',
        data: { count: users.length },
      });

      return NextResponse.json(response);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use "csv" or "json".' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Failed to export users', error, {
      context: 'GET /api/admin/users/export',
    });

    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
