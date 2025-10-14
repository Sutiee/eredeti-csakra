/**
 * GET /api/result/[id]
 * Fetch quiz result by UUID with full interpretations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getInterpretationsSummary } from '@/lib/quiz/interpretations';
import { logger } from '@/lib/utils/logger';
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

      logger.error('Database error', dbError, {
        context: 'GET /api/result/[id]',
        data: { resultId: id },
      });
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
      logger.error('Interpretation error', error, {
        context: 'GET /api/result/[id]',
        data: { resultId: id },
      });
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
    logger.error('Unexpected error in GET /api/result/[id]', error, {
      context: 'GET /api/result/[id]',
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
