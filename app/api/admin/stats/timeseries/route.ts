/**
 * Time Series Statistics API
 * Returns daily metrics over time for charting
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { TimeSeriesData, TimeSeriesMetric } from '@/types/admin-stats';

const PROJECT_ID = 'zvoaqnfxschflsoqnusg';

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = Math.min(Math.max(parseInt(daysParam), 1), 365);
    const metric = (searchParams.get('metric') || 'visitors') as TimeSeriesMetric;

    // Validate metric
    if (!['visitors', 'revenue', 'quizzes'].includes(metric)) {
      return NextResponse.json(
        { error: 'Invalid metric. Must be: visitors, revenue, or quizzes' },
        { status: 400 }
      );
    }

    logger.debug('Fetching time series data', {
      context: 'timeseries-api',
      data: { days, metric },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    let data: TimeSeriesData[] = [];

    if (metric === 'visitors') {
      // Query unique visitors per day
      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('created_at, session_id')
        .gte('created_at', startDateStr);

      if (error) throw error;

      // Group by date manually
      const dailyMap = new Map<string, Set<string>>();
      pageViews?.forEach((pv: any) => {
        const date = new Date(pv.created_at).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, new Set());
        }
        dailyMap.get(date)?.add(pv.session_id);
      });

      data = Array.from(dailyMap.entries())
        .map(([date, sessions]) => ({
          date,
          value: sessions.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else if (metric === 'revenue') {
      // Query revenue per day
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('created_at, amount')
        .eq('status', 'completed')
        .gte('created_at', startDateStr);

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, number>();
      purchases?.forEach((p: any) => {
        const date = new Date(p.created_at).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + (p.amount || 0));
      });

      data = Array.from(dailyMap.entries())
        .map(([date, value]) => ({
          date,
          value: Math.round(value * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else if (metric === 'quizzes') {
      // Query completed quizzes per day
      const { data: quizResults, error } = await supabase
        .from('quiz_results')
        .select('created_at')
        .gte('created_at', startDateStr);

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, number>();
      quizResults?.forEach((qr: any) => {
        const date = new Date(qr.created_at).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      data = Array.from(dailyMap.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Fill in missing dates with zero values
    const filledData: TimeSeriesData[] = [];
    const currentDate = new Date(startDateStr);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = data.find((d) => d.date === dateStr);
      filledData.push({
        date: dateStr,
        value: existing?.value || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    logger.info('Time series data fetched successfully', {
      context: 'timeseries-api',
      data: { days, metric, dataPoints: filledData.length },
    });

    return NextResponse.json(filledData);
  } catch (error) {
    logger.error('Failed to fetch time series data', error, {
      context: 'timeseries-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch time series data' },
      { status: 500 }
    );
  }
}
