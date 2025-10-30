/**
 * Client-Side Event Tracking
 * Analytics hook for tracking user interactions in the browser
 */

'use client';

import { useCallback } from 'react';
import type { ClientEventData } from '@/types/admin';
import { getCurrentVariant, type VariantId } from '@/lib/pricing/variants';

/**
 * Session ID Storage Key
 * Used to persist session ID in localStorage
 */
const SESSION_ID_KEY = 'analytics_session_id';

/**
 * Generate a unique session ID
 * Format: timestamp-randomString
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Get or create session ID from localStorage
 * Session persists across page reloads
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-side'; // Fallback for SSR
  }

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    // localStorage might be disabled or unavailable
    console.warn('Failed to access localStorage for session tracking:', error);
    return generateSessionId(); // Generate temporary session ID
  }
}

/**
 * Extract UTM parameters from URL
 * Returns utm_source, utm_medium, utm_campaign if present
 */
function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');

    if (utmSource) utm.utm_source = utmSource;
    if (utmMedium) utm.utm_medium = utmMedium;
    if (utmCampaign) utm.utm_campaign = utmCampaign;

    return utm;
  } catch (error) {
    console.warn('Failed to extract UTM parameters:', error);
    return {};
  }
}

/**
 * Get current pricing variant ID
 * Returns the variant from URL or cookie (a/b/c)
 * Used for A/B/C testing attribution in analytics
 */
function getVariantId(): VariantId {
  if (typeof window === 'undefined') return 'a';

  try {
    const params = new URLSearchParams(window.location.search);
    return getCurrentVariant(params);
  } catch (error) {
    console.warn('Failed to get variant ID:', error);
    return 'a';
  }
}

/**
 * Analytics Hook
 * Provides trackEvent function for client-side event tracking
 *
 * @example
 * ```tsx
 * const { trackEvent } = useAnalytics();
 *
 * // Track button click
 * trackEvent('quiz_start', { source: 'landing_cta' });
 *
 * // Track with result ID
 * trackEvent('checkout_view', { result_id: resultId });
 * ```
 */
export function useAnalytics() {
  /**
   * Track an event
   * Sends event data to the API endpoint
   * Errors are caught and logged silently to avoid breaking user experience
   *
   * @param eventName - Name of the event (e.g., 'quiz_start', 'checkout_view')
   * @param eventData - Optional additional data to track with the event
   * @param resultId - Optional quiz result ID to associate with the event
   */
  const trackEvent = useCallback(
    async (
      eventName: string,
      eventData?: Record<string, any>,
      resultId?: string
    ): Promise<void> => {
      // Don't track in development (optional - remove if you want dev tracking)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Event tracked (dev mode):', {
          eventName,
          eventData,
          resultId,
        });
        // Uncomment to skip tracking in dev:
        // return;
      }

      try {
        // Collect event data
        const payload: ClientEventData = {
          event_name: eventName,
          event_data: {
            ...eventData,
            ...getUTMParams(), // Include UTM parameters if present
            variant_id: getVariantId(), // Include A/B/C test variant
          },
          session_id: getSessionId(),
          result_id: resultId,
          page_path: window.location.pathname,
          referrer: document.referrer || undefined,
        };

        // Send to API endpoint
        const response = await fetch('/api/admin/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          // Don't wait for response - fire and forget
          keepalive: true,
        });

        // Log errors in development only
        if (!response.ok && process.env.NODE_ENV === 'development') {
          console.error('[Analytics] Failed to track event:', {
            status: response.status,
            statusText: response.statusText,
          });
        }
      } catch (error) {
        // Silent failure - don't break user experience
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('[Analytics] Error tracking event:', error);
        }
      }
    },
    []
  );

  return {
    trackEvent,
    sessionId: getSessionId(),
  };
}

/**
 * Track page view
 * Standalone function to track page views
 * Can be called from layout or page components
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   trackPageView();
 * }, []);
 * ```
 */
export function trackPageView(pageTitle?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: ClientEventData = {
      event_name: 'page_view',
      event_data: {
        page_title: pageTitle || document.title,
        ...getUTMParams(),
        variant_id: getVariantId(), // Include A/B/C test variant
      },
      session_id: getSessionId(),
      page_path: window.location.pathname,
      referrer: document.referrer || undefined,
    };

    fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silent failure
    });
  } catch (error) {
    // Silent failure
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Error tracking page view:', error);
    }
  }
}
