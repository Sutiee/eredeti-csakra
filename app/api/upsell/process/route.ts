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
import { PRODUCTS, getProductPrice } from '@/lib/stripe/products';
import { logEvent } from '@/lib/admin/tracking/server';
import { setupGiftRedemption } from '@/lib/stripe/gift-coupons';
import type { ProductId } from '@/lib/pricing/variants';
import { type VariantId, isValidVariant } from '@/lib/pricing/variants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

/**
 * Request validation schema
 * Now supports workbook and gift products
 */
const UpsellRequestSchema = z.object({
  sessionId: z.string().startsWith('cs_'), // Stripe Checkout Session ID
  resultId: z.string().uuid(),
  upsellProductId: z.enum(['workbook_30day', 'gift_bundle_full', 'gift_ai_only']),
  recipientEmail: z.string().email().optional(), // Optional: for gift recipient
  giftMessage: z.string().max(500).optional(), // Optional: personal message
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

    const { sessionId, resultId, upsellProductId, recipientEmail, giftMessage } = validation.data;

    const isGiftProduct = upsellProductId === 'gift_bundle_full' || upsellProductId === 'gift_ai_only';

    console.log('[UPSELL] Processing upsell:', {
      sessionId,
      resultId,
      upsellProductId,
      isGift: isGiftProduct,
      hasRecipient: !!recipientEmail,
    });

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

    // Get variant from original checkout session metadata (for consistent pricing)
    const variantFromSession = originalSession.metadata?.variant_id;
    const variant: VariantId = variantFromSession && isValidVariant(variantFromSession) ? variantFromSession : 'a';

    console.log('[UPSELL] Variant from original session:', {
      session_variant: variantFromSession,
      resolved_variant: variant,
    });

    // Get variant-aware price (important for gift products with A/B/C testing)
    const productPrice = getProductPrice(upsellProductId as any, variant);

    console.log('[UPSELL] Product pricing:', {
      product_id: upsellProductId,
      variant: variant,
      price: productPrice,
      is_gift: isGiftProduct,
    });

    // 4. Create a new Payment Intent (charge the saved card)
    console.log('[UPSELL] Creating payment intent for:', productPrice, 'HUF');

    const newPaymentIntent = await stripe.paymentIntents.create({
      amount: productPrice * 100, // HUF in fillér (cents)
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

    // 6. Setup gift redemption if this is a gift product
    let giftSetup: Awaited<ReturnType<typeof setupGiftRedemption>> | null = null;

    if (isGiftProduct) {
      console.log('[UPSELL] Setting up gift redemption for:', upsellProductId);
      try {
        giftSetup = await setupGiftRedemption(
          upsellProductId as Extract<ProductId, 'gift_bundle_full' | 'gift_ai_only'>
        );
        console.log('[UPSELL] Gift setup complete:', {
          giftCode: giftSetup.giftCode,
          expiresAt: giftSetup.expiresAt,
        });
      } catch (giftError) {
        console.error('[UPSELL] Gift setup failed:', giftError);
        return NextResponse.json(
          { error: 'Az ajándék beállítása sikertelen', code: 'GIFT_SETUP_FAILED' },
          { status: 500 }
        );
      }
    }

    // 7. Save purchase to database
    const supabase = createSupabaseClient();

    // For gifts, save to gift_purchases table
    if (isGiftProduct && giftSetup) {
      const { data: giftPurchase, error: giftDbError } = await (supabase as any)
        .from('gift_purchases')
        .insert({
          buyer_email: originalSession.customer_email || '',
          buyer_name: originalSession.customer_details?.name || '',
          recipient_email: recipientEmail || null,
          gift_message: giftMessage || null,
          product_id: upsellProductId,
          product_name: upsellProduct.name,
          amount: productPrice,
          currency: 'HUF',
          variant_id: variant,
          stripe_payment_intent_id: newPaymentIntent.id,
          stripe_coupon_id: giftSetup.stripeCouponId,
          stripe_promo_code_id: giftSetup.stripePromoCodeId,
          gift_code: giftSetup.giftCode,
          status: 'active',
          expires_at: giftSetup.expiresAt.toISOString(),
        })
        .select()
        .single();

      if (giftDbError) {
        console.error('[UPSELL] Gift purchase database error:', giftDbError);
        return NextResponse.json(
          { error: 'Adatbázis hiba történt', code: 'DATABASE_ERROR' },
          { status: 500 }
        );
      }

      console.log('[UPSELL] Gift purchase saved:', {
        id: giftPurchase.id,
        gift_code: giftPurchase.gift_code,
        product_id: giftPurchase.product_id,
      });

      // Track gift purchase event
      await logEvent('gift_purchased', {
        result_id: resultId,
        product_id: upsellProductId,
        amount: productPrice,
        gift_code: giftSetup.giftCode,
        has_recipient: !!recipientEmail,
      });

      // Send gift buyer confirmation email in background
      const triggerGiftBuyerEmail = async () => {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
          const response = await fetch(`${siteUrl}/api/send-gift-buyer-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerName: originalSession.customer_details?.name || 'Vásárló',
              buyerEmail: originalSession.customer_email || '',
              giftCode: giftSetup.giftCode,
              expiresAt: giftSetup.expiresAt.toISOString(),
              productName: upsellProduct.name,
              recipientEmail: recipientEmail || null,
            }),
          });

          if (!response.ok) {
            console.error('[UPSELL] Gift buyer email failed');
          } else {
            console.log('[UPSELL] Gift buyer email sent successfully');
          }
        } catch (error) {
          console.error('[UPSELL] Gift buyer email error:', error);
        }
      };

      // Use waitUntil for email sending
      const waitUntil = (request as any).waitUntil;
      if (waitUntil && typeof waitUntil === 'function') {
        waitUntil(triggerGiftBuyerEmail());
      } else {
        triggerGiftBuyerEmail().catch(console.error);
      }

      // Return gift success response
      return NextResponse.json({
        success: true,
        gift_code: giftSetup.giftCode,
        expires_at: giftSetup.expiresAt.toISOString(),
        product_name: upsellProduct.name,
        amount: productPrice,
        message: 'Sikeres ajándék vásárlás! Az ajándékkód hamarosan megérkezik emailben.',
      });
    }

    // For regular products (workbook), save to purchases table
    const { data: purchase, error: dbError } = await supabase
      .from('purchases')
      .insert({
        result_id: resultId,
        email: originalSession.customer_email || '',
        product_id: upsellProductId,
        product_name: upsellProduct.name,
        stripe_session_id: null, // No new session for upsell
        stripe_payment_intent_id: newPaymentIntent.id,
        amount: productPrice,
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

    // 8. Track successful upsell event
    await logEvent('upsell_purchased', {
      result_id: resultId,
      product_id: upsellProductId,
      amount: productPrice,
      original_session_id: sessionId,
      purchase_id: purchase.id,
    });

    // 9. Trigger workbook generation in background
    if (upsellProductId === 'workbook_30day') {
      console.log('[UPSELL] Triggering 30-day workbook generation for result:', resultId);

      // CRITICAL: Use waitUntil() to guarantee background task execution
      // Without this, Vercel terminates the function before the fetch completes
      const triggerWorkbookGeneration = async () => {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
          console.log('[UPSELL] Calling workbook generation API:', `${siteUrl}/api/generate-workbook`);

          const response = await fetch(`${siteUrl}/api/generate-workbook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result_id: resultId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('[UPSELL] Workbook generation API failed:', {
              status: response.status,
              error: errorData,
            });
          } else {
            const successData = await response.json();
            console.log('[UPSELL] Workbook generation triggered successfully:', successData);
          }
        } catch (error) {
          console.error('[UPSELL] Exception while triggering workbook generation:', error);
        }
      };

      // Use Vercel's waitUntil to ensure the background task completes
      // Note: waitUntil is a Vercel-specific extension, not in NextRequest types
      const waitUntil = (request as any).waitUntil;
      if (waitUntil && typeof waitUntil === 'function') {
        waitUntil(triggerWorkbookGeneration());
      } else {
        // Fallback for local development (no waitUntil available)
        triggerWorkbookGeneration().catch(console.error);
      }
    }

    // 10. Return success response
    return NextResponse.json({
      success: true,
      purchase_id: purchase.id,
      product_name: upsellProduct.name,
      amount: productPrice,
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
