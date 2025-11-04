/**
 * DEBUG ENDPOINT: Test Gift Setup
 * POST /api/debug/test-gift-setup
 *
 * This endpoint tests the setupGiftRedemption() function in isolation
 * to capture detailed error messages that aren't visible in production logs.
 *
 * REMOVE THIS FILE AFTER DEBUGGING IS COMPLETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { setupGiftRedemption } from '@/lib/stripe/gift-coupons';
import type { ProductId } from '@/lib/pricing/variants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId || (productId !== 'gift_bundle_full' && productId !== 'gift_ai_only')) {
      return NextResponse.json(
        {
          error: 'Invalid product ID',
          details: 'Must be gift_bundle_full or gift_ai_only'
        },
        { status: 400 }
      );
    }

    console.log('[DEBUG] Testing gift setup for product:', productId);

    const result = await setupGiftRedemption(
      productId as Extract<ProductId, 'gift_bundle_full' | 'gift_ai_only'>
    );

    console.log('[DEBUG] Gift setup succeeded:', result);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Gift setup test completed successfully',
    });
  } catch (error: any) {
    console.error('[DEBUG] Gift setup failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Unknown error',
          type: error.type || 'unknown',
          code: error.code || 'unknown',
          stack: error.stack,
          fullError: JSON.stringify(error, null, 2),
        },
      },
      { status: 500 }
    );
  }
}
