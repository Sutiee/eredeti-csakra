/**
 * API Route: Create Stripe Checkout Session
 * POST /api/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, validateCheckoutItems } from '@/lib/stripe/checkout';
import type { ProductId } from '@/lib/stripe/products';
import { isValidVariant, type VariantId } from '@/lib/pricing/variants';

/**
 * Request validation schema
 */
const CreateCheckoutSchema = z.object({
  resultId: z.string().uuid(),
  email: z.string().email(),
  items: z.array(
    z.object({
      productId: z.string() as z.ZodType<ProductId>,
      quantity: z.number().int().positive(),
    })
  ),
  // Optional: Light quiz result ID for light quiz funnel purchases
  light_result_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = CreateCheckoutSchema.safeParse(body);
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

    const { resultId, email, items, light_result_id } = validation.data;

    // Validate checkout items
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: itemsValidation.error || 'Érvénytelen termékek',
            code: 'INVALID_ITEMS',
          },
        },
        { status: 400 }
      );
    }

    // Get variant from cookie (set by middleware)
    const variantCookie = request.cookies.get('__variant')?.value;
    const variantId: VariantId =
      variantCookie && isValidVariant(variantCookie) ? variantCookie : 'a';

    // Get app URL for success/cancel redirects
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';

    // Determine success URL based on whether this is a light quiz purchase
    const successUrl = light_result_id
      ? `${appUrl}/kviz?from=purchase&light_id=${light_result_id}`
      : `${appUrl}/success/${resultId}?session_id={CHECKOUT_SESSION_ID}`;

    // Build additional metadata for light quiz purchases
    const additionalMetadata: Record<string, string> = {};
    if (light_result_id) {
      additionalMetadata.light_result_id = light_result_id;
      additionalMetadata.is_light_purchase = 'true';
    }

    // Create Stripe checkout session with variant
    const session = await createCheckoutSession({
      resultId,
      email,
      items,
      successUrl,
      cancelUrl: `${appUrl}/checkout/${resultId}?canceled=true`,
      variantId, // Pass variant for dynamic pricing
      metadata: additionalMetadata,
    });

    return NextResponse.json({
      data: {
        sessionId: session.id,
        url: session.url,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Hiba történt a fizetés indításakor',
          code: 'CHECKOUT_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
