/**
 * Admin Route Protection Middleware
 * Verifies admin sessions for protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './auth';
import { updateSessionActivity } from './session';
import { logger } from '@/lib/utils/logger';

/**
 * Protect admin routes with session verification
 * @param request - Next.js request object
 * @returns Response (redirect to login if unauthorized)
 */
export async function protectAdminRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page and auth API routes
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth/')) {
    return null; // Allow through
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    logger.debug('No admin session token found', {
      context: 'protectAdminRoute',
      data: { pathname },
    });
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify session in database
  const session = await verifyAdminSession(sessionToken);

  if (!session) {
    logger.warn('Invalid or expired admin session', {
      context: 'protectAdminRoute',
      data: { pathname },
    });

    // Clear invalid cookie
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  // Update session activity (fire and forget)
  updateSessionActivity(sessionToken).catch((error) => {
    logger.error('Failed to update session activity', error, {
      context: 'protectAdminRoute',
    });
  });

  // Allow request to proceed
  return null;
}

/**
 * Get client IP address from request headers
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for IP address (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Get user agent from request headers
 * @param request - Next.js request object
 * @returns User agent string
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
