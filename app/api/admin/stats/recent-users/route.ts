/**
 * Recent Users Statistics API
 * Returns list of recent quiz completions with purchase info
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { RecentUser } from '@/types/admin-stats';

const PROJECT_ID = 'zvoaqnfxschflsoqnusg';

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit') || '10';
    const limit = Math.min(Math.max(parseInt(limitParam), 1), 100);

    logger.debug('Fetching recent users', {
      context: 'recent-users-api',
      data: { limit },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Get recent quiz results
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_results')
      .select('id, name, email, age, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (quizError) throw quizError;

    if (!quizResults || quizResults.length === 0) {
      return NextResponse.json([]);
    }

    // Get purchase info for these users
    const emails = quizResults.map((qr: any) => qr.email);

    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('email, status')
      .in('email', emails);

    if (purchaseError) throw purchaseError;

    // Build purchase map (email -> count of completed purchases)
    const purchaseMap = new Map<string, number>();
    purchases?.forEach((p: any) => {
      if (p.status === 'completed' && p.email) {
        purchaseMap.set(p.email, (purchaseMap.get(p.email) || 0) + 1);
      }
    });

    // Combine data
    const recentUsers: RecentUser[] = quizResults.map((qr: any) => {
      const purchaseCount = purchaseMap.get(qr.email) || 0;
      return {
        id: qr.id,
        name: qr.name || 'Unknown',
        email: qr.email || 'No email',
        age: qr.age || 0,
        created_at: qr.created_at,
        purchased: purchaseCount > 0,
        purchase_count: purchaseCount,
      };
    });

    logger.info('Recent users fetched successfully', {
      context: 'recent-users-api',
      data: { limit, count: recentUsers.length },
    });

    return NextResponse.json(recentUsers);
  } catch (error) {
    logger.error('Failed to fetch recent users', error, {
      context: 'recent-users-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch recent users' },
      { status: 500 }
    );
  }
}
