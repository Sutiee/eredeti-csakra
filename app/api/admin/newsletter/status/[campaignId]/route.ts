/**
 * Newsletter Campaign Status API Route
 * GET /api/admin/newsletter/status/[campaignId]
 *
 * Returns detailed status and statistics for a newsletter campaign
 * Protected route requiring admin authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { protectAdminRoute } from "@/lib/admin/middleware";
import { createServiceRoleClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";

/**
 * Campaign status response type
 */
type CampaignStatusResponse = {
  campaignId: string;
  name: string;
  subject: string;
  status: "draft" | "sending" | "completed" | "failed";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: string;
  failureRate: string;
  startedAt: string | null;
  completedAt: string | null;
  sends: {
    sent: number;
    failed: number;
    pending: number;
  };
};

/**
 * GET handler for campaign status
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    // Await params to get campaignId
    const params = await context.params;
    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Campaign ID is required",
            code: "MISSING_CAMPAIGN_ID",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Fetching campaign status", {
      context: "GET /api/admin/newsletter/status/[campaignId]",
      data: { campaignId },
    });

    const supabase = createServiceRoleClient();

    // Fetch campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      logger.error("Campaign not found", campaignError, {
        context: "GET /api/admin/newsletter/status/[campaignId]",
        data: { campaignId },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Campaign not found",
            code: "CAMPAIGN_NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    // Fetch send records grouped by status
    const { data: sends, error: sendsError } = await supabase
      .from("newsletter_sends")
      .select("status")
      .eq("campaign_id", campaignId);

    if (sendsError) {
      logger.error("Failed to fetch send records", sendsError, {
        context: "GET /api/admin/newsletter/status/[campaignId]",
        data: { campaignId },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to fetch campaign sends",
            code: "SENDS_FETCH_FAILED",
          },
        },
        { status: 500 }
      );
    }

    // Count sends by status
    const sendCounts = {
      sent: 0,
      failed: 0,
      pending: 0,
    };

    (sends || []).forEach((send) => {
      const status = send.status as "sent" | "failed" | "pending";
      if (status in sendCounts) {
        sendCounts[status]++;
      }
    });

    // Calculate statistics
    const totalRecipients = campaign.total_recipients || 0;
    const sentCount = campaign.sent_count || 0;
    const failedCount = campaign.failed_count || 0;
    const pendingCount = totalRecipients - sentCount - failedCount;

    const successRate =
      totalRecipients > 0
        ? ((sentCount / totalRecipients) * 100).toFixed(2) + "%"
        : "0%";

    const failureRate =
      totalRecipients > 0
        ? ((failedCount / totalRecipients) * 100).toFixed(2) + "%"
        : "0%";

    const response: CampaignStatusResponse = {
      campaignId: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status as "draft" | "sending" | "completed" | "failed",
      totalRecipients,
      sentCount,
      failedCount,
      pendingCount: Math.max(0, pendingCount), // Ensure non-negative
      successRate,
      failureRate,
      startedAt: campaign.started_at,
      completedAt: campaign.completed_at,
      sends: sendCounts,
    };

    logger.info("Campaign status fetched successfully", {
      context: "GET /api/admin/newsletter/status/[campaignId]",
      data: {
        campaignId,
        status: campaign.status,
        sentCount,
        failedCount,
      },
    });

    return NextResponse.json({
      data: response,
      error: null,
    });
  } catch (error) {
    logger.error("Failed to fetch campaign status", error, {
      context: "GET /api/admin/newsletter/status/[campaignId]",
    });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
