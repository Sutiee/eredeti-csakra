/**
 * Analytics Event Tracking Utility
 *
 * Provides client-side event tracking for user interactions throughout the funnel.
 * Integrates with Supabase analytics_events table and optionally with Plausible Analytics.
 *
 * Phase 4 - v2.1 Analytics Implementation
 *
 * @module lib/analytics/track-event
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Analytics event names tracked throughout the application
 */
export type EventName =
  | 'accordion_open'      // User opens a chakra detail accordion
  | 'sticky_show'         // Sticky CTA becomes visible
  | 'sticky_click'        // User clicks sticky CTA
  | 'softupsell_click'    // User clicks soft upsell link
  | 'pricing_select'      // User selects a pricing option
  | 'checkout_start'      // User initiates checkout
  | 'purchase';           // Purchase completed

/**
 * Device type classification
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Analytics event properties structure
 */
export interface AnalyticsEvent {
  result_id: string;
  event_name: EventName;
  properties: Record<string, any>;
  session_id: string;
  user_agent: string;
  device_type: DeviceType;
  timestamp: string;
}

/**
 * Window interface extension for Plausible Analytics
 */
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props: Record<string, any> }) => void;
  }
}

// ============================================================================
// Supabase Client Initialization
// ============================================================================

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Gets or creates a Supabase client instance
 * Only initializes on client-side
 */
function getSupabaseClient(): ReturnType<typeof createClient> | null {
  // Server-side guard
  if (typeof window === 'undefined') {
    return null;
  }

  // Return cached client
  if (supabaseClient) {
    return supabaseClient;
  }

  // Initialize new client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Analytics] Missing Supabase environment variables');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('[Analytics] Failed to initialize Supabase client:', error);
    return null;
  }
}

// ============================================================================
// Session Management
// ============================================================================

const SESSION_STORAGE_KEY = 'session_id';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generates a new session ID
 * Format: session_{timestamp}_{random}
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

/**
 * Gets or creates a session ID from localStorage
 * Sessions expire after 30 minutes of inactivity
 *
 * @returns Session ID string
 */
export function getSessionId(): string {
  // Server-side guard
  if (typeof window === 'undefined') {
    return 'server_session';
  }

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    if (stored) {
      // Check if session is still valid
      const parts = stored.split('_');
      if (parts.length === 3) {
        const timestamp = parseInt(parts[1], 10);
        const age = Date.now() - timestamp;

        // Return existing session if less than 30 minutes old
        if (age < SESSION_DURATION_MS) {
          return stored;
        }
      }
    }

    // Generate new session
    const newSessionId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    return newSessionId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.error('[Analytics] Failed to access localStorage:', error);
    return generateSessionId();
  }
}

/**
 * Refreshes the current session timestamp
 * Call this on user interaction to extend session
 */
export function refreshSession(): void {
  if (typeof window === 'undefined') return;

  try {
    const currentSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (currentSession) {
      // Update timestamp in localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, currentSession);
    }
  } catch (error) {
    console.error('[Analytics] Failed to refresh session:', error);
  }
}

// ============================================================================
// Device Detection
// ============================================================================

/**
 * Detects device type based on viewport width
 *
 * @returns Device type classification
 */
export function getDeviceType(): DeviceType {
  // Server-side guard
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;

  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Gets user agent string
 *
 * @returns Navigator user agent or 'unknown'
 */
export function getUserAgent(): string {
  if (typeof window === 'undefined' || !navigator) {
    return 'unknown';
  }

  return navigator.userAgent || 'unknown';
}

// ============================================================================
// Plausible Analytics Integration
// ============================================================================

/**
 * Sends event to Plausible Analytics if available
 *
 * @param eventName - Analytics event name
 * @param properties - Event properties
 */
function trackPlausibleEvent(
  eventName: EventName,
  properties: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  try {
    if (window.plausible) {
      window.plausible(eventName, { props: properties });
    }
  } catch (error) {
    console.error('[Analytics] Plausible tracking error:', error);
  }
}

// ============================================================================
// Main Tracking Function
// ============================================================================

/**
 * Tracks an analytics event to Supabase and optionally Plausible
 *
 * Automatically enriches events with:
 * - Session ID (from localStorage)
 * - User agent
 * - Device type
 * - Timestamp
 *
 * Fails silently to avoid disrupting user experience
 *
 * @param resultId - Quiz result ID
 * @param eventName - Type of event being tracked
 * @param properties - Additional event properties (optional)
 *
 * @example
 * // Track accordion open
 * trackEvent(resultId, 'accordion_open', {
 *   chakra: 'Gyökércsakra',
 *   position: 0,
 *   score: 8
 * });
 *
 * @example
 * // Track sticky CTA click
 * trackEvent(resultId, 'sticky_click', {
 *   copy_variant: 'Egyensúlyt kérek',
 *   blocked_count: 3
 * });
 *
 * @example
 * // Track pricing selection
 * trackEvent(resultId, 'pricing_select', {
 *   product_id: 'ai_analysis_pdf',
 *   price: 2990
 * });
 *
 * @example
 * // Track purchase completion
 * trackEvent(resultId, 'purchase', {
 *   product_id: 'complete_bundle',
 *   amount: 6990,
 *   currency: 'HUF'
 * });
 */
export async function trackEvent(
  resultId: string,
  eventName: EventName,
  properties: Record<string, any> = {}
): Promise<void> {
  // Server-side guard
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Analytics] Supabase client not available, skipping event tracking');
      return;
    }

    // Enrich event with metadata
    const eventData: Omit<AnalyticsEvent, 'timestamp'> = {
      result_id: resultId,
      event_name: eventName,
      properties,
      session_id: getSessionId(),
      user_agent: getUserAgent(),
      device_type: getDeviceType(),
    };

    // Insert into Supabase (created_at is auto-generated)
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData as any); // Type assertion needed until migration is run

    if (error) {
      console.error('[Analytics] Failed to insert event:', error);
      return;
    }

    // Track in Plausible if available
    trackPlausibleEvent(eventName, {
      ...properties,
      result_id: resultId,
      device_type: eventData.device_type,
    });

    // Refresh session on successful tracking
    refreshSession();

  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error('[Analytics] Unexpected error tracking event:', error);
  }
}

// ============================================================================
// Batch Tracking (Future Enhancement)
// ============================================================================

/**
 * Tracks multiple events in a single batch
 * Useful for tracking multiple interactions at once
 *
 * @param resultId - Quiz result ID
 * @param events - Array of events to track
 */
export async function trackEventBatch(
  resultId: string,
  events: Array<{ eventName: EventName; properties?: Record<string, any> }>
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Analytics] Supabase client not available, skipping batch tracking');
      return;
    }

    const sessionId = getSessionId();
    const userAgent = getUserAgent();
    const deviceType = getDeviceType();
    const timestamp = new Date().toISOString();

    const eventData = events.map(({ eventName, properties = {} }) => ({
      result_id: resultId,
      event_name: eventName,
      properties,
      session_id: sessionId,
      user_agent: userAgent,
      device_type: deviceType,
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData as any);

    if (error) {
      console.error('[Analytics] Failed to insert batch events:', error);
      return;
    }

    // Track each event in Plausible
    events.forEach(({ eventName, properties = {} }) => {
      trackPlausibleEvent(eventName, {
        ...properties,
        result_id: resultId,
        device_type: deviceType,
      });
    });

    refreshSession();

  } catch (error) {
    console.error('[Analytics] Unexpected error tracking batch events:', error);
  }
}
