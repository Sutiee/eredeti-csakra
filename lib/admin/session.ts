/**
 * Admin Session Management
 * Create, update, and delete admin sessions
 */

import { createSupabaseClient } from '@/lib/supabase/client';
import { generateSessionToken } from './auth';
import { logger } from '@/lib/utils/logger';

const SESSION_EXPIRY_DAYS = 7;

/**
 * Create a new admin session
 * @param userId - Admin user ID
 * @param ipAddress - User's IP address
 * @param userAgent - User's browser user agent
 * @returns Session token or null if creation failed
 */
export async function createAdminSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<string | null> {
  try {
    const supabase = createSupabaseClient();
    const sessionToken = generateSessionToken();

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    const { error } = await supabase.from('admin_sessions').insert({
      admin_user_id: userId,
      session_token: sessionToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      logger.error('Failed to create session', error, { context: 'createAdminSession' });
      return null;
    }

    logger.info('Admin session created', {
      context: 'createAdminSession',
      data: { userId, expiresAt: expiresAt.toISOString() },
    });

    return sessionToken;
  } catch (error) {
    logger.error('Session creation error', error, { context: 'createAdminSession' });
    return null;
  }
}

/**
 * Update session's last activity timestamp
 * @param token - Session token
 */
export async function updateSessionActivity(token: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();

    await supabase
      .from('admin_sessions')
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_token', token);
  } catch (error) {
    logger.error('Error updating session activity', error, { context: 'updateSessionActivity' });
  }
}

/**
 * Delete an admin session (logout)
 * @param token - Session token to delete
 * @returns True if successful
 */
export async function deleteAdminSession(token: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase.from('admin_sessions').delete().eq('session_token', token);

    if (error) {
      logger.error('Failed to delete session', error, { context: 'deleteAdminSession' });
      return false;
    }

    logger.info('Admin session deleted', { context: 'deleteAdminSession' });
    return true;
  } catch (error) {
    logger.error('Session deletion error', error, { context: 'deleteAdminSession' });
    return false;
  }
}

/**
 * Clean up expired sessions from database
 * Should be run periodically (e.g., daily cron job)
 * @returns Number of sessions deleted
 */
export async function cleanExpiredSessions(): Promise<number> {
  try {
    const supabase = createSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', now)
      .select('id');

    if (error) {
      logger.error('Failed to clean expired sessions', error, { context: 'cleanExpiredSessions' });
      return 0;
    }

    const deletedCount = data?.length || 0;

    if (deletedCount > 0) {
      logger.info('Expired sessions cleaned', {
        context: 'cleanExpiredSessions',
        data: { deletedCount },
      });
    }

    return deletedCount;
  } catch (error) {
    logger.error('Session cleanup error', error, { context: 'cleanExpiredSessions' });
    return 0;
  }
}

/**
 * Get all active sessions for a user
 * @param userId - Admin user ID
 * @returns Array of active sessions
 */
export async function getUserActiveSessions(userId: string): Promise<
  Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActivityAt: string;
    expiresAt: string;
  }>
> {
  try {
    const supabase = createSupabaseClient();
    const now = new Date().toISOString();

    const { data: sessions, error } = await supabase
      .from('admin_sessions')
      .select('id, ip_address, user_agent, created_at, last_activity_at, expires_at')
      .eq('admin_user_id', userId)
      .gt('expires_at', now)
      .order('last_activity_at', { ascending: false });

    if (error || !sessions) {
      return [];
    }

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ip_address || '',
      userAgent: session.user_agent || '',
      createdAt: session.created_at || new Date().toISOString(),
      lastActivityAt: session.last_activity_at || new Date().toISOString(),
      expiresAt: session.expires_at,
    }));
  } catch (error) {
    logger.error('Error fetching user sessions', error, { context: 'getUserActiveSessions' });
    return [];
  }
}
