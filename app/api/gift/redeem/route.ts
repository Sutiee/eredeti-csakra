/**
 * API Route: Redeem Gift Code
 * POST /api/gift/redeem
 *
 * Creates a Stripe checkout session with the gift coupon applied
 * Validates gift code, quiz completion, and creates checkout for recipient
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { PRODUCTS } from '@/lib/stripe/products';
import { logEvent } from '@/lib/admin/tracking/server';
import type { ProductId } from '@/lib/pricing/variants';

/**
 * Request validation schema
 */
const RedeemRequestSchema = z.object({
  giftCode: z.string().startsWith('GIFT-'),
  resultId: z.string().uuid(),
  email: z.string().email(),
});

/**
 * POST /api/gift/redeem
 * Create checkout session with gift code applied
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = RedeemRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Érvénytelen adatok',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { giftCode, resultId, email } = validation.data;

    console.log('[GIFT REDEEM] Starting redemption:', { giftCode, resultId, email });

    const supabase = createSupabaseClient();

    // 1. Validate gift code exists and is active
    const { data: giftPurchase, error: giftError } = await (supabase as any)
      .from('gift_purchases')
      .select('*')
      .eq('gift_code', giftCode)
      .single();

    if (giftError || !giftPurchase) {
      console.error('[GIFT REDEEM] Gift code not found:', giftCode);
      await logEvent('gift_redeem_failed', {
        gift_code: giftCode,
        reason: 'not_found',
        result_id: resultId,
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Az ajándékkód nem található',
            code: 'GIFT_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // 2. Check gift status
    if (giftPurchase.status === 'redeemed') {
      console.error('[GIFT REDEEM] Already redeemed:', giftCode);
      await logEvent('gift_redeem_failed', {
        gift_code: giftCode,
        reason: 'already_redeemed',
        result_id: resultId,
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Ez az ajándékkód már be lett váltva',
            code: 'ALREADY_REDEEMED',
          },
        },
        { status: 400 }
      );
    }

    if (giftPurchase.status !== 'active') {
      console.error('[GIFT REDEEM] Invalid status:', { giftCode, status: giftPurchase.status });
      await logEvent('gift_redeem_failed', {
        gift_code: giftCode,
        reason: giftPurchase.status,
        result_id: resultId,
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Ez az ajándékkód már nem érvényes',
            code: 'INVALID_STATUS',
          },
        },
        { status: 400 }
      );
    }

    // 3. Check expiration
    const expiresAt = new Date(giftPurchase.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.error('[GIFT REDEEM] Expired:', { giftCode, expiresAt });

      // Update status to expired
      await (supabase as any)
        .from('gift_purchases')
        .update({ status: 'expired' })
        .eq('gift_code', giftCode);

      await logEvent('gift_redeem_failed', {
        gift_code: giftCode,
        reason: 'expired',
        expires_at: expiresAt.toISOString(),
        result_id: resultId,
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Ez az ajándékkód lejárt',
            code: 'EXPIRED',
            expires_at: expiresAt.toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // 4. Verify quiz result exists
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .select('id, email, name')
      .eq('id', resultId)
      .single();

    if (quizError || !quizResult) {
      console.error('[GIFT REDEEM] Quiz result not found:', resultId);
      await logEvent('gift_redeem_failed', {
        gift_code: giftCode,
        reason: 'quiz_not_found',
        result_id: resultId,
      });

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'A kvíz eredmény nem található. Kérlek töltsd ki először a kvízt!',
            code: 'QUIZ_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // 5. Determine products based on gift type
    const productId = giftPurchase.product_id as ProductId;
    const items: Array<{ productId: ProductId; quantity: number }> = [];

    if (productId === 'gift_bundle_full') {
      // Full bundle: AI Analysis + Workbook
      items.push({ productId: 'ai_analysis_pdf', quantity: 1 });
      items.push({ productId: 'workbook_30day', quantity: 1 });
    } else if (productId === 'gift_ai_only') {
      // AI Analysis only
      items.push({ productId: 'ai_analysis_pdf', quantity: 1 });
    } else {
      console.error('[GIFT REDEEM] Unknown product:', productId);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Ismeretlen ajándék termék',
            code: 'UNKNOWN_PRODUCT',
          },
        },
        { status: 400 }
      );
    }

    // 6. Create Stripe checkout session with promotion code
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${siteUrl}/success/${resultId}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/eredmeny/${resultId}`;

    console.log('[GIFT REDEEM] Creating checkout session with promo code:', giftPurchase.stripe_promo_code_id);

    const session = await createCheckoutSession({
      resultId,
      email,
      items,
      successUrl,
      cancelUrl,
      promotionCodeId: giftPurchase.stripe_promo_code_id, // Apply 100% discount
      metadata: {
        gift_code: giftCode,
        gift_purchase_id: giftPurchase.id,
        is_gift_redemption: 'true',
      },
    });

    // 7. Update gift status to pending (will be redeemed after successful checkout)
    await (supabase as any)
      .from('gift_purchases')
      .update({
        status: 'pending',
        recipient_email: email,
      })
      .eq('gift_code', giftCode);

    // 8. Track redemption attempt
    await logEvent('gift_redemption_started', {
      gift_code: giftCode,
      result_id: resultId,
      product_id: productId,
      checkout_session_id: session.id,
    });

    console.log('[GIFT REDEEM] Checkout session created:', session.id);

    // 9. Return checkout URL
    return NextResponse.json({
      data: {
        checkout_url: session.url,
        session_id: session.id,
        product_name: PRODUCTS[productId]?.name || 'Ajándék csomag',
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[GIFT REDEEM] Unexpected error:', error);

    await logEvent('gift_redeem_error', {
      error_message: error.message || 'Unknown error',
    }).catch(console.error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Váratlan hiba történt. Kérlek próbáld újra később.',
          code: 'UNEXPECTED_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
