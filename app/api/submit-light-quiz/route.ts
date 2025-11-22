import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { calculateLightScores, findPrimaryBlockedChakra } from '@/lib/quiz/light-scoring';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema for light quiz submission
const submitLightQuizSchema = z.object({
  answers: z.array(z.number().min(1).max(4)).length(7),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional(),
});

/**
 * POST /api/submit-light-quiz
 * Submit light quiz answers and get primary blocked chakra
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validation = submitLightQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid input data',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { answers, name, email, age } = validation.data;

    // Calculate light scores (one score per chakra)
    const lightScores = calculateLightScores(answers);

    // Find the primary blocked chakra
    const primaryBlockedChakra = findPrimaryBlockedChakra(lightScores);

    // Insert into database
    const { data: result, error: insertError } = await supabase
      .from('quiz_results')
      .insert({
        name,
        email,
        age: age || null,
        answers: [], // Empty for light quiz
        chakra_scores: {}, // Empty for light quiz
        quiz_type: 'light',
        light_scores: lightScores,
        primary_blocked_chakra: primaryBlockedChakra,
        converted_to_full: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[submit-light-quiz] Database error:', insertError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to save quiz result',
            code: 'DATABASE_ERROR',
            details: insertError.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: result.id,
        primary_blocked_chakra: primaryBlockedChakra,
        light_scores: lightScores,
      },
      error: null,
    });
  } catch (error) {
    console.error('[submit-light-quiz] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
