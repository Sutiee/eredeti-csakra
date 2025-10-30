/**
 * Next.js Middleware
 * - Protects admin routes with session-based authentication
 * - Detects pricing variant from URL and sets cookie for A/B/C testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { isValidVariant } from '@/lib/pricing/variants';

/**
 * Middleware function runs before every request
 * @param request - Incoming request
 * @returns Response or null (to continue)
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  // 1. Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = await protectAdminRoute(request);
    if (response) {
      return response; // Redirect to login if unauthorized
    }
  }

  // 2. Pricing variant detection and cookie persistence
  const variant = request.nextUrl.searchParams.get('variant');
  const response = NextResponse.next();

  // If valid variant found in URL, set cookie for 30 days
  if (variant && isValidVariant(variant)) {
    response.cookies.set('__variant', variant, {
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Allow client-side access for tracking
    });
  }

  return response;
}

/**
 * Middleware configuration
 * Define which routes should run middleware
 */
export const config = {
  matcher: [
    /*
     * Match admin routes for authentication
     * - /admin/login (handled by protectAdminRoute)
     * - /admin/* (protected routes)
     */
    '/admin/:path*',

    /*
     * Match user-facing routes for pricing variant detection
     * - / (landing page)
     * - /kviz (quiz flow)
     * - /eredmeny/:id (result page)
     * - /checkout/:id (checkout page)
     * - /success/:id (success page)
     */
    '/',
    '/kviz/:path*',
    '/eredmeny/:path*',
    '/checkout/:path*',
    '/success/:path*',
  ],
};
