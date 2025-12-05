/**
 * GET /api/light-result/[id]
 * Fetch light quiz result by UUID with teaser interpretation data
 *
 * Returns the primary blocked chakra with symptoms for the teaser page
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getChakraInterpretation } from '@/lib/quiz/interpretations';
import { getChakraByName } from '@/lib/quiz/chakras';
import { logger } from '@/lib/utils/logger';
import type { ChakraName, ChakraScores } from '@/types';

/**
 * UUID validation schema
 */
const UUIDSchema = z.string().uuid('Ervenytelen UUID formatum');

/**
 * Light result response type
 */
type LightResultResponse = {
  id: string;
  name: string;
  email: string;
  primary_blocked_chakra: ChakraName;
  chakra_color: string;
  chakra_metadata: {
    name: string;
    nameEn: string;
    sanskritName: string;
    element: string;
    location: string;
    description: string;
  };
  interpretation: {
    status: string;
    summary: string;
    manifestations: string[];
    first_aid_plan: string;
  };
  light_scores: Record<string, number>;
  created_at: string;
};

/**
 * GET handler for fetching light quiz result
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
            message: 'Ervenytelen azonosito formatum',
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
      .eq('quiz_type', 'light')
      .single();

    if (dbError || !result) {
      // Check if result not found
      if (dbError?.code === 'PGRST116') {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Az eredmeny nem talalhato',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      logger.error('Database error', dbError, {
        context: 'GET /api/light-result/[id]',
        data: { resultId: id },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba tortent az eredmeny lekerdezese soran',
            code: 'DATABASE_ERROR',
            details: dbError?.message || 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Get primary blocked chakra
    const primaryBlockedChakra = result.primary_blocked_chakra as ChakraName;

    if (!primaryBlockedChakra) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Nincs elerheto blokkolt csakra informacio',
            code: 'NO_BLOCKED_CHAKRA',
          },
        },
        { status: 500 }
      );
    }

    // Get chakra metadata
    const chakraMetadata = getChakraByName(primaryBlockedChakra);

    if (!chakraMetadata) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Ismeretlen csakra',
            code: 'UNKNOWN_CHAKRA',
          },
        },
        { status: 500 }
      );
    }

    // Get light scores and find the score for the primary blocked chakra
    const lightScores = result.light_scores as Record<string, number>;
    const primaryScore = lightScores[primaryBlockedChakra] || 1;

    // For light quiz, each chakra has only 1 question (score 1-4)
    // Convert to 4-16 range for interpretation: score * 4
    // score 1 -> 4 (blocked), score 2 -> 8 (imbalanced low),
    // score 3 -> 12 (imbalanced high), score 4 -> 16 (balanced)
    const interpretationScore = primaryScore * 4;

    // Get interpretation for the primary blocked chakra
    let interpretation;
    try {
      const chakraInterpretation = getChakraInterpretation(primaryBlockedChakra, interpretationScore);
      interpretation = chakraInterpretation.interpretation;
    } catch (error) {
      logger.error('Interpretation error', error, {
        context: 'GET /api/light-result/[id]',
        data: { resultId: id, chakra: primaryBlockedChakra, score: interpretationScore },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba tortent az ertelmezes generalasa soran',
            code: 'INTERPRETATION_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Build response
    const responseData: LightResultResponse = {
      id: result.id,
      name: result.name,
      email: result.email,
      primary_blocked_chakra: primaryBlockedChakra,
      chakra_color: chakraMetadata.color,
      chakra_metadata: {
        name: chakraMetadata.name,
        nameEn: chakraMetadata.nameEn,
        sanskritName: chakraMetadata.sanskritName,
        element: chakraMetadata.element,
        location: chakraMetadata.location,
        description: chakraMetadata.description,
      },
      interpretation,
      light_scores: lightScores,
      created_at: result.created_at,
    };

    // Success response
    return NextResponse.json(
      {
        data: responseData,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Unexpected error in GET /api/light-result/[id]', error, {
      context: 'GET /api/light-result/[id]',
    });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Varatlan hiba tortent',
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
