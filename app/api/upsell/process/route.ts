/**
 * API Route: Process Upsell Purchase
 * POST /api/upsell/process
 *
 * Handles 1-click upsell purchases using saved payment method from original checkout.
 * This endpoint charges the customer's saved card without requiring them to re-enter payment details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { createSupabaseClient } from '@/lib/supabase/client';
import { PRODUCTS } from '@/lib/stripe/products';
import { logEvent } from '@/lib/admin/tracking/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

/**
 * Request validation schema
 */
const UpsellRequestSchema = z.object({
  sessionId: z.string().startsWith('cs_'), // Stripe Checkout Session ID
  resultId: z.string().uuid(),
  upsellProductId: z.literal('workbook_30day'), // Only workbook can be upsell
});

/**
 * POST /api/upsell/process
 * Process the upsell purchase using saved payment method
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = UpsellRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Érvénytelen adatok',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { sessionId, resultId, upsellProductId } = validation.data;

    console.log('[UPSELL] Processing upsell:', { sessionId, resultId, upsellProductId });

    // 1. Retrieve the original Stripe session
    const originalSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });

    if (!originalSession) {
      console.error('[UPSELL] Session not found:', sessionId);
      return NextResponse.json(
        { error: 'A vásárlási munkamenet nem található', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 2. Extract payment method from original payment intent
    const paymentIntent = originalSession.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent) {
      console.error('[UPSELL] No payment intent found:', sessionId);
      return NextResponse.json(
        { error: 'Nincs fizetési információ', code: 'NO_PAYMENT_INTENT' },
        { status: 400 }
      );
    }

    const paymentMethodId = paymentIntent.payment_method as string;

    // Extract customer ID from expanded customer object
    const customer = originalSession.customer as Stripe.Customer;
    const customerId = typeof customer === 'string' ? customer : customer.id;

    if (!paymentMethodId) {
      console.error('[UPSELL] No payment method saved:', sessionId);
      return NextResponse.json(
        {
          error: 'A fizetési mód nem lett mentve. Kérlek próbáld újra a teljes vásárlást.',
          code: 'NO_PAYMENT_METHOD',
        },
        { status: 400 }
      );
    }

    console.log('[UPSELL] Payment method found:', { paymentMethodId, customerId });

    // 3. Get upsell product details
    const upsellProduct = PRODUCTS[upsellProductId];

    if (!upsellProduct) {
      console.error('[UPSELL] Invalid product:', upsellProductId);
      return NextResponse.json(
        { error: 'Érvénytelen termék', code: 'INVALID_PRODUCT' },
        { status: 400 }
      );
    }

    // 4. Create a new Payment Intent (charge the saved card)
    console.log('[UPSELL] Creating payment intent for:', upsellProduct.price, 'HUF');

    const newPaymentIntent = await stripe.paymentIntents.create({
      amount: upsellProduct.price * 100, // HUF in fillér (cents)
      currency: 'huf',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true, // ← User is not present, use saved card
      confirm: true, // ← Charge immediately
      description: `Upsell: ${upsellProduct.name}`,
      metadata: {
        type: 'upsell',
        original_session_id: sessionId,
        result_id: resultId,
        product_id: upsellProductId,
      },
    });

    // 5. Check if payment succeeded
    if (newPaymentIntent.status !== 'succeeded') {
      console.error('[UPSELL] Payment failed:', newPaymentIntent.status);

      // Log failed upsell
      await logEvent('upsell_failed', {
        result_id: resultId,
        product_id: upsellProductId,
        reason: newPaymentIntent.status,
        session_id: sessionId,
      });

      return NextResponse.json(
        {
          error: 'A fizetés nem sikerült. Kérlek ellenőrizd a kártyádat.',
          code: 'PAYMENT_FAILED',
        },
        { status: 402 }
      );
    }

    console.log('[UPSELL] Payment succeeded:', newPaymentIntent.id);

    // 6. Save purchase to database
    const supabase = createSupabaseClient();

    const { data: purchase, error: dbError } = await supabase
      .from('purchases')
      .insert({
        result_id: resultId,
        email: originalSession.customer_email || '',
        product_id: upsellProductId,
        product_name: upsellProduct.name,
        stripe_session_id: null, // No new session for upsell
        stripe_payment_intent_id: newPaymentIntent.id,
        amount: upsellProduct.price,
        currency: 'HUF',
        status: 'completed',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[UPSELL] Database error:', dbError);
      return NextResponse.json(
        { error: 'Adatbázis hiba történt', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    console.log('[UPSELL] Purchase saved to database:', {
      id: purchase.id,
      product_id: purchase.product_id,
      product_name: purchase.product_name,
      amount: purchase.amount,
      status: purchase.status,
      result_id: purchase.result_id,
    });

    // 7. Track successful upsell event
    await logEvent('upsell_purchased', {
      result_id: resultId,
      product_id: upsellProductId,
      amount: upsellProduct.price,
      original_session_id: sessionId,
      purchase_id: purchase.id,
    });

    // 8. Trigger workbook generation in background (fire-and-forget)
    if (upsellProductId === 'workbook_30day') {
      console.log('[UPSELL] Triggering 30-day workbook generation for result:', resultId);

      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-workbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_id: resultId }),
      }).catch((error) => {
        console.error('[UPSELL] Failed to trigger workbook generation:', error);
        // Don't throw - upsell should succeed even if background job fails
      });
    }

    // 9. Return success response
    return NextResponse.json({
      success: true,
      purchase_id: purchase.id,
      product_name: upsellProduct.name,
      amount: upsellProduct.price,
      message: 'Sikeres vásárlás! Hamarosan megkapod emailben a munkafüzetet.',
    });
  } catch (error: any) {
    console.error('[UPSELL] Unexpected error:', error);

    // Log error event
    try {
      await logEvent('upsell_error', {
        error_message: error.message || 'Unknown error',
        error_type: error.type || 'unknown',
      });
    } catch (logError) {
      console.error('[UPSELL] Failed to log error event:', logError);
    }

    return NextResponse.json(
      {
        error: 'Váratlan hiba történt. Kérlek próbáld újra később.',
        code: 'UNEXPECTED_ERROR',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
