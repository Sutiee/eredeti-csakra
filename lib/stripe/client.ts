/**
 * Stripe Client Configuration
 * Eredeti Csakra - Payment Processing
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

/**
 * Server-side Stripe client instance
 * Used for creating checkout sessions, handling webhooks, etc.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  appInfo: {
    name: 'Eredeti Csakra',
    version: '1.0.0',
    url: 'https://eredeticsakra.hu',
  },
});

/**
 * Client-side Stripe publishable key
 * Safe to expose in browser
 */
export const getStripePublishableKey = (): string => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
  }

  return key;
};
