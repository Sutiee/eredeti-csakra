/**
 * Send Purchase Email API Route
 * POST /api/send-purchase-email
 *
 * Sends purchase confirmation email with PDF download link using Resend
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";
import {
  generatePurchaseConfirmationEmail,
  generatePurchaseConfirmationEmailText,
} from "@/lib/email/templates";

// Resend client with fallback API key handling
if (!process.env.RESEND_API_KEY) {
  console.warn("[SEND_PURCHASE_EMAIL] Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * POST /api/send-purchase-email
 *
 * Request body:
 * {
 *   name: string,
 *   email: string,
 *   downloadUrl: string,
 *   resultId: string,
 *   productName?: string,
 *   productType?: 'ai_analysis_pdf' | 'workbook_30day'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   emailId: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, downloadUrl, resultId, productName, productType } = body;

    // Validate inputs
    if (!name || !email || !downloadUrl || !resultId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Missing required fields",
            code: "MISSING_FIELDS",
          },
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Invalid email address", code: "INVALID_EMAIL" },
        },
        { status: 400 }
      );
    }

    logger.info("Sending purchase confirmation email", {
      name,
      email,
      resultId,
      productType,
    });

    // Generate email HTML and text
    const emailHtml = generatePurchaseConfirmationEmail({
      name,
      downloadUrl,
      resultId,
      productName,
      productType,
    });

    const emailText = generatePurchaseConfirmationEmailText({
      name,
      downloadUrl,
      resultId,
      productName,
      productType,
    });

    // Dynamic subject line based on product type
    const subject = productType === 'workbook_30day'
      ? "Készen áll a 30 Napos Csakra Munkafüzeted! 📖"
      : "Köszönjük a vásárlásod! - Személyre Szabott Csakra Elemzésed";

    // Send email with Resend (with fallback sender for testing)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({
      from: `Eredeti Csakra <${fromEmail}>`,
      to: [email],
      subject,
      html: emailHtml,
      text: emailText,
      tags: [
        { name: "type", value: "purchase-confirmation" },
        { name: "result_id", value: resultId },
        { name: "product_type", value: productType || "ai_analysis_pdf" },
      ],
    });

    if (error) {
      logger.error("Failed to send email with Resend", {
        error,
        email,
        resultId,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to send email",
            code: "EMAIL_SEND_FAILED",
          },
        },
        { status: 500 }
      );
    }

    logger.info("Email sent successfully", {
      emailId: data?.id,
      email,
      resultId,
    });

    return NextResponse.json({
      data: {
        success: true,
        emailId: data?.id,
      },
      error: null,
    });
  } catch (error) {
    logger.error("Failed to send purchase email", { error });

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
