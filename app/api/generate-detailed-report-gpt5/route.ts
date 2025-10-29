/**
 * Generate Detailed Report API Route (GPT-5 Version)
 * POST /api/generate-detailed-report-gpt5
 *
 * Generates a personalized 18-20 page PDF report using GPT-5 and uploads to Supabase Storage
 *
 * v2.2 Implementation - Analysis-Only Report
 * - NO elsősegély terv (first aid plan)
 * - NO weekly action plan
 * - ONLY detailed analysis, root causes, forecasts, and fixed exercises
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";
import { generateGPT5Report } from "@/lib/openai/report-generator-gpt5";
import { generateReportPDF } from "@/lib/pdf/report-template-gpt5";
import type { QuizResult } from "@/types";

// Supabase client with service role key for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/generate-detailed-report-gpt5
 *
 * Request body:
 * {
 *   result_id: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   pdf_url: string,
 *   file_name: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // LAYER 1: Input Validation
    const body = await request.json();
    const { result_id } = body;

    if (!result_id) {
      logger.error("[GPT5_REPORT] Missing result_id in request");
      return NextResponse.json(
        {
          data: null,
          error: { message: "Missing result_id", code: "MISSING_RESULT_ID" },
        },
        { status: 400 }
      );
    }

    logger.info("[GPT5_REPORT] Starting report generation", { result_id });

    // LAYER 2: Fetch Quiz Result - 404 if not found
    const { data: result, error: fetchError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", result_id)
      .single();

    if (fetchError || !result) {
      logger.error("[GPT5_REPORT] Quiz result not found", {
        result_id,
        error: fetchError,
      });
      return NextResponse.json(
        {
          data: null,
          error: { message: "Quiz result not found", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    const quizResult = result as QuizResult;

    // LAYER 3: Generate AI Report with GPT-5 (9 API calls)
    logger.info("[GPT5_REPORT] Calling GPT-5 to generate report", {
      result_id,
      user_name: quizResult.name,
    });

    let gpt5Report;
    try {
      gpt5Report = await generateGPT5Report(
        quizResult.chakra_scores,
        quizResult.answers,
        quizResult.name
      );
      logger.info("[GPT5_REPORT] GPT-5 report generated successfully", {
        result_id,
      });
    } catch (error) {
      // LAYER 4: GPT-5 API Errors
      logger.error("[GPT5_REPORT] GPT-5 API error", {
        result_id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to generate AI report",
            code: "GPT5_API_ERROR",
          },
        },
        { status: 500 }
      );
    }

    // LAYER 5: Generate PDF Document
    logger.info("[GPT5_REPORT] Generating PDF document", { result_id });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateReportPDF(
        gpt5Report,
        quizResult.chakra_scores,
        quizResult.name,
        quizResult.email
      );
      logger.info("[GPT5_REPORT] PDF generated successfully", {
        result_id,
        size_bytes: pdfBuffer.length,
      });
    } catch (error) {
      // LAYER 5: PDF Generation Errors
      logger.error("[GPT5_REPORT] PDF generation error", {
        result_id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to generate PDF",
            code: "PDF_GENERATION_ERROR",
          },
        },
        { status: 500 }
      );
    }

    // LAYER 6: Upload to Supabase Storage (with retry logic)
    const timestamp = Date.now();
    const fileName = `detailed-report-${result_id}-${timestamp}.pdf`;
    const filePath = `${fileName}`;

    logger.info("[GPT5_REPORT] Uploading PDF to Supabase Storage", {
      result_id,
      file_name: fileName,
      size_bytes: pdfBuffer.length,
    });

    // Retry logic for Supabase upload (3 attempts)
    let uploadSuccess = false;
    let uploadError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data: uploadData, error: attemptError } = await supabase.storage
          .from("detailed-reports")
          .upload(filePath, pdfBuffer, {
            contentType: "application/pdf",
            cacheControl: "3600",
            upsert: false,
          });

        if (attemptError) {
          throw attemptError;
        }

        uploadSuccess = true;
        logger.info("[GPT5_REPORT] Upload successful", {
          result_id,
          attempt,
          file_path: filePath,
        });
        break;
      } catch (error) {
        uploadError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`[GPT5_REPORT] Upload attempt ${attempt} failed`, {
          result_id,
          attempt,
          error: uploadError.message,
        });

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const waitMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
    }

    if (!uploadSuccess) {
      logger.error("[GPT5_REPORT] Failed to upload PDF after retries", {
        result_id,
        retries: maxRetries,
        error: uploadError?.message,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to upload PDF to storage",
            code: "UPLOAD_FAILED",
          },
        },
        { status: 500 }
      );
    }

    // Generate signed URL (30-day expiry)
    const expirySeconds = 60 * 60 * 24 * 30; // 30 days
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("detailed-reports")
        .createSignedUrl(filePath, expirySeconds);

    if (signedUrlError || !signedUrlData) {
      logger.error("[GPT5_REPORT] Failed to generate signed URL", {
        result_id,
        error: signedUrlError,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to generate download URL",
            code: "SIGNED_URL_FAILED",
          },
        },
        { status: 500 }
      );
    }

    // Update purchase record with PDF URL
    const { error: updateError } = await supabase
      .from("purchases")
      .update({ pdf_url: signedUrlData.signedUrl })
      .eq("result_id", result_id)
      .eq("product_id", "ai_analysis_pdf");

    if (updateError) {
      logger.warn("[GPT5_REPORT] Failed to update purchase record", {
        result_id,
        error: updateError,
      });
      // Don't fail the request - PDF is already uploaded
    } else {
      logger.info("[GPT5_REPORT] Purchase record updated with PDF URL", {
        result_id,
      });
    }

    // Send email with PDF download link
    try {
      logger.info("[GPT5_REPORT] Sending email with PDF link", { result_id });

      // Fetch purchase data for product metadata
      const { data: purchase } = await supabase
        .from('purchases')
        .select('product_name')
        .eq('result_id', result_id)
        .eq('product_id', 'ai_analysis_pdf')
        .single();

      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-purchase-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: quizResult.name,
            email: quizResult.email,
            downloadUrl: signedUrlData.signedUrl,
            resultId: result_id,
            productName: purchase?.product_name,
            productType: 'ai_analysis_pdf',
          }),
        }
      );

      if (!emailResponse.ok) {
        logger.warn("[GPT5_REPORT] Email sending failed", {
          result_id,
          status: emailResponse.status,
        });
      } else {
        const emailData = await emailResponse.json();
        logger.info("[GPT5_REPORT] Email sent successfully", {
          result_id,
          email_id: emailData.data?.emailId,
        });
      }
    } catch (emailError) {
      // Don't fail the request if email fails - PDF is already generated
      logger.error("[GPT5_REPORT] Email sending error", {
        result_id,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    logger.info("[GPT5_REPORT] Report generation complete", {
      result_id,
      pdf_url: signedUrlData.signedUrl,
      file_name: fileName,
    });

    return NextResponse.json({
      data: {
        success: true,
        pdf_url: signedUrlData.signedUrl,
        file_name: fileName,
      },
      error: null,
    });
  } catch (error) {
    // LAYER 7: Catch-all for unexpected errors
    logger.error("[GPT5_REPORT] Unexpected error in report generation", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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
