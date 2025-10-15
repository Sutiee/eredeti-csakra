/**
 * SWR Configuration for Admin Dashboard
 *
 * Provides automatic data fetching, caching, and revalidation
 * for real-time admin analytics
 */

import { SWRConfiguration } from 'swr';

/**
 * Fetcher function for SWR
 * Handles API requests with error handling
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error: any = new Error('API fetch failed');
    error.status = res.status;
    error.info = await res.json().catch(() => ({}));
    throw error;
  }

  return res.json();
};

/**
 * Default SWR configuration for admin dashboard
 * - Auto-refresh every 30 seconds
 * - Revalidate on focus and reconnect
 * - 5 second deduping interval
 */
export const swrConfig: SWRConfiguration = {
  refreshInterval: 30000,      // Auto-refresh every 30s
  revalidateOnFocus: true,     // Refresh when window regains focus
  revalidateOnReconnect: true, // Refresh when internet reconnects
  dedupingInterval: 5000,      // Dedupe requests within 5s
  fetcher,
  onError: (error: Error) => {
    console.error('SWR Error:', error);
  },
};
