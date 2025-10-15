/**
 * GET /api/admin/auth/verify
 * Verify admin session endpoint
 *
 * NOTE: Temporarily disabled until database migration 005 is run
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'Admin verification temporarily disabled. Run database migration 005 first.',
        code: 'MIGRATION_REQUIRED',
      },
    },
    { status: 503 }
  );
}

/* ORIGINAL CODE - UNCOMMENT AFTER MIGRATION
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          data: { authenticated: false },
          error: null,
        },
        { status: 200 }
      );
    }

    // Verify session in database
    const session = await verifyAdminSession(sessionToken);

    if (!session) {
      // Invalid or expired session
      const response = NextResponse.json(
        {
          data: { authenticated: false },
          error: null,
        },
        { status: 200 }
      );

      // Clear invalid cookie
      response.cookies.delete('admin_session');

      return response;
    }

    // Valid session
    return NextResponse.json(
      {
        data: {
          authenticated: true,
          userId: session.userId,
          expiresAt: session.expiresAt.toISOString(),
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Unexpected error in GET /api/admin/auth/verify', error, {
      context: 'GET /api/admin/auth/verify',
    });

    return NextResponse.json(
      {
        data: { authenticated: false },
        error: {
          message: 'Hiba történt a munkamenet ellenőrzése során',
          code: 'VERIFICATION_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
*/
