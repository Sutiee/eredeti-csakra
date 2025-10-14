/**
 * GET /api/result/[id]
 * Fetch quiz result by UUID with full interpretations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getInterpretationsSummary } from '@/lib/quiz/interpretations';
import type { ChakraScores } from '@/types';

/**
 * UUID validation schema
 */
const UUIDSchema = z.string().uuid('Érvénytelen UUID formátum');

/**
 * GET handler for fetching quiz result
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format
    const validationResult = UUIDSchema.safeParse(params.id);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Érvénytelen azonosító formátum',
            code: 'INVALID_UUID',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const id = validationResult.data;

    // Fetch result from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: result, error: dbError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !result) {
      // Check if result not found
      if (dbError?.code === 'PGRST116') {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Az eredmény nem található',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba történt az eredmény lekérdezése során',
            code: 'DATABASE_ERROR',
            details: dbError?.message || 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Generate interpretations for all chakras
    let interpretations;
    try {
      const interpretationsSummary = getInterpretationsSummary(result.chakra_scores as ChakraScores);
      // Convert object to array for frontend compatibility
      interpretations = Object.values(interpretationsSummary);
    } catch (error) {
      console.error('Interpretation error:', error);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba történt az értelmezés generálása során',
            code: 'INTERPRETATION_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Success response with full result and interpretations
    return NextResponse.json(
      {
        data: {
          id: result.id,
          name: result.name,
          email: result.email,
          age: result.age,
          answers: result.answers,
          chakra_scores: result.chakra_scores,
          interpretations,
          created_at: result.created_at,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/result/[id]:', error);

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
