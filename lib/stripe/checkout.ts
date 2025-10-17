/**
 * Stripe Checkout Helpers
 * Eredeti Csakra - Checkout Session Management
 */

import { stripe } from './client';
import { PRODUCTS, ProductId } from './products';
import type Stripe from 'stripe';

export type CheckoutLineItem = {
  productId: ProductId;
  quantity: number;
};

export type CreateCheckoutSessionParams = {
  resultId: string;
  email: string;
  items: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
};

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { resultId, email, items, successUrl, cancelUrl } = params;

  // Convert items to Stripe line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const product = PRODUCTS[item.productId];

    if (!product) {
      throw new Error(`Invalid product ID: ${item.productId}`);
    }

    return {
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            product_id: product.id,
          },
        },
        unit_amount: product.price * 100, // Convert to cents (fillér)
      },
      quantity: item.quantity,
    };
  });

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',

    // ⚠️ CRITICAL: Save payment method for future upsell charges
    payment_intent_data: {
      setup_future_usage: 'off_session', // Allows charging without user present
      metadata: {
        result_id: resultId,
        product_ids: items.map((item) => item.productId).join(','),
      },
    },

    customer_creation: 'always', // Always create a Stripe customer

    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    metadata: {
      result_id: resultId,
      email,
      product_ids: items.map((item) => item.productId).join(','),
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',

    // GDPR Compliance: User must accept Terms of Service
    // TODO: Enable after setting Terms of Service URL in Stripe Dashboard
    // consent_collection: {
    //   terms_of_service: 'required',
    // },
  });

  return session;
}

/**
 * Calculate total price for selected items
 */
export function calculateTotal(items: CheckoutLineItem[]): number {
  return items.reduce((total, item) => {
    const product = PRODUCTS[item.productId];
    if (!product) return total;
    return total + product.price * item.quantity;
  }, 0);
}

/**
 * Validate checkout items
 */
export function validateCheckoutItems(items: CheckoutLineItem[]): {
  valid: boolean;
  error?: string;
} {
  if (!items || items.length === 0) {
    return { valid: false, error: 'No items selected' };
  }

  // Check if bundle is selected with other items
  const hasBundle = items.some((item) => item.productId === 'prod_full_harmony_bundle');
  if (hasBundle && items.length > 1) {
    return {
      valid: false,
      error: 'Bundle cannot be combined with other products',
    };
  }

  // Validate all product IDs
  for (const item of items) {
    if (!PRODUCTS[item.productId]) {
      return { valid: false, error: `Invalid product: ${item.productId}` };
    }
  }

  return { valid: true };
}

/**
 * Get product names for display
 */
export function getProductNames(items: CheckoutLineItem[]): string[] {
  return items
    .map((item) => {
      const product = PRODUCTS[item.productId];
      return product ? product.name : null;
    })
    .filter((name): name is string => name !== null);
}
