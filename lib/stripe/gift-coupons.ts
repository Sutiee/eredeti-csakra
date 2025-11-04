/**
 * Gift Coupon Generation for Stripe
 * Eredeti Csakra - Gift Bundle Upsell Feature
 *
 * Handles creation of:
 * - 100% off Stripe coupons (single-use, 30-day expiration)
 * - Promotion codes linked to coupons
 * - Unique gift codes for redemption
 */

import Stripe from 'stripe';
import { stripe } from './client';
import type { ProductId } from '../pricing/variants';

/**
 * Generate a unique gift code
 * Format: GIFT-ABC123XY (13 characters total)
 */
export function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters (0, O, 1, I)
  let code = 'GIFT-';

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Create a Stripe coupon with 100% discount for gift redemption
 *
 * @param giftCode - Unique gift code (e.g., GIFT-ABC123XY)
 * @param productId - Gift product ID (gift_bundle_full or gift_ai_only)
 * @param expiresAt - Unix timestamp for coupon expiration (30 days)
 * @returns Stripe Coupon object
 */
export async function createGiftCoupon(
  giftCode: string,
  productId: Extract<ProductId, 'gift_bundle_full' | 'gift_ai_only'>,
  expiresAt: number
): Promise<Stripe.Coupon> {
  try {
    console.log('[GIFT COUPON] Creating coupon with params:', {
      percent_off: 100,
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expiresAt,
      name: `Gift: ${productId} (${giftCode})`,
      gift_code: giftCode,
      product_id: productId,
    });

    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expiresAt,
      name: `Gift: ${productId} (${giftCode})`,
      metadata: {
        gift_code: giftCode,
        product_id: productId,
        type: 'gift',
      },
    });

    console.log('[GIFT COUPON] Created successfully:', {
      coupon_id: coupon.id,
      gift_code: giftCode,
      product_id: productId,
      expires_at: new Date(expiresAt * 1000).toISOString(),
    });

    return coupon;
  } catch (error: any) {
    console.error('[GIFT COUPON] Error creating coupon:', {
      error_message: error.message,
      error_type: error.type,
      error_code: error.code,
      error_decline_code: error.decline_code,
      full_error: error,
    });
    throw new Error(`Failed to create gift coupon: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Create a Stripe promotion code linked to a coupon
 *
 * @param couponId - Stripe coupon ID (from createGiftCoupon)
 * @param giftCode - Unique gift code (used as the promo code)
 * @returns Stripe PromotionCode object
 */
export async function createPromotionCode(
  couponId: string,
  giftCode: string
): Promise<Stripe.PromotionCode> {
  try {
    console.log('[GIFT PROMO] Creating promotion code with params:', {
      coupon: couponId,
      code: giftCode,
      max_redemptions: 1,
    });

    const promoCode = (await stripe.promotionCodes.create({
      coupon: couponId,
      code: giftCode,
      max_redemptions: 1,
      metadata: {
        gift_code: giftCode,
        type: 'gift',
      },
    } as any)) as Stripe.PromotionCode;

    console.log('[GIFT PROMO] Created successfully:', {
      promo_code_id: promoCode.id,
      code: giftCode,
      coupon_id: couponId,
    });

    return promoCode;
  } catch (error: any) {
    console.error('[GIFT PROMO] Error creating promotion code:', {
      error_message: error.message,
      error_type: error.type,
      error_code: error.code,
      full_error: error,
    });
    throw new Error(`Failed to create promotion code: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Complete gift setup: Create coupon + promotion code + return metadata
 *
 * @param productId - Gift product ID
 * @returns Gift metadata for database storage
 */
export async function setupGiftRedemption(
  productId: Extract<ProductId, 'gift_bundle_full' | 'gift_ai_only'>
): Promise<{
  giftCode: string;
  stripeCouponId: string;
  stripePromoCodeId: string;
  expiresAt: Date;
}> {
  try {
    // Generate unique gift code
    const giftCode = generateGiftCode();
    console.log('[GIFT SETUP] Starting setup for product:', productId, 'with code:', giftCode);

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000);

    console.log('[GIFT SETUP] Expiration set to:', {
      date: expiresAt.toISOString(),
      unix: expiresAtUnix,
    });

    // Create Stripe coupon (100% off, single-use, 30-day expiration)
    console.log('[GIFT SETUP] Step 1: Creating coupon...');
    const coupon = await createGiftCoupon(giftCode, productId, expiresAtUnix);
    console.log('[GIFT SETUP] Step 1 complete: Coupon created:', coupon.id);

    // Create Stripe promotion code (linked to coupon)
    console.log('[GIFT SETUP] Step 2: Creating promotion code...');
    const promoCode = await createPromotionCode(coupon.id, giftCode);
    console.log('[GIFT SETUP] Step 2 complete: Promo code created:', promoCode.id);

    console.log('[GIFT SETUP] Complete:', {
      gift_code: giftCode,
      coupon_id: coupon.id,
      promo_code_id: promoCode.id,
      expires_at: expiresAt.toISOString(),
    });

    return {
      giftCode,
      stripeCouponId: coupon.id,
      stripePromoCodeId: promoCode.id,
      expiresAt,
    };
  } catch (error: any) {
    console.error('[GIFT SETUP] Failed with error:', {
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.type,
      product_id: productId,
    });
    throw new Error(`Failed to setup gift redemption: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Validate a gift code by checking if the promotion code exists and is active
 *
 * @param giftCode - Gift code to validate
 * @returns Promotion code data if valid, null if invalid/expired
 */
export async function validateGiftCode(
  giftCode: string
): Promise<Stripe.PromotionCode | null> {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      code: giftCode,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      console.log('[GIFT VALIDATE] Code not found:', giftCode);
      return null;
    }

    const promoCode = promoCodes.data[0];

    // Check if code is active and not fully redeemed
    if (!promoCode.active) {
      console.log('[GIFT VALIDATE] Code inactive:', giftCode);
      return null;
    }

    if (promoCode.times_redeemed >= (promoCode.max_redemptions || Infinity)) {
      console.log('[GIFT VALIDATE] Code fully redeemed:', giftCode);
      return null;
    }

    // Check if coupon is expired
    const coupon = (promoCode as any).coupon as Stripe.Coupon | undefined;
    if (coupon?.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
      console.log('[GIFT VALIDATE] Code expired:', giftCode);
      return null;
    }

    console.log('[GIFT VALIDATE] Code valid:', {
      code: giftCode,
      promo_code_id: promoCode.id,
      times_redeemed: promoCode.times_redeemed,
      max_redemptions: promoCode.max_redemptions,
    });

    return promoCode;
  } catch (error) {
    console.error('[GIFT VALIDATE] Error:', error);
    return null;
  }
}
