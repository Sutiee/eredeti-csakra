/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { logEvent } from '@/lib/admin/tracking/server';

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
 * Get product display name from product ID
 */
function getProductName(productId: string): string {
  const productNames: Record<string, string> = {
    'ai_analysis_pdf': 'Személyre Szabott Csakra Elemzés',
    'workbook_30day': '30 Napos Csakra Munkafüzet',
    'prod_chakra_meditations': 'Csakra Aktivizáló Meditációk',
    'prod_full_harmony_bundle': 'Teljes Csakra Harmónia Csomag',
  };
  return productNames[productId] || 'Termék';
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  request: NextRequest
) {
  const supabase = getSupabaseAdmin();

  try {
    const resultId = session.metadata?.result_id;
    const email = session.customer_email || session.metadata?.email;
    const isGiftRedemption = session.metadata?.is_gift_redemption === 'true';
    const giftCode = session.metadata?.gift_code;
    const isLightPurchase = session.metadata?.is_light_purchase === 'true';

    if (!resultId || !email) {
      console.error('Missing result_id or email in session metadata');
      return;
    }

    // Log light purchase detection
    if (isLightPurchase) {
      console.log('[WEBHOOK] Processing light quiz purchase for result:', resultId);
    }

    // If this is a gift redemption, update gift_purchases status
    if (isGiftRedemption && giftCode) {
      console.log('[WEBHOOK] Processing gift redemption:', giftCode);

      const { error: giftUpdateError } = await (supabase as any)
        .from('gift_purchases')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          recipient_email: email,
        })
        .eq('gift_code', giftCode);

      if (giftUpdateError) {
        console.error('[WEBHOOK] Failed to update gift status:', giftUpdateError);
      } else {
        console.log('[WEBHOOK] Gift redemption completed:', giftCode);

        // Send gift buyer notification email about redemption
        const triggerGiftRedemptionEmail = async () => {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
            const response = await fetch(`${siteUrl}/api/send-gift-redemption-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gift_code: giftCode }),
            });

            if (!response.ok) {
              console.error('[WEBHOOK] Gift redemption email failed');
            } else {
              console.log('[WEBHOOK] Gift redemption email sent');
            }
          } catch (error) {
            console.error('[WEBHOOK] Gift redemption email error:', error);
          }
        };

        // Use waitUntil for email sending
        const waitUntil = (request as any).waitUntil;
        if (waitUntil && typeof waitUntil === 'function') {
          waitUntil(triggerGiftRedemptionEmail());
        } else {
          triggerGiftRedemptionEmail().catch(console.error);
        }
      }
    }

    // Extract line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // Import PRODUCTS for fallback
    const { PRODUCTS } = await import('@/lib/stripe/products');

    // Create purchase records for each line item
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product | undefined;
      const productId = product?.metadata?.product_id || product?.id || 'unknown';

      // Get local product definition as fallback
      const localProduct = PRODUCTS[productId as keyof typeof PRODUCTS];

      // FIX: item.description is NULL for dynamic products created with price_data
      // Fallback chain: Stripe data → Local product definition → Default
      const productName =
        item.description ||
        product?.name ||
        product?.metadata?.name ||
        localProduct?.name ||
        'Unknown Product';

      const rawAmount = item.amount_total || 0;

      // CRITICAL FIX: Use local product price if Stripe amount is 0 or invalid
      const amount = rawAmount > 0
        ? rawAmount / 100  // Convert from cents to HUF
        : (localProduct?.price || 0);  // Fallback to local product price

      const currency = item.currency?.toUpperCase() || localProduct?.currency || 'HUF';

      // DEBUG: Log extracted data
      console.log('[WEBHOOK] Processing line item:', {
        productId,
        productName,
        amount,
        currency,
        source: rawAmount > 0 ? 'stripe' : 'local_fallback',
        raw_stripe_amount: item.amount_total,
        raw_description: item.description,
        raw_product_name: product?.name,
        local_product_found: !!localProduct,
      });

      // VALIDATION: Skip invalid purchases
      if (amount <= 0) {
        console.error('[WEBHOOK] Skipping line item with invalid amount:', {
          productId,
          productName,
          amount,
          raw_stripe_amount: item.amount_total,
        });
        continue; // Skip this item
      }

      if (!productName || productName === 'Unknown Product') {
        console.error('[WEBHOOK] Skipping line item with unknown product:', {
          productId,
          amount,
          raw_description: item.description,
          raw_product_name: product?.name,
        });
        continue; // Skip this item
      }

      // Insert purchase record
      const { error: purchaseError } = await supabase.from('purchases').insert({
        result_id: resultId,
        email,
        product_id: productId,
        product_name: productName,
        amount: amount, // Already converted to HUF at line 79-81
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

      // Handle light purchase: update light result and send continuation email
      if (isLightPurchase) {
        console.log('[WEBHOOK] Updating light quiz result to converted_to_full for:', resultId);

        // Track light purchase completion
        await logEvent('light_purchase_completed', {
          light_result_id: resultId,
          product_id: productId,
          amount: amount,
          currency: currency,
          email: email,
        }, {
          resultId: resultId,
        });

        // Update the light quiz result to mark it as converted
        const { error: updateError } = await supabase
          .from('quiz_results')
          .update({ converted_to_full: true })
          .eq('id', resultId)
          .eq('quiz_type', 'light');

        if (updateError) {
          console.error('[WEBHOOK] Failed to update light result converted status:', updateError);
        } else {
          console.log('[WEBHOOK] Light result marked as converted:', resultId);
        }

        // Send light purchase continuation email (different from regular confirmation)
        console.log('[WEBHOOK] Sending light purchase continuation email to:', email);
        const sendLightPurchaseContinuationEmail = async () => {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
            const emailResponse = await fetch(`${siteUrl}/api/send-light-purchase-continuation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: session.metadata?.name || 'Vásárló',
                email,
                lightResultId: resultId,
              }),
            });

            if (!emailResponse.ok) {
              const errorText = await emailResponse.text();
              console.error('[WEBHOOK] Light purchase continuation email failed:', errorText);
            } else {
              console.log('[WEBHOOK] Light purchase continuation email sent successfully');
            }
          } catch (error) {
            console.error('[WEBHOOK] Exception sending light purchase continuation email:', error);
          }
        };

        // Use Vercel waitUntil API to ensure background task completes
        const waitUntil = (request as any).waitUntil;
        if (waitUntil && typeof waitUntil === 'function') {
          waitUntil(sendLightPurchaseContinuationEmail());
        } else {
          // Fallback for local development
          sendLightPurchaseContinuationEmail().catch(console.error);
        }

        // Skip PDF generation for light purchases - PDF will be generated after full quiz completion
        console.log('[WEBHOOK] Skipping PDF generation for light purchase - will generate after full quiz');
        continue; // Skip the rest of the processing for this line item
      }

      // Send immediate purchase confirmation email (non-blocking) - for normal purchases only
      console.log('[WEBHOOK] Sending immediate purchase confirmation email to:', email);
      const sendPurchaseConfirmationEmail = async () => {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
          const emailResponse = await fetch(`${siteUrl}/api/send-purchase-confirmation-immediate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: session.metadata?.name || 'Vásárló',
              email,
              resultId,
              productName: getProductName(productId),
              productId,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('[WEBHOOK] Purchase confirmation email failed:', errorText);
          } else {
            console.log('[WEBHOOK] Purchase confirmation email sent successfully');
          }
        } catch (error) {
          console.error('[WEBHOOK] Exception sending purchase confirmation email:', error);
        }
      };

      // Use Vercel waitUntil API to ensure background task completes
      const waitUntil = (request as any).waitUntil;
      if (waitUntil && typeof waitUntil === 'function') {
        waitUntil(sendPurchaseConfirmationEmail());
      } else {
        // Fallback for local development
        sendPurchaseConfirmationEmail().catch(console.error);
      }

      // If AI analysis PDF was purchased, trigger PDF generation in background
      if (productId === 'ai_analysis_pdf') {
        console.log('[WEBHOOK] Triggering Markdown-styled PDF generation for result:', resultId);

        const triggerAIPDFGeneration = async () => {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
            const response = await fetch(`${siteUrl}/api/generate-detailed-report-markdown-styled`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ result_id: resultId }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[WEBHOOK] AI PDF generation failed:', errorText);
            } else {
              console.log('[WEBHOOK] AI PDF generation triggered successfully');
            }
          } catch (error) {
            console.error('[WEBHOOK] Exception triggering AI PDF generation:', error);
          }
        };

        // Use Vercel waitUntil API to ensure background task completes
        const waitUntil = (request as any).waitUntil;
        if (waitUntil && typeof waitUntil === 'function') {
          waitUntil(triggerAIPDFGeneration());
        } else {
          // Fallback for local development
          triggerAIPDFGeneration().catch(console.error);
        }
      }

      // If 30-day workbook was purchased, trigger workbook generation in background
      if (productId === 'workbook_30day') {
        console.log('[WEBHOOK] Triggering 30-day workbook generation for result:', resultId);

        const triggerWorkbookGeneration = async () => {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
            const response = await fetch(`${siteUrl}/api/generate-workbook`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ result_id: resultId }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[WEBHOOK] Workbook generation failed:', errorText);
            } else {
              console.log('[WEBHOOK] Workbook generation triggered successfully');
            }
          } catch (error) {
            console.error('[WEBHOOK] Exception triggering workbook generation:', error);
          }
        };

        // Use Vercel waitUntil API to ensure background task completes
        // (same pattern as upsell route)
        const waitUntil = (request as any).waitUntil;
        if (waitUntil && typeof waitUntil === 'function') {
          waitUntil(triggerWorkbookGeneration());
        } else {
          // Fallback for local development (no waitUntil available)
          triggerWorkbookGeneration().catch(console.error);
        }
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
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, request);
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
