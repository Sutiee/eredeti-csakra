/**
 * Server-Side Event Logging - TEMPORARILY DISABLED
 */

import type { EventCategory } from '@/types/admin';

export async function logEvent(
  eventName: string,
  eventData: Record<string, any>,
  context?: {
    sessionId?: string;
    resultId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  // Disabled until migration 005 is run
  console.log('[TRACKING DISABLED] Event:', eventName, eventData);
}

export async function logEventsBatch(
  events: Array<{
    eventName: string;
    eventData: Record<string, any>;
    context?: any;
  }>
): Promise<void> {
  // Disabled
}

export function inferCategory(eventName: string): EventCategory {
  if (eventName.startsWith('page_')) return 'page';
  if (eventName.startsWith('quiz_')) return 'quiz';
  if (eventName.startsWith('checkout_')) return 'checkout';
  if (eventName.startsWith('product_')) return 'product';
  return 'system';
}

export async function logSystemEvent(
  eventName: string,
  eventData: Record<string, any>
): Promise<void> {
  // Disabled
}
