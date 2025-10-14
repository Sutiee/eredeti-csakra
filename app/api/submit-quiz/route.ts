/**
 * POST /api/submit-quiz
 * Submit quiz answers, calculate scores, and save to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { calculateChakraScores, validateQuizAnswers } from '@/lib/quiz/scoring';
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
});

/**
 * POST handler for quiz submission
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = QuizSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
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

    const { name, email, age, answers } = validationResult.data;

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

    const { data: result, error: dbError } = await supabase
      .from('quiz_results')
      .insert({
        name,
        email,
        age: age || null,
        answers: answers as any, // Type assertion for JSONB
        chakra_scores: chakraScores as any, // Type assertion for JSONB
      })
      .select('id, chakra_scores')
      .single();

    if (dbError || !result) {
      console.error('Database error:', dbError);
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
    console.error('Unexpected error in POST /api/submit-quiz:', error);

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
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
