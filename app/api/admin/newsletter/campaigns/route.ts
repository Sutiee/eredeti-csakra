/**
 * Newsletter Campaigns History API Route
 * GET /api/admin/newsletter/campaigns
 *
 * Fetches campaign history with aggregate statistics from newsletter_sends
 * Protected route requiring admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Campaign status type
 */
type CampaignStatus = 'draft' | 'sending' | 'completed' | 'failed';

/**
 * Campaign data with aggregated statistics
 */
type Campaign = {
  id: string;
  name: string;
  subject: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: CampaignStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  // Calculated metrics
  success_rate: number;
  failure_rate: number;
  // Aggregated from newsletter_sends
  actual_sent: number;
  actual_failed: number;
};

/**
 * Response type
 */
type CampaignsResponse = {
  data: {
    campaigns: Campaign[];
    total: number;
    hasMore: boolean;
  } | null;
  error: { message: string; code?: string } | null;
};

/**
 * GET handler for campaign history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const statusFilter = searchParams.get('status') as CampaignStatus | null;

    logger.debug('Fetching newsletter campaigns', {
      context: 'GET /api/admin/newsletter/campaigns',
      data: { limit, offset, statusFilter },
    });

    const supabase = createSupabaseClient();

    // Build campaign query
    let campaignQuery = supabase
      .from('newsletter_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (statusFilter && ['draft', 'sending', 'completed', 'failed'].includes(statusFilter)) {
      campaignQuery = campaignQuery.eq('status', statusFilter);
    }

    // Execute campaign query
    const { data: campaigns, error: campaignError, count } = await campaignQuery;

    if (campaignError) {
      throw campaignError;
    }

    if (!campaigns) {
      logger.warn('No campaigns found', {
        context: 'GET /api/admin/newsletter/campaigns',
      });

      const response: CampaignsResponse = {
        data: {
          campaigns: [],
          total: 0,
          hasMore: false,
        },
        error: null,
      };

      return NextResponse.json(response);
    }

    // Fetch aggregated send statistics for all campaigns
    const campaignIds = campaigns.map((c) => c.id);

    // Get actual sent/failed counts from newsletter_sends
    const { data: sendStats, error: statsError } = await supabase
      .from('newsletter_sends')
      .select('campaign_id, status')
      .in('campaign_id', campaignIds);

    if (statsError) {
      logger.error('Failed to fetch send statistics', statsError, {
        context: 'GET /api/admin/newsletter/campaigns',
      });
      // Continue without stats - use campaign counters as fallback
    }

    // Aggregate stats per campaign
    const statsMap = new Map<
      string,
      { actual_sent: number; actual_failed: number }
    >();

    if (sendStats) {
      sendStats.forEach((send) => {
        const campaignId = send.campaign_id;
        if (!statsMap.has(campaignId)) {
          statsMap.set(campaignId, { actual_sent: 0, actual_failed: 0 });
        }

        const stats = statsMap.get(campaignId)!;
        if (send.status === 'sent') {
          stats.actual_sent += 1;
        } else if (send.status === 'failed') {
          stats.actual_failed += 1;
        }
      });
    }

    // Transform campaigns with calculated metrics
    const enrichedCampaigns: Campaign[] = campaigns.map((campaign) => {
      const stats = statsMap.get(campaign.id) || {
        actual_sent: 0,
        actual_failed: 0,
      };

      // Use actual counts from newsletter_sends if available, otherwise use campaign counters
      const sentCount = stats.actual_sent || campaign.sent_count || 0;
      const failedCount = stats.actual_failed || campaign.failed_count || 0;
      const totalRecipients = campaign.total_recipients || 0;

      // Calculate success and failure rates
      const success_rate =
        totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0;
      const failure_rate =
        totalRecipients > 0 ? (failedCount / totalRecipients) * 100 : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        total_recipients: totalRecipients,
        sent_count: campaign.sent_count || 0,
        failed_count: campaign.failed_count || 0,
        status: campaign.status as CampaignStatus,
        started_at: campaign.started_at,
        completed_at: campaign.completed_at,
        created_at: campaign.created_at,
        success_rate: Math.round(success_rate * 100) / 100, // Round to 2 decimals
        failure_rate: Math.round(failure_rate * 100) / 100, // Round to 2 decimals
        actual_sent: stats.actual_sent,
        actual_failed: stats.actual_failed,
      };
    });

    // Prepare response
    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: CampaignsResponse = {
      data: {
        campaigns: enrichedCampaigns,
        total,
        hasMore,
      },
      error: null,
    };

    logger.info('Newsletter campaigns fetched successfully', {
      context: 'GET /api/admin/newsletter/campaigns',
      data: {
        count: enrichedCampaigns.length,
        total,
        hasMore,
        offset,
        limit,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch newsletter campaigns', error, {
      context: 'GET /api/admin/newsletter/campaigns',
    });

    const response: CampaignsResponse = {
      data: null,
      error: {
        message: 'Failed to fetch newsletter campaigns',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
