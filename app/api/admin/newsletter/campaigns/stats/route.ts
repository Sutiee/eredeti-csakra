/**
 * Newsletter Campaigns Stats API Route
 *
 * GET /api/admin/newsletter/campaigns/stats
 *
 * Returns aggregate statistics for all newsletter campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Campaign statistics response type
 */
type CampaignStatsResponse = {
  data: {
    totalCampaigns: number;
    totalEmailsSent: number;
    totalEmailsFailed: number;
    averageSuccessRate: number;
    lastCampaignDate: string | null;
  } | null;
  error: { message: string } | null;
};

/**
 * GET /api/admin/newsletter/campaigns/stats
 *
 * Fetches aggregate statistics across all newsletter campaigns
 */
export async function GET(request: NextRequest): Promise<NextResponse<CampaignStatsResponse>> {
  try {
    // Protect admin route
    const authError = await protectAdminRoute(request);
    if (authError) return authError as NextResponse<CampaignStatsResponse>;

    const supabase = createSupabaseClient();

    // Fetch aggregate statistics
    const { data: campaigns, error: campaignsError } = await supabase
      .from('newsletter_campaigns')
      .select('id, sent_count, failed_count, total_recipients, created_at, status')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      logger.error('[API] [newsletter/campaigns/stats] Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Hiba történt a kampány statisztikák betöltése közben' },
        },
        { status: 500 }
      );
    }

    // Calculate aggregate metrics
    const totalCampaigns = campaigns?.length || 0;
    const totalEmailsSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
    const totalEmailsFailed = campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0;

    // Calculate average success rate (only for completed campaigns)
    const completedCampaigns = campaigns?.filter(c => c.status === 'completed' && c.total_recipients > 0) || [];
    const averageSuccessRate = completedCampaigns.length > 0
      ? completedCampaigns.reduce((sum, c) => {
          const rate = (c.sent_count / c.total_recipients) * 100;
          return sum + rate;
        }, 0) / completedCampaigns.length
      : 0;

    // Get last campaign date
    const lastCampaignDate = campaigns && campaigns.length > 0 ? campaigns[0].created_at : null;

    return NextResponse.json({
      data: {
        totalCampaigns,
        totalEmailsSent,
        totalEmailsFailed,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100, // Round to 2 decimals
        lastCampaignDate,
      },
      error: null,
    });

  } catch (error) {
    logger.error('[API] [newsletter/campaigns/stats] Unexpected error:', error);
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Belső szerverhiba történt' },
      },
      { status: 500 }
    );
  }
}
