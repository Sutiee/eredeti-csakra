/**
 * Batch Newsletter Send API Route
 * POST /api/admin/newsletter/send
 *
 * Sends personalized newsletter emails to up to 1000 recipients using Resend Batch API
 * Protected route requiring admin authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { protectAdminRoute } from "@/lib/admin/middleware";
import { createServiceRoleClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import { generateNewsletterEmail as generateActualNewsletterEmail } from "@/lib/email/newsletter-templates";

// Next.js route config - Free tier limited to 10 seconds
// For larger campaigns, use external queue service (e.g., Vercel Cron, BullMQ)
export const maxDuration = 10; // Free tier max (Pro: 60, Enterprise: 300)

// Resend client initialization
if (!process.env.RESEND_API_KEY) {
  console.warn("[NEWSLETTER_SEND] Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Constants
// VERCEL FREE TIER LIMIT: Max ~200 emails per campaign (2 batches × 100 emails)
// This ensures completion within 10-second timeout (2 batches × 500ms delay + API time)
// For larger campaigns, upgrade to Pro ($20/mo) or use external queue service
const MAX_RECIPIENTS = 200; // Free tier safe limit (Pro: 1000+)
const BATCH_SIZE = 100; // Resend batch API limit
const RATE_LIMIT_DELAY_MS = 500; // 2 requests per second

/**
 * Newsletter recipient type
 */
type NewsletterRecipient = {
  email: string;
  name: string;
  variant: "a" | "b" | "c";
};

/**
 * Request body schema
 */
type SendNewsletterRequest = {
  recipients: NewsletterRecipient[];
  subject: string;
  templateVariant: "a" | "b" | "c";
  campaignName: string;
};

/**
 * Split array into batches
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Removed placeholder - using actual template from @/lib/email/newsletter-templates

/**
 * POST handler for batch newsletter send
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    // Parse request body
    const body: SendNewsletterRequest = await request.json();
    const { recipients, subject, campaignName } = body;

    // Debug logging
    console.log('[NEWSLETTER_SEND] Received request:', {
      recipientsCount: recipients?.length,
      subject,
      campaignName,
      hasRecipients: !!recipients,
      isArray: Array.isArray(recipients),
    });

    // Validate inputs
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Recipients array is required and cannot be empty",
            code: "INVALID_RECIPIENTS",
          },
        },
        { status: 400 }
      );
    }

    if (recipients.length > MAX_RECIPIENTS) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `Maximum ${MAX_RECIPIENTS} recipients allowed`,
            code: "TOO_MANY_RECIPIENTS",
          },
        },
        { status: 400 }
      );
    }

    if (!subject || !campaignName) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Subject and campaign name are required",
            code: "MISSING_REQUIRED_FIELDS",
          },
        },
        { status: 400 }
      );
    }

    // Validate recipient structure
    for (const recipient of recipients) {
      if (!recipient.email || !recipient.name || !recipient.variant) {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: "Each recipient must have email, name, and variant",
              code: "INVALID_RECIPIENT_STRUCTURE",
            },
          },
          { status: 400 }
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.email)) {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: `Invalid email address: ${recipient.email}`,
              code: "INVALID_EMAIL",
            },
          },
          { status: 400 }
        );
      }

      // Variant validation
      if (!["a", "b", "c"].includes(recipient.variant)) {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: "Variant must be 'a', 'b', or 'c'",
              code: "INVALID_VARIANT",
            },
          },
          { status: 400 }
        );
      }
    }

    logger.info("Starting batch newsletter send", {
      context: "POST /api/admin/newsletter/send",
      data: { campaignName, recipientCount: recipients.length },
    });

    const supabase = createServiceRoleClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Create campaign record
    const campaignStartTime = new Date().toISOString();
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        name: campaignName,
        subject_line: subject,
        email_template_variant: 'a', // Using variant 'a' - recipients have individual variants in CSV
        status: "sending",
        total_recipients: recipients.length,
        sent_count: 0,
        failed_count: 0,
        started_at: campaignStartTime,
      } as any)
      .select()
      .single();

    if (campaignError || !campaign) {
      logger.error("Failed to create campaign record", campaignError, {
        context: "POST /api/admin/newsletter/send",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to create campaign",
            code: "CAMPAIGN_CREATION_FAILED",
          },
        },
        { status: 500 }
      );
    }

    const campaignId = campaign.id;
    logger.info("Campaign created", {
      context: "POST /api/admin/newsletter/send",
      data: { campaignId, campaignName },
    });

    // Start background processing using waitUntil (ensures completion even after response)
    // @ts-ignore - waitUntil is available in Vercel Edge/Node runtime
    if (typeof globalThis.waitUntil === 'function') {
      // @ts-ignore
      globalThis.waitUntil(
        processCampaignInBackground(campaignId, recipients, subject, fromEmail).catch((error) => {
          logger.error("Background campaign processing failed", error, {
            context: "POST /api/admin/newsletter/send",
            data: { campaignId },
          });
        })
      );
    } else {
      // Fallback for local development (no waitUntil)
      processCampaignInBackground(campaignId, recipients, subject, fromEmail).catch((error) => {
        logger.error("Background campaign processing failed", error, {
          context: "POST /api/admin/newsletter/send",
          data: { campaignId },
        });
      });
    }

    // Return immediately with campaign ID
    return NextResponse.json({
      data: {
        campaignId,
        status: "sending",
        message: "Campaign started successfully. Emails are being sent in the background.",
        totalRecipients: recipients.length,
      },
      error: null,
    });
  } catch (error) {
    logger.error("Campaign creation error", error, {
      context: "POST /api/admin/newsletter/send",
    });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "CAMPAIGN_ERROR",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Process campaign emails in background
 */
