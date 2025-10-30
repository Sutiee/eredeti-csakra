/**
 * API Route: Validate Gift Code
 * GET /api/gift/validate?code=GIFT-ABC123XY
 *
 * Validates a gift code and returns gift details if valid
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const giftCode = searchParams.get('code');

    if (!giftCode) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Az ajándékkód megadása kötelező', code: 'MISSING_CODE' },
        },
        { status: 400 }
      );
    }

    console.log('[GIFT VALIDATE] Validating gift code:', giftCode);

    // Query gift_purchases table
    const supabase = createSupabaseClient();
    const { data: giftPurchase, error: dbError } = await (supabase as any)
      .from('gift_purchases')
      .select('*')
      .eq('gift_code', giftCode)
      .single();

    if (dbError || !giftPurchase) {
      console.log('[GIFT VALIDATE] Gift code not found:', giftCode);
      return NextResponse.json({
        data: {
          valid: false,
          reason: 'not_found',
          message: 'Az ajándékkód nem található',
        },
        error: null,
      });
    }

    // Check status
    if (giftPurchase.status === 'redeemed') {
      console.log('[GIFT VALIDATE] Gift already redeemed:', giftCode);
      return NextResponse.json({
        data: {
          valid: false,
          reason: 'already_redeemed',
          message: 'Ez az ajándékkód már be lett váltva',
          redeemed_at: giftPurchase.redeemed_at,
        },
        error: null,
      });
    }

    if (giftPurchase.status === 'expired' || giftPurchase.status === 'cancelled') {
      console.log('[GIFT VALIDATE] Gift expired or cancelled:', giftCode);
      return NextResponse.json({
        data: {
          valid: false,
          reason: giftPurchase.status,
          message: 'Ez az ajándékkód már nem érvényes',
        },
        error: null,
      });
    }

    // Check expiration date
    const expiresAt = new Date(giftPurchase.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.log('[GIFT VALIDATE] Gift expired:', { giftCode, expiresAt });

      // Update status to expired
      await (supabase as any)
        .from('gift_purchases')
        .update({ status: 'expired' })
        .eq('gift_code', giftCode);

      return NextResponse.json({
        data: {
          valid: false,
          reason: 'expired',
          message: 'Ez az ajándékkód lejárt',
          expires_at: expiresAt.toISOString(),
        },
        error: null,
      });
    }

    // Gift code is valid!
    console.log('[GIFT VALIDATE] Gift code valid:', {
      giftCode,
      productId: giftPurchase.product_id,
      expiresAt,
    });

    return NextResponse.json({
      data: {
        valid: true,
        product_id: giftPurchase.product_id,
        product_name: getProductName(giftPurchase.product_id),
        expires_at: expiresAt.toISOString(),
        status: giftPurchase.status,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[GIFT VALIDATE] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Váratlan hiba történt', code: 'UNEXPECTED_ERROR' },
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get Hungarian product name
 */
function getProductName(productId: string): string {
  const names: Record<string, string> = {
    gift_bundle_full: 'AI Elemzés + 30 Napos Munkafüzet Ajándék Csomag',
    gift_ai_only: 'Ajándék AI Elemzés PDF',
  };
  return names[productId] || productId;
}
