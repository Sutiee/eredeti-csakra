/**
 * Conversion Funnel Statistics API
 * Returns user journey funnel data from landing to purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { FunnelStage } from '@/types/admin-stats';

const PROJECT_ID = 'zvoaqnfxschflsoqnusg';

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = Math.min(Math.max(parseInt(daysParam), 1), 365);

    logger.debug('Fetching funnel stats', {
      context: 'funnel-api',
      data: { days },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Stage 1: Landing Page Visit
    // FIXED: Use analytics_events with event_name='page_view' (page_views table is empty)
    const { data: landingVisits, error: landingError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'page_view')
      .gte('created_at', startDateStr);

    if (landingError) throw landingError;

    const uniqueLandingVisitors = new Set(
      landingVisits?.map((v: any) => v.session_id).filter(Boolean)
    ).size;

    // Stage 2: Started Quiz
    // FIXED: Use analytics_events with event_name='quiz_start'
    const { data: quizStarts, error: quizStartsError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'quiz_start')
      .gte('created_at', startDateStr);

    if (quizStartsError) throw quizStartsError;

    const uniqueQuizStarts = new Set(
      quizStarts?.map((q: any) => q.session_id).filter(Boolean)
    ).size;

    // Stage 3: Reached Q10 (quiz_question_answered where question >= 10)
    // FIXED: Use analytics_events
    const { data: q10Reached, error: q10Error } = await supabase
      .from('analytics_events')
      .select('session_id, event_data')
      .eq('event_name', 'quiz_question_answered')
      .gte('created_at', startDateStr);

    if (q10Error) throw q10Error;

    // Filter for question_index >= 10
    const q10Sessions = new Set(
      q10Reached
        ?.filter((e: any) => {
          const questionIndex = e.event_data?.question_index || 0;
          return questionIndex >= 10;
        })
        .map((e: any) => e.session_id)
        .filter(Boolean)
    );
    const uniqueQ10 = q10Sessions.size;

    // Stage 4: Completed Quiz
    const { count: completedQuizzes, error: completedError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    if (completedError) throw completedError;

    // Stage 5: Viewed Results
    // FIXED: Use analytics_events with event_name='result_viewed'
    const { data: resultsViews, error: resultsError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'result_viewed')
      .gte('created_at', startDateStr);

    if (resultsError) throw resultsError;

    const uniqueResultsViews = new Set(
      resultsViews?.map((v: any) => v.session_id).filter(Boolean)
    ).size;

    // Stage 6: Viewed Checkout
    // FIXED: Use analytics_events with event_name='checkout_initiated'
    const { data: checkoutViews, error: checkoutError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'checkout_initiated')
      .gte('created_at', startDateStr);

    if (checkoutError) throw checkoutError;

    const uniqueCheckoutViews = new Set(
      checkoutViews?.map((v: any) => v.session_id).filter(Boolean)
    ).size;

    // Stage 7: Initiated Payment
    // Use product_selected event as proxy
    const { data: checkoutInitiations, error: initiationError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'product_selected')
      .gte('created_at', startDateStr);

    if (initiationError) throw initiationError;

    const uniqueInitiations = new Set(
      checkoutInitiations?.map((e: any) => e.session_id).filter(Boolean)
    ).size;

    // Stage 8: Completed Purchase
    // FIXED: Check for both 'completed' and 'paid' status
    const { count: completedPurchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'paid'])
      .gte('created_at', startDateStr);

    if (purchaseError) throw purchaseError;

    // Build funnel stages with percentages
    const stages: FunnelStage[] = [
      {
        stage: 'Landing Page Visit',
        count: uniqueLandingVisitors,
        percentage: 100,
      },
      {
        stage: 'Started Quiz',
        count: uniqueQuizStarts,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round((uniqueQuizStarts / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Reached Q10',
        count: uniqueQ10,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round((uniqueQ10 / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Completed Quiz',
        count: completedQuizzes || 0,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round(((completedQuizzes || 0) / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Viewed Results',
        count: uniqueResultsViews,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round((uniqueResultsViews / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Viewed Checkout',
        count: uniqueCheckoutViews,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round((uniqueCheckoutViews / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Initiated Payment',
        count: uniqueInitiations,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round((uniqueInitiations / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
      {
        stage: 'Completed Purchase',
        count: completedPurchases || 0,
        percentage:
          uniqueLandingVisitors > 0
            ? Math.round(((completedPurchases || 0) / uniqueLandingVisitors) * 10000) / 100
            : 0,
      },
    ];

    logger.info('Funnel stats fetched successfully', {
      context: 'funnel-api',
      data: { days, stages: stages.length },
    });

    return NextResponse.json(stages);
  } catch (error) {
    logger.error('Failed to fetch funnel stats', error, {
      context: 'funnel-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch funnel statistics' },
      { status: 500 }
    );
  }
}
