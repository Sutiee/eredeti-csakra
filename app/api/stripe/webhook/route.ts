/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

/**
 * Disable body parsing for webhook signature verification
 */
export const runtime = 'nodejs';

/**
 * Create Supabase admin client for database operations
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();

  try {
    const resultId = session.metadata?.result_id;
    const email = session.customer_email || session.metadata?.email;

    if (!resultId || !email) {
      console.error('Missing result_id or email in session metadata');
      return;
    }

    // Extract line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // Create purchase records for each line item
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product | undefined;
      const productId = product?.metadata?.product_id || product?.id || 'unknown';

      // FIX: item.description is NULL for dynamic products created with price_data
      // Fallback chain: description → product.name → product.id → 'Unknown Product'
      const productName =
        item.description ||
        product?.name ||
        product?.metadata?.name ||
        'Unknown Product';

      const amount = item.amount_total || 0;
      const currency = item.currency || 'huf';

      // DEBUG: Log extracted data
      console.log('[WEBHOOK] Processing line item:', {
        productId,
        productName,
        amount: amount / 100,
        currency,
        raw_description: item.description,
        raw_product_name: product?.name,
      });

      // Insert purchase record
      const { error: purchaseError } = await supabase.from('purchases').insert({
        result_id: resultId,
        email,
        product_id: productId,
        product_name: productName,
        amount: amount / 100, // Convert from cents
        currency: currency.toUpperCase(),
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'completed',
        pdf_url: null, // Will be generated separately
      });

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError);
        continue;
      }

      // If meditation access was purchased, create access token
      if (
        productId === 'prod_chakra_meditations' ||
        productId === 'prod_full_harmony_bundle'
      ) {
        // Generate access token
        const accessToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year access

        const { error: accessError } = await supabase.from('meditation_access').insert({
          purchase_id: resultId, // Using result_id as temporary purchase_id
          email,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
        });

        if (accessError) {
          console.error('Error creating meditation access:', accessError);
        }
      }
    }

    console.log(`Successfully processed payment for session: ${session.id}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * POST handler for Stripe webhooks
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        // Optional: Additional logging/tracking
        console.log('Payment intent succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        // Optional: Handle failed payments
        console.error('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
