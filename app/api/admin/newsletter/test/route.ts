/**
 * Test Newsletter Email API Route
 * POST /api/admin/newsletter/test
 *
 * Sends a test newsletter email to verify template and delivery
 * Protected route requiring admin authentication
 * Does not log to database (test only)
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { protectAdminRoute } from "@/lib/admin/middleware";
import { logger } from "@/lib/utils/logger";
import { generateNewsletterEmail as generateActualNewsletterEmail } from "@/lib/email/newsletter-templates";

// Resend client initialization
if (!process.env.RESEND_API_KEY) {
  console.warn("[NEWSLETTER_TEST] Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY || "");

/**
 * Request body schema
 */
type TestNewsletterRequest = {
  testEmail: string;
  testName: string;
  variantId: "a" | "b" | "c";
  subject: string;
};

// Removed placeholder function - using actual template from /lib/email/newsletter-templates.ts

/**
 * POST handler for test newsletter send
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    // Parse request body
    const body: TestNewsletterRequest = await request.json();
    const { testEmail, testName, variantId, subject } = body;

    // Validate inputs
    if (!testEmail || !testName || !variantId || !subject) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "All fields are required: testEmail, testName, variantId, subject",
            code: "MISSING_REQUIRED_FIELDS",
          },
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Invalid email address",
            code: "INVALID_EMAIL",
          },
        },
        { status: 400 }
      );
    }

    // Variant validation
    if (!["a", "b", "c"].includes(variantId)) {
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

    logger.info("Sending test newsletter email", {
      context: "POST /api/admin/newsletter/test",
      data: { testEmail, variantId },
    });

    // Generate ACTUAL newsletter email using production template
    // This generates a realistic checkout link for preview purposes only
    // In production, each email will have unique result_id from database
    const mockResultId = "00000000-0000-0000-0000-000000000000"; // Test UUID
    const mockCampaignId = "00000000-0000-0000-0000-000000000001"; // Test campaign UUID
    const emailResult = generateActualNewsletterEmail({
      name: testName,
      variantId: variantId,
      resultId: mockResultId,
      campaignId: mockCampaignId,
    });

    // Send email with Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const { data, error } = await resend.emails.send({
      from: `Eredeti Csakra <${fromEmail}>`,
      to: [testEmail],
      subject: `[TEST] ${subject}`,
      html: emailResult.html,
      tags: [
        { name: "type", value: "newsletter-test" },
        { name: "variant", value: variantId },
      ],
    });

    if (error) {
      logger.error("Failed to send test email with Resend", error, {
        context: "POST /api/admin/newsletter/test",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to send test email",
            code: "EMAIL_SEND_FAILED",
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    logger.info("Test email sent successfully", {
      context: "POST /api/admin/newsletter/test",
      data: { emailId: data?.id, testEmail },
    });

    return NextResponse.json({
      data: {
        success: true,
        emailId: data?.id,
        testEmail,
        variant: variantId,
        message: "Test email sent successfully",
      },
      error: null,
    });
  } catch (error) {
    logger.error("Failed to send test newsletter", error, {
      context: "POST /api/admin/newsletter/test",
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
