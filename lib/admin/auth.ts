/**
 * Admin Authentication Helpers
 * Password hashing and session token generation utilities
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Password verification error', error, { context: 'verifyPassword' });
    return false;
  }
}

/**
 * Generate a cryptographically secure session token
 * @returns 64-character hex string (32 random bytes)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify admin session from token
 * Checks if session exists, is valid, and not expired
 * @param token - Session token from cookie
 * @returns Admin user ID if valid, null otherwise
 */
export async function verifyAdminSession(token: string): Promise<{
  userId: string;
  sessionId: string;
  expiresAt: Date;
} | null> {
  try {
    const supabase = createSupabaseClient();

    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('id, admin_user_id, expires_at')
      .eq('session_token', token)
      .single();

    if (error || !session) {
      logger.debug('Invalid session token', { context: 'verifyAdminSession' });
      return null;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (expiresAt < now) {
      logger.debug('Session expired', {
        context: 'verifyAdminSession',
        data: { expiresAt: expiresAt.toISOString() },
      });
      return null;
    }

    return {
      userId: session.admin_user_id,
      sessionId: session.id,
      expiresAt,
    };
  } catch (error) {
    logger.error('Session verification error', error, { context: 'verifyAdminSession' });
    return null;
  }
}

/**
 * Get admin user by username
 * @param username - Admin username
 * @returns Admin user data or null
 */
export async function getAdminUserByUsername(username: string): Promise<{
  id: string;
  username: string;
  passwordHash: string;
} | null> {
  try {
    const supabase = createSupabaseClient();

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      passwordHash: user.password_hash,
    };
  } catch (error) {
    logger.error('Error fetching admin user', error, { context: 'getAdminUserByUsername' });
    return null;
  }
}

/**
 * Update admin user's last login information
 * @param userId - Admin user ID
 */
export async function updateAdminLastLogin(userId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();

    await supabase
      .from('admin_users')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: supabase.rpc('increment', { row_id: userId }),
      })
      .eq('id', userId);
  } catch (error) {
    logger.error('Error updating last login', error, { context: 'updateAdminLastLogin' });
  }
}
