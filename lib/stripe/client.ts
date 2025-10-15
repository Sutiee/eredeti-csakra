/**
 * Stripe Client Configuration
 * Eredeti Csakra - Payment Processing
 */

import Stripe from 'stripe';

/**
 * Lazy-initialized Stripe client instance
 * Initialized on first use to avoid build-time environment variable requirements
 */
let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance
 * Creates the instance on first call (lazy initialization)
 */
export const getStripeClient = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
      appInfo: {
        name: 'Eredeti Csakra',
        version: '1.0.0',
        url: 'https://eredeticsakra.hu',
      },
    });
  }

  return stripeInstance;
};

/**
 * @deprecated Use getStripeClient() instead
 * Kept for backward compatibility
 */
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripeClient()[prop as keyof Stripe];
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
