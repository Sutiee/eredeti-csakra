/**
 * Admin Session Management - TEMPORARILY DISABLED
 */

export async function createAdminSession(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<{
  sessionToken: string;
  expiresAt: Date;
}> {
  throw new Error('Admin sessions disabled. Run migration 005 first.');
}

export async function updateSessionActivity(token: string): Promise<boolean> {
  return false;
}

export async function deleteAdminSession(token: string): Promise<boolean> {
  return false;
}

export async function cleanExpiredSessions(): Promise<number> {
  return 0;
}

export async function getUserActiveSessions(userId: string): Promise<any[]> {
  return [];
}
