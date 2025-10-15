/**
 * Admin Middleware - TEMPORARILY DISABLED
 */

import { NextRequest, NextResponse } from 'next/server';

export async function protectAdminRoute(request: NextRequest): Promise<NextResponse | null> {
  // Temporarily allow all admin routes during development before migration
  return null;
}

export function getClientIp(request: NextRequest): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         request.headers.get('x-real-ip') ||
         undefined;
}

export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
