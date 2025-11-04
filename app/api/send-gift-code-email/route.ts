/**
 * POST /api/send-gift-code-email
 * Send gift code to recipient via email
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { recipientEmail, giftCode, productName, expiresAt, senderName } = body;

    // Validate required fields
    if (!recipientEmail || !giftCode || !productName) {
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők' },
        { status: 400 }
      );
    }

    console.log('[GIFT EMAIL] Sending gift code email:', {
      recipient: recipientEmail,
      gift_code: giftCode,
      product: productName,
    });

    // Format expiration date
    const expirationDate = expiresAt
      ? new Date(expiresAt).toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '30 napon belül';

    // Email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .gift-code-box {
              background: linear-gradient(135deg, #f3e7fa 0%, #fce7f3 100%);
              border: 3px solid #9333ea;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .gift-code {
              font-size: 32px;
              font-weight: bold;
              color: #7c3aed;
              letter-spacing: 3px;
              font-family: 'Courier New', monospace;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .instructions {
              background: white;
              border-left: 4px solid #9333ea;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎁 Ajándék az Eredeti Csakrától!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Spirituális fejlődés ajándékba</p>
          </div>

          <div class="content">
            <p style="font-size: 18px; margin-top: 0;">
              Kedves Barátunk! 💜
            </p>

            <p>
              ${senderName || 'Valaki, aki rád gondol'} ajándékba küldött neked egy különleges spirituális élményt az Eredeti Csakra oldalon!
            </p>

            <p>
              <strong>Ajándék termék:</strong><br>
              ${productName}
            </p>

            <div class="gift-code-box">
              <p style="margin: 0 0 10px 0; color: #7c3aed; font-weight: bold;">Az ajándék kódod:</p>
              <div class="gift-code">${giftCode}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                Lejárat: ${expirationDate}
              </p>
            </div>

            <div style="text-align: center;">
              <a href="https://eredeticsakra.hu/ajandek/${giftCode}" class="cta-button">
                🎁 AJÁNDÉK BEVÁLTÁSA
              </a>
            </div>

            <div class="instructions">
              <h3 style="margin-top: 0; color: #7c3aed;">📝 Beváltási útmutató:</h3>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">
                  <strong>Látogass el a beváltási oldalra:</strong><br>
                  <a href="https://eredeticsakra.hu/ajandek/${giftCode}" style="color: #7c3aed;">eredeticsakra.hu/ajandek/${giftCode}</a>
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Add meg az ajándék kódot:</strong><br>
                  Másold be vagy gépeld be a fenti kódot
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Töltsd ki a kvízt:</strong><br>
                  Válaszolj a 28 kérdésre a csakrád állapotának felmérésére
                </li>
                <li>
                  <strong>Kapd meg a termékeket:</strong><br>
                  Az ajándék termékek azonnal hozzáférhetők lesznek
                </li>
              </ol>
            </div>

            <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              ⏰ <strong>Fontos:</strong> Az ajándék kód ${expirationDate}-ig érvényes, addig be kell váltanod!
            </p>

            <p>
              Ha bármilyen kérdésed van, bátran keress minket!
            </p>

            <p style="margin-bottom: 0;">
              Szeretettel,<br>
              <strong>Az Eredeti Csakra csapata</strong> ✨
            </p>
          </div>

          <div class="footer">
            <p>
              Ezt az emailt azért kaptad, mert valaki ajándékot küldött neked az Eredeti Csakra oldalon.
            </p>
            <p>
              © ${new Date().getFullYear()} Eredeti Csakra. Minden jog fenntartva.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'hello@eredeticsakra.hu',
      to: recipientEmail,
      subject: `🎁 Ajándék az Eredeti Csakrától - ${productName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('[GIFT EMAIL] Resend error:', error);
      return NextResponse.json(
        { error: 'Email küldése sikertelen' },
        { status: 500 }
      );
    }

    console.log('[GIFT EMAIL] Email sent successfully:', {
      email_id: data?.id,
      recipient: recipientEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sikeresen elküldve',
      data: {
        id: data?.id,
      },
    });
  } catch (error) {
    console.error('[GIFT EMAIL] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Váratlan hiba történt' },
      { status: 500 }
    );
  }
}
