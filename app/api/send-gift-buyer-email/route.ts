/**
 * API Route: Send Gift Buyer Confirmation Email
 * POST /api/send-gift-buyer-email
 *
 * Sends confirmation email to gift buyer with gift code
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateGiftBuyerEmail, generateGiftBuyerEmailText } from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { buyerName, buyerEmail, giftCode, expiresAt, productName, recipientEmail } = body;

    // Validation
    if (!buyerName || !buyerEmail || !giftCode || !expiresAt || !productName) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Hiányzó kötelező mezők', code: 'MISSING_FIELDS' },
        },
        { status: 400 }
      );
    }

    console.log('[GIFT BUYER EMAIL] Sending confirmation:', { buyerEmail, giftCode });

    // Generate email templates
    const emailHtml = generateGiftBuyerEmail({
      buyerName,
      giftCode,
      expiresAt,
      productName,
      recipientEmail,
    });

    const emailText = generateGiftBuyerEmailText({
      buyerName,
      giftCode,
      expiresAt,
      productName,
      recipientEmail,
    });

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `Eredeti Csakra <${process.env.RESEND_FROM_EMAIL || 'hello@eredeticsakra.hu'}>`,
      to: [buyerEmail],
      subject: '🎁 Ajándékod elkészült! - Eredeti Csakra',
      html: emailHtml,
      text: emailText,
      tags: [
        { name: 'type', value: 'gift_buyer_confirmation' },
        { name: 'gift_code', value: giftCode },
      ],
    });

    if (error) {
      console.error('[GIFT BUYER EMAIL] Send failed:', error);
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Email küldés sikertelen', code: 'EMAIL_SEND_FAILED' },
        },
        { status: 500 }
      );
    }

    console.log('[GIFT BUYER EMAIL] Sent successfully:', data?.id);

    return NextResponse.json({
      data: { success: true, emailId: data?.id },
      error: null,
    });
  } catch (error: any) {
    console.error('[GIFT BUYER EMAIL] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Váratlan hiba', code: 'UNEXPECTED_ERROR' },
      },
      { status: 500 }
    );
  }
}
