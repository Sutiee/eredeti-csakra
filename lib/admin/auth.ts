/**
 * Admin Authentication Helpers - TEMPORARILY DISABLED
 *
 * NOTE: These functions are disabled until database migration 005 is run.
 * All functions return null or throw errors to prevent runtime issues.
 */

export async function hashPassword(password: string): Promise<string> {
  throw new Error('Admin auth disabled. Run migration 005 first.');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return false;
}

export function generateSessionToken(): string {
  throw new Error('Admin auth disabled. Run migration 005 first.');
}

export async function verifyAdminSession(token: string): Promise<{
  userId: string;
  sessionId: string;
  expiresAt: Date;
} | null> {
  return null;
}

export async function getAdminUserByUsername(username: string): Promise<{
  id: string;
  username: string;
  password_hash: string;
} | null> {
  return null;
}

export async function updateAdminLastLogin(userId: string): Promise<void> {
  // No-op
}