async function processCampaignInBackground(
  campaignId: string,
  recipients: NewsletterRecipient[],
  subject: string,
  fromEmail: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  // Split recipients into batches
  const batches = chunkArray(recipients, BATCH_SIZE);
  let totalSent = 0;
  let totalFailed = 0;

  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      logger.info(`Processing batch ${batchIndex + 1}/${batches.length}`, {
        context: "POST /api/admin/newsletter/send",
        data: { batchSize: batch.length },
      });

      // Prepare emails for batch send
      const emails = batch.map((recipient) => {
        // Generate email using actual template with recipient's variant
        const emailResult = generateActualNewsletterEmail({
          name: recipient.name,
          variantId: recipient.variant,
          campaignId: campaignId,
        });

        // Personalize subject line with recipient's name
        const personalizedSubject = subject.replace('{{name}}', recipient.name);

        return {
          from: `Eredeti Csakra <${fromEmail}>`,
          to: [recipient.email],
          subject: personalizedSubject,
          html: emailResult.html,
          tags: [
            { name: "campaign_id", value: campaignId },
            { name: "variant", value: recipient.variant },
            { name: "type", value: "newsletter" },
          ],
        };
      });

      try {
        // Send batch via Resend
        const { data: batchResult, error: batchError } = await resend.batch.send(
          emails
        );

        if (batchError) {
          logger.error(`Batch ${batchIndex + 1} send failed`, batchError, {
            context: "POST /api/admin/newsletter/send",
          });

          // Create failed send records
          const failedRecords = batch.map((recipient) => ({
            campaign_id: campaignId,
            email: recipient.email,
            name: recipient.name,
            variant_id: recipient.variant,
            status: "failed" as const,
            error_message: batchError.message || "Batch send failed",
            sent_at: new Date().toISOString(),
          }));

          await supabase.from("newsletter_sends").insert(failedRecords as any);
          totalFailed += batch.length;

          // Continue to next batch instead of aborting
          continue;
        }

        // Create successful send records
        const successRecords = batch.map((recipient, index) => ({
          campaign_id: campaignId,
          email: recipient.email,
          name: recipient.name,
          variant_id: recipient.variant,
          status: "sent" as const,
          resend_email_id: batchResult?.data?.[index]?.id || null,
          sent_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from("newsletter_sends")
          .insert(successRecords as any);

        if (insertError) {
          logger.error("Failed to log send records", insertError, {
            context: "POST /api/admin/newsletter/send",
          });
        }

        totalSent += batch.length;

        logger.info(`Batch ${batchIndex + 1} sent successfully`, {
          context: "POST /api/admin/newsletter/send",
          data: { emailsSent: batch.length },
        });
      } catch (error) {
        logger.error(`Batch ${batchIndex + 1} error`, error, {
          context: "POST /api/admin/newsletter/send",
        });

        // Log failed sends
        const failedRecords = batch.map((recipient) => ({
          campaign_id: campaignId,
          email: recipient.email,
          name: recipient.name,
          variant_id: recipient.variant,
          status: "failed" as const,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          sent_at: new Date().toISOString(),
        }));

        await supabase.from("newsletter_sends").insert(failedRecords as any);
        totalFailed += batch.length;
      }

      // Rate limiting: Wait 500ms between batches (2 req/sec)
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
      }
    }

    // Calculate campaign status
    const failureRate = totalFailed / recipients.length;
    const campaignStatus =
      failureRate > 0.5 ? "failed" : totalSent > 0 ? "completed" : "failed";

    // Update campaign with final statistics
    const { error: updateError } = await supabase
      .from("newsletter_campaigns")
      .update({
        status: campaignStatus,
        sent_count: totalSent,
        failed_count: totalFailed,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (updateError) {
      logger.error("Failed to update campaign status", updateError, {
        context: "POST /api/admin/newsletter/send",
      });
    }

    logger.info("Newsletter campaign completed in background", {
      context: "processCampaignInBackground",
      data: {
        campaignId,
        totalSent,
        totalFailed,
        status: campaignStatus,
      },
    });
}
