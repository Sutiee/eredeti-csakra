/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 *
 * NOTE: Temporarily disabled until database migration 005 is run
 * TODO: Uncomment after running migration 005_admin_analytics_tables.sql
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'Admin login temporarily disabled. Run database migration 005 first.',
        code: 'MIGRATION_REQUIRED',
      },
    },
    { status: 503 }
  );
}

/* ORIGINAL CODE - UNCOMMENT AFTER MIGRATION
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUserByUsername, verifyPassword, updateAdminLastLogin } from '@/lib/admin/auth';
import { createAdminSession } from '@/lib/admin/session';
import { getClientIp, getUserAgent } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const loginAttempts = new Map<
  string,
  { count: number; lastAttempt: number; lockedUntil?: number }
>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; lockedUntil?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (attempts.lockedUntil && attempts.lockedUntil > now) {
    return { allowed: false, lockedUntil: attempts.lockedUntil };
  }

  if (now - attempts.lastAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const lockedUntil = attempts.lastAttempt + LOCK_DURATION_MS;
    attempts.lockedUntil = lockedUntil;
    return { allowed: false, lockedUntil };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count };
}

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

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const ip = getClientIp(request) || 'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      logger.warn('Login rate limit exceeded', {
        context: 'POST /api/admin/auth/login',
        data: { ip, lockedUntil: rateLimit.lockedUntil },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Túl sok sikertelen bejelentkezési kísérlet. Próbáld újra 15 perc múlva.',
            code: 'RATE_LIMIT_EXCEEDED',
            details: { lockedUntil: rateLimit.lockedUntil },
          },
        },
        { status: 429 }
      );
    }

    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hiányzó felhasználónév vagy jelszó',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    const user = await getAdminUserByUsername(username);
    if (!user) {
      recordFailedAttempt(ip);
      logger.warn('Login attempt with non-existent username', {
        context: 'POST /api/admin/auth/login',
        data: { username, ip },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hibás felhasználónév vagy jelszó',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      recordFailedAttempt(ip);
      logger.warn('Login attempt with incorrect password', {
        context: 'POST /api/admin/auth/login',
        data: { username, ip },
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Hibás felhasználónév vagy jelszó',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    clearAttempts(ip);

    const userAgent = getUserAgent(request);
    const session = await createAdminSession(user.id, ip, userAgent);

    await updateAdminLastLogin(user.id);

    logger.info('Admin login successful', {
      context: 'POST /api/admin/auth/login',
      data: { username, ip },
    });

    const response = NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            username: user.username,
          },
          session: {
            expiresAt: session.expiresAt,
          },
        },
        error: null,
      },
      { status: 200 }
    );

    response.cookies.set('admin_session', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: session.expiresAt,
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
          message: 'Belső szerverhiba történt',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
*/
