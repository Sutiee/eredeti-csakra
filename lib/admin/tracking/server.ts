/**
 * Server-Side Event Logging
 * Utility for tracking backend events (API calls, system events, etc.)
 */

import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import type { AnalyticsEvent, EventCategory, ServerEventContext } from '@/types/admin';

/**
 * Infer event category from event name
 * Automatically categorizes events based on naming conventions
 *
 * @param eventName - The name of the event
 * @returns The inferred category
 */
export function inferCategory(eventName: string): EventCategory {
  const name = eventName.toLowerCase();

  // Page-related events
  if (
    name.includes('page_view') ||
    name.includes('landing_view') ||
    name.includes('result_view')
  ) {
    return 'page';
  }

  // Quiz-related events
  if (
    name.includes('quiz_') ||
    name.includes('question') ||
    name.includes('testimonial')
  ) {
    return 'quiz';
  }

  // Checkout and payment events
  if (
    name.includes('checkout') ||
    name.includes('payment') ||
    name.includes('purchase') ||
    name.includes('stripe')
  ) {
    return 'checkout';
  }

  // Product-related events
  if (
    name.includes('product') ||
    name.includes('bundle') ||
    name.includes('pdf_') ||
    name.includes('meditation')
  ) {
    return 'product';
  }

  // Default to system events
  return 'system';
}

/**
 * Log an event to the analytics_events table
 * Server-side tracking for API routes and backend operations
 *
 * @param eventName - Name of the event (e.g., 'quiz_submitted', 'stripe_payment_success')
 * @param eventData - Additional data to store with the event
 * @param context - Optional context (session ID, result ID, IP, user agent)
 *
 * @example
 * ```ts
 * // In an API route
 * await logEvent('quiz_submitted', {
 *   question_count: 28,
 *   completion_time: 180,
 * }, {
 *   sessionId: 'session_123',
 *   resultId: result.id,
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent'],
 * });
 * ```
 */
export async function logEvent(
  eventName: string,
  eventData: Record<string, any> = {},
  context?: ServerEventContext
): Promise<void> {
  try {
    const supabase = createSupabaseClient();

    // Prepare event object
    const event: Omit<AnalyticsEvent, 'id' | 'created_at'> = {
      event_name: eventName,
      event_category: inferCategory(eventName),
      properties: eventData,  // Database column name: 'properties' (not 'event_data')
      session_id: context?.sessionId,
      result_id: context?.resultId,
      ip_address: context?.ipAddress,
      user_agent: context?.userAgent,
      page_path: context?.pagePath,
      referrer: context?.referrer,
    };

    // Insert into database
    const { error } = await supabase.from('analytics_events').insert(event);

    if (error) {
      logger.error('Failed to log event to database', error, {
        context: 'logEvent',
        data: { eventName, hasEventData: !!eventData },
      });
      return;
    }

    // Log success in development only
    logger.debug(`Event logged: ${eventName}`, {
      context: 'logEvent',
      data: { category: event.event_category },
    });
  } catch (error) {
    // Don't throw - just log the error
    // We don't want analytics failures to break the app
    logger.error('Unexpected error logging event', error, {
      context: 'logEvent',
      data: { eventName },
    });
  }
}

/**
 * Log multiple events in batch
 * More efficient for tracking multiple events at once
 *
 * @param events - Array of event objects to log
 *
 * @example
 * ```ts
 * await logEventsBatch([
 *   { eventName: 'quiz_started', eventData: { source: 'landing' } },
 *   { eventName: 'quiz_progress', eventData: { question_index: 1 } },
 * ]);
 * ```
 */
export async function logEventsBatch(
  events: Array<{
    eventName: string;
    eventData?: Record<string, any>;
    context?: ServerEventContext;
  }>
): Promise<void> {
  try {
    const supabase = createSupabaseClient();

    // Prepare all events
    const eventRecords = events.map((event) => ({
      event_name: event.eventName,
      event_category: inferCategory(event.eventName),
      event_data: event.eventData || {},
      session_id: event.context?.sessionId,
      result_id: event.context?.resultId,
      ip_address: event.context?.ipAddress,
      user_agent: event.context?.userAgent,
      page_path: event.context?.pagePath,
      referrer: event.context?.referrer,
    }));

    // Batch insert
    const { error } = await supabase.from('analytics_events').insert(eventRecords);

    if (error) {
      logger.error('Failed to log event batch to database', error, {
        context: 'logEventsBatch',
        data: { eventCount: events.length },
      });
      return;
    }

    logger.debug(`Batch logged ${events.length} events`, {
      context: 'logEventsBatch',
    });
  } catch (error) {
    logger.error('Unexpected error logging event batch', error, {
      context: 'logEventsBatch',
      data: { eventCount: events.length },
    });
  }
}

/**
 * Log a page view from server-side
 * Useful for tracking SSR page views
 *
 * @param pagePath - The path of the page being viewed
 * @param context - Request context (IP, user agent, etc.)
 */
export async function logPageView(
  pagePath: string,
  context?: ServerEventContext
): Promise<void> {
  await logEvent(
    'page_view',
    {
      page_path: pagePath,
    },
    context
  );
}

/**
 * Log a system event (email sent, PDF generated, etc.)
 *
 * @param eventName - Name of the system event
 * @param eventData - Event-specific data
 * @param context - Optional context
 */
export async function logSystemEvent(
  eventName: string,
  eventData?: Record<string, any>,
  context?: ServerEventContext
): Promise<void> {
  await logEvent(eventName, eventData, {
    ...context,
    // System events don't need page_path or referrer
    pagePath: undefined,
    referrer: undefined,
  });
}
