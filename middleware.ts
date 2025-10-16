/**
 * Next.js Middleware
 * Protects admin routes with session-based authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';

/**
 * Middleware function runs before every request
 * @param request - Incoming request
 * @returns Response or null (to continue)
 */
export async function middleware(request: NextRequest) {
  // Check if request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = await protectAdminRoute(request);
    if (response) {
      return response; // Redirect to login if unauthorized
    }
  }

  // Allow request to continue
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Define which routes should run middleware
 */
export const config = {
  matcher: [
    /*
     * Match all admin routes except static files and images
     * - /admin/login (handled by protectAdminRoute)
     * - /admin/* (protected routes)
     */
    '/admin/:path*',
  ],
};
