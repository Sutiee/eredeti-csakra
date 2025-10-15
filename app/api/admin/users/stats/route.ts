/**
 * GET /api/admin/users/stats
 * Fetch summary statistics for user management
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { UserStats } from '@/types/admin-users';

/**
 * GET handler for user statistics
 */
export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    logger.debug('Fetching user stats', {
      context: 'GET /api/admin/users/stats',
    });

    const supabase = createSupabaseClient();

    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Query 1: Total users (quiz completions)
    const { count: totalUsers, error: totalError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Query 2: New users this week
    const { count: newUsersThisWeek, error: weekError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (weekError) throw weekError;

    // Query 3: New users this month
    const { count: newUsersThisMonth, error: monthError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (monthError) throw monthError;

    // Query 4: Get all user emails for conversion rate
    const { data: allUsers, error: usersError } = await supabase
      .from('quiz_results')
      .select('email');

    if (usersError) throw usersError;

    // Query 5: Get unique emails that have completed purchases
    const { data: purchasedUsers, error: purchaseError } = await supabase
      .from('purchases')
      .select('email')
      .eq('status', 'completed');

    if (purchaseError) throw purchaseError;

    // Calculate conversion rate
    const uniquePurchasedEmails = new Set((purchasedUsers || []).map((p) => p.email));
    const conversionRate =
      totalUsers && totalUsers > 0 ? (uniquePurchasedEmails.size / totalUsers) * 100 : 0;

    // Query 6: Average age
    const { data: agesData, error: ageError } = await supabase
      .from('quiz_results')
      .select('age')
      .not('age', 'is', null);

    if (ageError) throw ageError;

    const ages = (agesData || []).map((r) => r.age).filter((a): a is number => a !== null);
    const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

    // Query 7: Quiz sessions for completion rate
    const { data: sessions, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('status');

    if (sessionError) throw sessionError;

    const completedSessions = (sessions || []).filter((s) => s.status === 'completed').length;
    const activeSessions = (sessions || []).filter((s) => s.status === 'active').length;
    const abandonedSessions = (sessions || []).filter((s) => s.status === 'abandoned').length;
    const totalSessions = sessions?.length || 0;

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const abandonmentRate = totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0;

    const stats: UserStats = {
      totalUsers: totalUsers || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimals
      averageAge: Math.round(averageAge * 10) / 10, // Round to 1 decimal
      completionRate: Math.round(completionRate * 100) / 100,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100,
    };

    logger.info('User stats fetched successfully', {
      context: 'GET /api/admin/users/stats',
      data: { ...stats },
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch user stats', error, {
      context: 'GET /api/admin/users/stats',
    });

    return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
  }
}
