/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/admin/session';
import { logger } from '@/lib/utils/logger';

/**
 * POST handler for admin logout
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      // No session to logout from
      return NextResponse.json(
        {
          data: { success: true, message: 'No active session' },
          error: null,
        },
        { status: 200 }
      );
    }

    // Delete session from database
    const deleted = await deleteAdminSession(sessionToken);

    if (!deleted) {
      logger.warn('Failed to delete session during logout', {
        context: 'POST /api/admin/auth/logout',
      });
    }

    // Clear cookie
    const response = NextResponse.json(
      {
        data: { success: true, message: 'Logout successful' },
        error: null,
      },
      { status: 200 }
    );

    response.cookies.delete('admin_session');

    logger.info('Admin logout successful', {
      context: 'POST /api/admin/auth/logout',
    });

    return response;
  } catch (error) {
    logger.error('Unexpected error in POST /api/admin/auth/logout', error, {
      context: 'POST /api/admin/auth/logout',
    });

    // Still clear cookie even on error
    const response = NextResponse.json(
      {
        data: { success: true, message: 'Logout completed (with errors)' },
        error: null,
      },
      { status: 200 }
    );

    response.cookies.delete('admin_session');

    return response;
  }
}
