/**
 * API Route: Create Stripe Checkout Session
 * POST /api/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, validateCheckoutItems } from '@/lib/stripe/checkout';
import type { ProductId } from '@/lib/stripe/products';

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

    const { resultId, email, items } = validation.data;

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

    // Get app URL for success/cancel redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      resultId,
      email,
      items,
      successUrl: `${appUrl}/success/${resultId}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/checkout/${resultId}?canceled=true`,
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
