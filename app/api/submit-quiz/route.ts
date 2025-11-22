/**
 * POST /api/submit-quiz
 * Submit quiz answers, calculate scores, and save to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { calculateChakraScores, validateQuizAnswers } from '@/lib/quiz/scoring';
import { logger } from '@/lib/utils/logger';
import type { QuizAnswers, ChakraScores } from '@/types';

/**
 * Zod validation schema for quiz submission
 */
const QuizSubmissionSchema = z.object({
  name: z.string().min(1, 'Név megadása kötelező').max(100, 'A név maximum 100 karakter lehet'),
  email: z.string().email('Érvényes email cím megadása kötelező'),
  age: z.number().int().min(16, 'Minimum 16 éves korhatár').max(99, 'Maximum 99 év lehet').optional(),
  answers: z
    .array(z.number().int().min(1).max(4))
    .length(28, 'Pontosan 28 válasz szükséges (7 csakra × 4 kérdés)'),
  light_result_id: z.string().uuid('Érvénytelen light_result_id formátum').optional(),
});

/**
 * POST handler for quiz submission
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    logger.info('Received quiz submission', {
      context: 'POST /api/submit-quiz',
      data: { hasName: !!body.name, hasEmail: !!body.email, answersCount: body.answers?.length },
    });

    // Validate request data
    const validationResult = QuizSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      logger.error('Validation failed', validationResult.error, {
        context: 'POST /api/submit-quiz',
        data: { errors: validationResult.error.errors },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Érvénytelen adatok',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { name, email, age, answers, light_result_id } = validationResult.data;

    // Additional validation for answers array
    try {
      validateQuizAnswers(answers);
    } catch (error) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: error instanceof Error ? error.message : 'Érvénytelen válaszok',
            code: 'INVALID_ANSWERS',
          },
        },
        { status: 400 }
      );
    }

    // Calculate chakra scores
    let chakraScores: ChakraScores;
    try {
      chakraScores = calculateChakraScores(answers as QuizAnswers);
    } catch (error) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba történt a pontszámítás során',
            code: 'SCORING_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Prepare insert data
    const insertData: {
      name: string;
      email: string;
      age: number | null;
      answers: number[];
      chakra_scores: ChakraScores;
      light_result_id?: string;
    } = {
      name,
      email,
      age: age || null,
      answers: answers as any, // Type assertion for JSONB
      chakra_scores: chakraScores as any, // Type assertion for JSONB
    };

    // Include light_result_id if provided
    if (light_result_id) {
      insertData.light_result_id = light_result_id;
    }

    const { data: result, error: dbError } = await supabase
      .from('quiz_results')
      .insert(insertData)
      .select('id, chakra_scores')
      .single();

    if (dbError || !result) {
      logger.error('Database error', dbError, {
        context: 'POST /api/submit-quiz',
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba történt az adatok mentése során',
            code: 'DATABASE_ERROR',
            details: dbError?.message || 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // If this is a conversion from light quiz, update related records and trigger PDF generation
    if (light_result_id) {
      logger.info('Processing light quiz conversion', {
        context: 'POST /api/submit-quiz',
        data: { light_result_id, full_result_id: result.id },
      });

      // 1. Update light result to mark as converted
      const { error: updateLightError } = await supabase
        .from('quiz_results')
        .update({ converted_to_full: true })
        .eq('id', light_result_id);

      if (updateLightError) {
        logger.error('Failed to update light result conversion status', updateLightError, {
          context: 'POST /api/submit-quiz',
          data: { light_result_id },
        });
        // Don't fail the request, just log the error
      }

      // 2. Find and update the purchase that references the light result
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, product_id')
        .eq('result_id', light_result_id)
        .eq('status', 'completed')
        .single();

      if (purchaseError || !purchase) {
        logger.error('Failed to find purchase for light result', purchaseError, {
          context: 'POST /api/submit-quiz',
          data: { light_result_id },
        });
        // Don't fail the request, the user still gets their result
      } else {
        // 3. Update the purchase with the new full result_id
        const { error: updatePurchaseError } = await supabase
          .from('purchases')
          .update({ result_id: result.id })
          .eq('id', purchase.id);

        if (updatePurchaseError) {
          logger.error('Failed to update purchase result_id', updatePurchaseError, {
            context: 'POST /api/submit-quiz',
            data: { purchase_id: purchase.id, new_result_id: result.id },
          });
        } else {
          logger.info('Updated purchase with new full result_id', {
            context: 'POST /api/submit-quiz',
            data: { purchase_id: purchase.id, old_result_id: light_result_id, new_result_id: result.id },
          });

          // 4. Trigger PDF generation for the purchase
          // Only trigger for AI Analysis PDF product (personalized report)
          if (purchase.product_id === 'ai_analysis_pdf') {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
              const pdfResponse = await fetch(`${baseUrl}/api/generate-detailed-report-gpt5`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ result_id: result.id }),
              });

              if (!pdfResponse.ok) {
                const errorData = await pdfResponse.json();
                logger.error('Failed to trigger PDF generation', errorData, {
                  context: 'POST /api/submit-quiz',
                  data: { result_id: result.id, purchase_id: purchase.id },
                });
              } else {
                const pdfData = await pdfResponse.json();
                logger.info('PDF generation triggered successfully', {
                  context: 'POST /api/submit-quiz',
                  data: { result_id: result.id, pdf_url: pdfData.pdf_url },
                });

                // Update purchase with PDF URL if returned
                if (pdfData.pdf_url) {
                  await supabase
                    .from('purchases')
                    .update({ pdf_url: pdfData.pdf_url })
                    .eq('id', purchase.id);
                }
              }
            } catch (pdfError) {
              logger.error('Error triggering PDF generation', pdfError, {
                context: 'POST /api/submit-quiz',
                data: { result_id: result.id },
              });
            }
          }
        }
      }
    }

    // Success response
    return NextResponse.json(
      {
        data: {
          id: result.id,
          chakra_scores: result.chakra_scores,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Unexpected error in POST /api/submit-quiz', error, {
      context: 'POST /api/submit-quiz',
    });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Váratlan hiba történt',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 * Allows requests from same origin and configured domains
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // In development, allow all origins; in production, only allow configured origins
  if (process.env.NODE_ENV === 'development') {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  } else if (allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Vary'] = 'Origin';
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
