/**
 * Generate Detailed Report API Route (GPT-5 + jsPDF Version)
 * POST /api/generate-detailed-report-markdown-styled
 *
 * Generates a beautifully formatted PDF report using GPT-5-mini and jsPDF
 *
 * Features:
 * - GPT-5-mini Responses API for detailed chakra analysis
 * - jsPDF for reliable serverless PDF generation (no Chromium needed)
 * - 20-25 pages of detailed analysis
 * - Uploads to Supabase Storage with 30-day signed URLs
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateStyledMarkdownReport } from "@/lib/openai/report-generator-markdown-styled";
import { convertStyledMarkdownToPDF } from "@/lib/pdf/markdown-to-pdf-styled";
import type { QuizResult } from "@/types";

// Vercel serverless function configuration
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout for PDF generation

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
 * POST /api/generate-detailed-report-markdown-styled
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
      console.error("[MARKDOWN_STYLED_REPORT] Missing result_id");
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Missing required field: result_id",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    console.log("[MARKDOWN_STYLED_REPORT] Starting report generation for result:", result_id);

    // LAYER 2: Fetch Quiz Result
    const { data: resultData, error: resultError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", result_id)
      .single();

    if (resultError || !resultData) {
      console.error("[MARKDOWN_STYLED_REPORT] Failed to fetch quiz result:", resultError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Quiz result not found",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    const result = resultData as QuizResult;
    console.log("[MARKDOWN_STYLED_REPORT] Quiz result fetched:", result.name);

    // LAYER 3: Generate Styled Markdown Report with GPT-5
    console.log("[MARKDOWN_STYLED_REPORT] Generating styled markdown report with GPT-5...");

    const { markdown } = await generateStyledMarkdownReport(
      result.chakra_scores,
      result.name
    );

    console.log("[MARKDOWN_STYLED_REPORT] Markdown generated, length:", markdown.length);

    // LAYER 4: Convert Markdown to PDF with Puppeteer
    console.log("[MARKDOWN_STYLED_REPORT] Converting markdown to styled PDF...");

    const pdfBuffer = await convertStyledMarkdownToPDF(
      markdown,
      result.chakra_scores,
      result.name,
      result.email
    );

    console.log("[MARKDOWN_STYLED_REPORT] PDF generated, size:", pdfBuffer.length, "bytes");

    // LAYER 5: Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `detailed-report-${result_id}-${timestamp}.pdf`;
    const filePath = `detailed-reports/${fileName}`;

    console.log("[MARKDOWN_STYLED_REPORT] Uploading PDF to Supabase Storage:", filePath);

    // Retry upload logic (3 attempts with exponential backoff)
    let uploadSuccess = false;
    let uploadError: any = null;
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
          uploadError = attemptError;
          console.warn(`[MARKDOWN_STYLED_REPORT] Upload attempt ${attempt}/${maxRetries} failed:`, attemptError);

          // Wait with exponential backoff before retrying
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`[MARKDOWN_STYLED_REPORT] Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          uploadSuccess = true;
          console.log("[MARKDOWN_STYLED_REPORT] Upload successful:", uploadData);
          break;
        }
      } catch (error) {
        uploadError = error;
        console.error(`[MARKDOWN_STYLED_REPORT] Upload attempt ${attempt}/${maxRetries} exception:`, error);

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!uploadSuccess) {
      console.error("[MARKDOWN_STYLED_REPORT] Failed to upload PDF after", maxRetries, "retries");
      throw new Error(`Storage upload failed after ${maxRetries} attempts: ${uploadError?.message || 'Unknown error'}`);
    }

    // LAYER 6: Generate Signed URL (30-day expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("detailed-reports")
      .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

    if (signedUrlError || !signedUrlData) {
      console.error("[MARKDOWN_STYLED_REPORT] Failed to create signed URL:", signedUrlError);
      throw new Error("Failed to create signed URL for PDF");
    }

    console.log("[MARKDOWN_STYLED_REPORT] Signed URL created, expires in 30 days");

    // LAYER 7: Update Purchase Record with PDF URL
    const { error: updateError } = await supabase
      .from("purchases")
      .update({ pdf_url: signedUrlData.signedUrl })
      .eq("result_id", result_id)
      .eq("product_id", "ai_analysis_pdf");

    if (updateError) {
      console.error("[MARKDOWN_STYLED_REPORT] Failed to update purchase record:", updateError);
      // Don't fail the request - PDF was generated successfully
    } else {
      console.log("[MARKDOWN_STYLED_REPORT] Purchase record updated with PDF URL");
    }

    // LAYER 8: Success Response
    console.log("[MARKDOWN_STYLED_REPORT] Report generation complete!");

    return NextResponse.json({
      success: true,
      pdf_url: signedUrlData.signedUrl,
      file_name: fileName,
      size_bytes: pdfBuffer.length,
      markdown_length: markdown.length,
      generator: "GPT-5-mini + Puppeteer",
    });

  } catch (error) {
    console.error("[MARKDOWN_STYLED_REPORT] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "GENERATION_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
