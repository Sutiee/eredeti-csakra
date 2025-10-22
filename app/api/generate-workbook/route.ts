/**
 * API Route: Generate 30-Day Workbook
 * POST /api/generate-workbook
 *
 * Generates personalized 30-day chakra workbook using GPT-5-mini.
 * Triggered by Stripe webhook after workbook purchase.
 *
 * Flow:
 * 1. Fetch quiz result (chakra scores + user info)
 * 2. Generate 30-day workbook content (2 GPT-5 API calls)
 * 3. Generate PDF with @react-pdf/renderer
 * 4. Upload PDF to Supabase Storage
 * 5. Update purchase record with pdf_url
 *
 * Phase: v2.5 - 30 Napos Csakra Munkafüzet
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { generateWorkbookContent } from '@/lib/openai/workbook-generator-gpt5';
import { generateWorkbookPDF } from '@/lib/pdf/workbook-template-gpt5';
import type { ChakraScores } from '@/types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

const GenerateWorkbookSchema = z.object({
  result_id: z.string().uuid(),
});

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[API /api/generate-workbook] Received request');

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = GenerateWorkbookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { result_id } = validation.data;

    console.log('[API /api/generate-workbook] Generating workbook for result:', result_id);

    // Step 1: Fetch quiz result
    console.log('[API /api/generate-workbook] Fetching quiz result...');
    const { data: quizResult, error: fetchError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', result_id)
      .single();

    if (fetchError || !quizResult) {
      console.error('[API /api/generate-workbook] Quiz result not found:', fetchError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Quiz result not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    const chakraScores = quizResult.chakra_scores as ChakraScores;
    const userName = quizResult.name?.split(' ')[0] || 'Kedves';

    console.log('[API /api/generate-workbook] User:', userName);
    console.log('[API /api/generate-workbook] Chakra scores:', chakraScores);

    // Step 2: Generate workbook content with GPT-5
    console.log('[API /api/generate-workbook] Generating workbook content...');
    const generationResult = await generateWorkbookContent(chakraScores, userName);

    if (!generationResult.success || !generationResult.days) {
      console.error('[API /api/generate-workbook] Generation failed:', generationResult.error);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: generationResult.error || 'Workbook generation failed',
            code: 'GENERATION_ERROR',
          },
        },
        { status: 500 }
      );
    }

    console.log('[API /api/generate-workbook] Content generated successfully');
    console.log('[API /api/generate-workbook] Token usage:', generationResult.tokenUsage);

    // Step 3: Generate PDF
    console.log('[API /api/generate-workbook] Generating PDF...');
    const pdfBuffer = await generateWorkbookPDF({
      days: generationResult.days,
      chakraScores,
      userName,
      introduction: generationResult.introduction || '',
    });

    console.log('[API /api/generate-workbook] PDF generated, size:', pdfBuffer.length, 'bytes');

    // Step 4: Upload PDF to Supabase Storage
    console.log('[API /api/generate-workbook] Uploading PDF to Supabase Storage...');
    const fileName = `workbook_${result_id}_${Date.now()}.pdf`;
    const filePath = `workbooks/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('workbooks')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[API /api/generate-workbook] Upload failed:', uploadError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to upload PDF',
            code: 'UPLOAD_ERROR',
            details: uploadError.message,
          },
        },
        { status: 500 }
      );
    }

    console.log('[API /api/generate-workbook] PDF uploaded:', uploadData.path);

    // Step 5: Create signed URL (30-day expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('workbooks')
      .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

    if (signedUrlError || !signedUrlData) {
      console.error('[API /api/generate-workbook] Signed URL creation failed:', signedUrlError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to create download URL',
            code: 'SIGNED_URL_ERROR',
          },
        },
        { status: 500 }
      );
    }

    const pdfUrl = signedUrlData.signedUrl;
    console.log('[API /api/generate-workbook] Signed URL created');

    // Step 6: Update purchase record with pdf_url
    console.log('[API /api/generate-workbook] Updating purchase record...');
    const { data: updateData, error: updateError } = await supabase
      .from('purchases')
      .update({ pdf_url: pdfUrl })
      .eq('result_id', result_id)
      .eq('product_id', 'workbook_30day')
      .select();

    if (updateError) {
      console.error('[API /api/generate-workbook] Purchase update failed:', updateError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to update purchase record',
            code: 'UPDATE_ERROR',
            details: updateError.message,
          },
        },
        { status: 500 }
      );
    }

    console.log('[API /api/generate-workbook] Purchase updated:', updateData);

    // Success!
    console.log('[API /api/generate-workbook] ✅ Workbook generation complete!');

    return NextResponse.json({
      data: {
        success: true,
        pdf_url: pdfUrl,
        token_usage: generationResult.tokenUsage,
      },
      error: null,
    });
  } catch (error) {
    console.error('[API /api/generate-workbook] Unexpected error:', error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
