/**
 * GET /api/admin/users/search
 * Quick search autocomplete for name/email
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { UserSearchSuggestion } from '@/types/admin-users';

/**
 * GET handler for search suggestions
 */
export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const limitParam = parseInt(searchParams.get('limit') || '10');
    const limit = Math.min(50, Math.max(1, limitParam)); // Between 1 and 50

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    logger.debug('Searching users', {
      context: 'GET /api/admin/users/search',
      data: { query, limit },
    });

    const supabase = createSupabaseClient();

    // Search for users by name or email
    const { data: users, error: searchError } = await supabase
      .from('quiz_results')
      .select('id, name, email')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (searchError) {
      throw searchError;
    }

    // Transform to suggestions with avatar (first letter of name)
    const suggestions: UserSearchSuggestion[] = (users || []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
    }));

    logger.debug('Search results fetched', {
      context: 'GET /api/admin/users/search',
      data: { count: suggestions.length },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    logger.error('Failed to search users', error, {
      context: 'GET /api/admin/users/search',
    });

    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
