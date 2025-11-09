/**
 * POST /api/admin/events
 * Event tracking endpoint for client-side analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseClient } from '@/lib/supabase/client';
import { inferCategory } from '@/lib/admin/tracking/server';
import { logger } from '@/lib/utils/logger';
import type { AnalyticsEvent, APIResponse } from '@/types/admin';

/**
 * Zod validation schema for event tracking requests
 */
const EventSchema = z.object({
  event_name: z
    .string()
    .min(1, 'Event name is required')
    .max(100, 'Event name too long'),
  event_data: z.record(z.any()).optional(),
  session_id: z.string().optional(),
  result_id: z.string().uuid().optional(),
  page_path: z.string().optional(),
  referrer: z.string().optional(),
});

/**
 * Extract IP address from request
 * Handles various proxy headers
 */
function getClientIP(request: NextRequest): string | undefined {
  // Try various headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }

  // Fallback to connection IP (if available)
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return undefined;
}

/**
 * Extract User Agent from request
 */
function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * POST handler for event tracking
 * Receives events from client-side and stores them in the database
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();

    logger.debug('Received event tracking request', {
      context: 'POST /api/admin/events',
      data: { event_name: body.event_name },
    });

    // Validate request data
    const validationResult = EventSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Event validation failed', {
        context: 'POST /api/admin/events',
        data: { errors: validationResult.error.errors },
      });

      const response: APIResponse<null> = {
        data: null,
        error: {
          message: 'Invalid event data',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors,
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    const { event_name, event_data, session_id, result_id, page_path, referrer } =
      validationResult.data;

    // Extract IP and User Agent from request
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Prepare event object
    // Note: Client sends 'event_data', but database column is 'properties'
    const event: Omit<AnalyticsEvent, 'id' | 'created_at'> = {
      event_name,
      event_category: inferCategory(event_name),
      properties: event_data || {},  // Map event_data → properties (database column name)
      session_id,
      result_id,
      ip_address: ipAddress,
      user_agent: userAgent,
      page_path,
      referrer,
    };

    // Insert into database
    const supabase = createSupabaseClient();
    const { error: dbError } = await supabase.from('analytics_events').insert(event);

    if (dbError) {
      logger.error('Failed to insert event into database', dbError, {
        context: 'POST /api/admin/events',
        data: { event_name },
      });

      const response: APIResponse<null> = {
        data: null,
        error: {
          message: 'Failed to track event',
          code: 'DATABASE_ERROR',
          details: dbError.message,
        },
      };

      return NextResponse.json(response, { status: 500 });
    }

    // Success response
    logger.debug(`Event tracked successfully: ${event_name}`, {
      context: 'POST /api/admin/events',
      data: { category: event.event_category },
    });

    const response: APIResponse<{ success: true }> = {
      data: { success: true },
      error: null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Unexpected error in POST /api/admin/events', error, {
      context: 'POST /api/admin/events',
    });

    const response: APIResponse<null> = {
      data: null,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 * Allows event tracking from the same origin
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
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
