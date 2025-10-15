/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUserByUsername, verifyPassword, updateAdminLastLogin } from '@/lib/admin/auth';
import { createAdminSession } from '@/lib/admin/session';
import { getClientIp, getUserAgent } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';

/**
 * Zod validation schema for login request
 */
const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * In-memory rate limiting (simple implementation)
 * In production, use Redis or similar
 */
const loginAttempts = new Map<
  string,
  { count: number; lastAttempt: number; lockedUntil?: number }
>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP is rate limited
 */
function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; lockedUntil?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if locked
  if (attempts.lockedUntil && attempts.lockedUntil > now) {
    return { allowed: false, lockedUntil: attempts.lockedUntil };
  }

  // Reset if window expired
  if (now - attempts.lastAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if too many attempts
  if (attempts.count >= MAX_ATTEMPTS) {
    const lockedUntil = attempts.lastAttempt + LOCK_DURATION_MS;
    attempts.lockedUntil = lockedUntil;
    return { allowed: false, lockedUntil };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count };
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    attempts.count += 1;
    attempts.lastAttempt = now;
  }
}

/**
 * Clear login attempts on successful login
 */
function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * POST handler for admin login
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const lockedMinutes = rateLimit.lockedUntil
        ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000)
        : 15;

      logger.warn('Login rate limit exceeded', {
        context: 'POST /api/admin/auth/login',
        data: { ip, lockedMinutes },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: `Túl sok sikertelen bejelentkezési kísérlet. Próbálja újra ${lockedMinutes} perc múlva.`,
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Érvénytelen bejelentkezési adatok',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Get admin user
    const user = await getAdminUserByUsername(username);

    if (!user) {
      recordFailedAttempt(ip);
      logger.warn('Login attempt with invalid username', {
        context: 'POST /api/admin/auth/login',
        data: { username, ip },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Helytelen felhasználónév vagy jelszó',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      recordFailedAttempt(ip);
      logger.warn('Login attempt with invalid password', {
        context: 'POST /api/admin/auth/login',
        data: { username, ip },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Helytelen felhasználónév vagy jelszó',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createAdminSession(user.id, ip, userAgent);

    if (!sessionToken) {
      logger.error('Failed to create admin session', null, {
        context: 'POST /api/admin/auth/login',
        data: { userId: user.id },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiba történt a bejelentkezés során',
            code: 'SESSION_CREATION_FAILED',
          },
        },
        { status: 500 }
      );
    }

    // Update last login
    await updateAdminLastLogin(user.id);

    // Clear rate limit attempts
    clearAttempts(ip);

    logger.info('Admin login successful', {
      context: 'POST /api/admin/auth/login',
      data: { username, ip },
    });

    // Set HTTP-only cookie with session token
    const response = NextResponse.json(
      {
        data: {
          success: true,
          username: user.username,
        },
        error: null,
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Unexpected error in POST /api/admin/auth/login', error, {
      context: 'POST /api/admin/auth/login',
    });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Váratlan hiba történt',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
