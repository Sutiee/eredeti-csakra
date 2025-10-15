/**
 * KPI Statistics API
 * Returns key performance indicators for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { KPIStats } from '@/types/admin-stats';

const PROJECT_ID = 'zvoaqnfxschflsoqnusg';

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = Math.min(Math.max(parseInt(daysParam), 1), 365);

    logger.debug('Fetching KPI stats', {
      context: 'kpis-api',
      data: { days },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Query 1: Total Visitors (unique session_ids from page_views)
    const { count: totalVisitors, error: visitorsError } = await supabase
      .from('page_views')
      .select('session_id', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    if (visitorsError) throw visitorsError;

    // Query 2: Completed Quizzes
    const { count: completedQuizzes, error: quizzesError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    if (quizzesError) throw quizzesError;

    // Query 3: Total Revenue and Purchase Count
    const { data: revenueData, error: revenueError } = await supabase
      .from('purchases')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDateStr);

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
    const purchaseCount = revenueData?.length || 0;
    const averageOrderValue = purchaseCount > 0 ? totalRevenue / purchaseCount : 0;

    // Query 4: Active Sessions (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const last24HoursStr = last24Hours.toISOString();

    const { count: activeSessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('started_at', last24HoursStr);

    if (sessionsError) throw sessionsError;

    // Calculate conversion rate
    const conversionRate =
      totalVisitors && totalVisitors > 0
        ? ((completedQuizzes || 0) / totalVisitors) * 100
        : 0;

    const stats: KPIStats = {
      totalVisitors: totalVisitors || 0,
      completedQuizzes: completedQuizzes || 0,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimals
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      activeSessions: activeSessions || 0,
    };

    logger.info('KPI stats fetched successfully', {
      context: 'kpis-api',
      data: { days, stats },
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch KPI stats', error, {
      context: 'kpis-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch KPI statistics' },
      { status: 500 }
    );
  }
}
