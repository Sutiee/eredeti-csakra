/**
 * Generate Detailed Report API Route
 * POST /api/generate-detailed-report
 *
 * Generates a personalized PDF report using GPT-4o-mini and uploads to Supabase Storage
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";
import { generateDetailedReport } from "@/lib/openai/report-generator";
import { generatePDFReport } from "@/lib/pdf/report-template";
import type { QuizResult } from "@/types";

// Supabase client with service role (for storage operations)
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
 * POST /api/generate-detailed-report
 *
 * Request body:
 * {
 *   resultId: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   downloadUrl: string,
 *   filePath: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const { resultId } = body;

    if (!resultId) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Missing resultId", code: "MISSING_RESULT_ID" },
        },
        { status: 400 }
      );
    }

    logger.info("Generating detailed report", { resultId });

    // Fetch quiz result from Supabase
    const { data: result, error: fetchError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", resultId)
      .single();

    if (fetchError || !result) {
      logger.error("Failed to fetch quiz result", {
        resultId,
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

    // Step 1: Generate report content with GPT-4o-mini
    logger.info("Calling GPT-4o-mini to generate report", { resultId });
    const generatedReport = await generateDetailedReport(
      quizResult.name,
      quizResult.chakra_scores
    );

    // Step 2: Generate PDF
    logger.info("Generating PDF document", { resultId });
    const pdfBuffer = await generatePDFReport({
      result: quizResult,
      generatedReport,
    });

    // Step 3: Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${resultId}_report_${timestamp}.pdf`;
    const filePath = `detailed-reports/${fileName}`;

    logger.info("Uploading PDF to Supabase Storage", {
      resultId,
      filePath,
      size: pdfBuffer.length,
    });

    // Ensure bucket exists (create if not)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "detailed-reports"
    );

    if (!bucketExists) {
      logger.info("Creating detailed-reports bucket");
      await supabase.storage.createBucket("detailed-reports", {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("detailed-reports")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      logger.error("Failed to upload PDF to storage", {
        resultId,
        error: uploadError,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to upload PDF",
            code: "UPLOAD_FAILED",
          },
        },
        { status: 500 }
      );
    }

    // Step 4: Generate signed URL (valid for 30 days)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("detailed-reports")
        .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

    if (signedUrlError || !signedUrlData) {
      logger.error("Failed to generate signed URL", {
        resultId,
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

    logger.info("PDF generated and uploaded successfully", {
      resultId,
      filePath,
      downloadUrl: signedUrlData.signedUrl,
    });

    return NextResponse.json({
      data: {
        success: true,
        downloadUrl: signedUrlData.signedUrl,
        filePath,
      },
      error: null,
    });
  } catch (error) {
    logger.error("Failed to generate detailed report", { error });

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
