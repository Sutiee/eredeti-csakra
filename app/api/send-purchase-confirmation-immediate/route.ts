/**
 * Send Immediate Purchase Confirmation Email API Route
 * POST /api/send-purchase-confirmation-immediate
 *
 * Sends immediate purchase confirmation email (without download link)
 * Used by Stripe webhook to notify customer their payment was successful
 * and their product is being prepared.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";

// Resend client with fallback API key handling
if (!process.env.RESEND_API_KEY) {
  console.warn("[SEND_IMMEDIATE_CONFIRMATION] Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Generate immediate purchase confirmation email HTML
 */
function generateImmediatePurchaseConfirmationEmail({
  name,
  productName,
  productId,
}: {
  name: string;
  productName: string;
  productId: string;
}): string {
  const isWorkbook = productId === 'workbook_30day';
  const isAIPDF = productId === 'ai_analysis_pdf';

  const processingTime = isWorkbook
    ? '3-5 perc'
    : isAIPDF
    ? '1-2 perc'
    : '2-3 perc';

  const productDescription = isWorkbook
    ? 'A 30 Napos Csakra Munkafüzeted éppen készül, amely személyre szabott feladatokat és gyakorlatokat tartalmaz minden napra.'
    : isAIPDF
    ? 'A Személyre Szabott Csakra Elemzésed éppen készül, amely részletes betekintést nyújt minden csakrádba.'
    : 'A termékeid éppen készülnek, és hamarosan elérhetővé válnak.';

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vásárlás Megerősítés - Eredeti Csakra</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background: linear-gradient(135deg, #f5f3ff 0%, #fce7f3 100%); color: #1f2937;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f3ff 0%, #fce7f3 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✅ Sikeres Vásárlás!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                Köszönjük a bizalmadat, ${name}!
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Success Message -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #166534; font-size: 16px; line-height: 1.6;">
                  <strong>🎉 Fizetésed sikeresen feldolgozva!</strong><br>
                  A rendszerünk most készíti elő a termékedet.
                </p>
              </div>

              <!-- Product Info -->
              <div style="background: #faf5ff; padding: 25px; border-radius: 12px; border: 2px solid #e9d5ff; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #7c3aed; font-size: 20px;">
                  📦 Megvásárolt Termék
                </h2>
                <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                  ${productName}
                </p>
              </div>

              <!-- Processing Status -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px; color: #92400e; font-size: 18px; display: flex; align-items: center;">
                  ⏳ Előkészítés Folyamatban
                </h3>
                <p style="margin: 0 0 15px; color: #78350f; font-size: 15px; line-height: 1.6;">
                  ${productDescription}
                </p>
                <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.6;">
                  <strong>Becsült készítési idő:</strong> ${processingTime}
                </p>
              </div>

              <!-- What Happens Next -->
              <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">
                  📧 Mi Történik Ezután?
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">
                    <strong>Termék elkészítése:</strong> A személyre szabott tartalmat az AI rendszerünk most generálja.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>Email értesítés:</strong> Amint elkészült, küldünk egy új emailt a letöltési linkkel.
                  </li>
                  <li>
                    <strong>Azonnali hozzáférés:</strong> Ellenőrizd az email fiókod (spam mappát is!) ${processingTime} múlva.
                  </li>
                </ol>
              </div>

              <!-- CTA Box -->
              <div style="background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%); padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 20px; color: #581c87; font-size: 16px; line-height: 1.6;">
                  <strong>💡 Tipp:</strong> Add hozzá az <strong>info@eredeticsakra.hu</strong> címet a kapcsolataidhoz,<br>
                  hogy biztosan megkapd a letöltési linket!
                </p>
                <a href="https://eredeticsakra.hu" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);">
                  Vissza az Eredeticsakra.hu-ra
                </a>
              </div>

              <!-- Support -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <strong>❓ Kérdésed van?</strong><br>
                  Ha bármilyen problémád adódik, vagy nem érkezik meg a letöltési link, írj nekünk bizalommal:
                </p>
                <p style="margin: 0; color: #9333ea; font-size: 15px; font-weight: 600;">
                  <a href="mailto:info@eredeticsakra.hu" style="color: #9333ea; text-decoration: none;">
                    info@eredeticsakra.hu
                  </a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafaf9; padding: 30px; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0 0 12px; color: #78716c; font-size: 14px;">
                Köszönjük, hogy az <strong>Eredeti Csakra</strong> családjához tartozol! ✨
              </p>
              <p style="margin: 0 0 15px; color: #a8a29e; font-size: 13px;">
                © ${new Date().getFullYear()} Eredeti Csakra. Minden jog fenntartva.
              </p>
              <div style="margin: 15px 0 0;">
                <a href="https://eredeticsakra.hu" style="color: #9333ea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  🏠 Főoldal
                </a>
                <a href="https://eredeticsakra.hu/kviz" style="color: #9333ea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  🧘‍♀️ Kvíz
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version
 */
function generateImmediatePurchaseConfirmationText({
  name,
  productName,
  productId,
}: {
  name: string;
  productName: string;
  productId: string;
}): string {
  const isWorkbook = productId === 'workbook_30day';
  const processingTime = isWorkbook ? '3-5 perc' : '1-2 perc';

  return `
✅ SIKERES VÁSÁRLÁS - Eredeti Csakra

Kedves ${name}!

Köszönjük a bizalmadat! Fizetésed sikeresen feldolgozva.

📦 MEGVÁSÁROLT TERMÉK:
${productName}

⏳ ELŐKÉSZÍTÉS FOLYAMATBAN:
A személyre szabott tartalmat az AI rendszerünk most generálja.

Becsült készítési idő: ${processingTime}

📧 MI TÖRTÉNIK EZUTÁN?

1. Termék elkészítése: A személyre szabott tartalmat most készítjük.
2. Email értesítés: Amint elkészült, küldünk egy új emailt a letöltési linkkel.
3. Azonnali hozzáférés: Ellenőrizd az email fiókod (spam mappát is!) ${processingTime} múlva.

💡 TIPP:
Add hozzá az info@eredeticsakra.hu címet a kapcsolataidhoz,
hogy biztosan megkapd a letöltési linket!

❓ KÉRDÉSED VAN?
Ha bármilyen problémád adódik, írj nekünk: info@eredeticsakra.hu

Köszönjük, hogy az Eredeti Csakra családjához tartozol! ✨

---
© ${new Date().getFullYear()} Eredeti Csakra
Weboldal: https://eredeticsakra.hu
  `.trim();
}

/**
 * POST /api/send-purchase-confirmation-immediate
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, resultId, productName, productId } = body;

    // Validate inputs
    if (!name || !email || !resultId || !productName || !productId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Missing required fields",
            code: "MISSING_FIELDS",
          },
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Invalid email address", code: "INVALID_EMAIL" },
        },
        { status: 400 }
      );
    }

    logger.info("Sending immediate purchase confirmation email", {
      name,
      email,
      resultId,
      productId,
    });

    // Generate email HTML and text
    const emailHtml = generateImmediatePurchaseConfirmationEmail({
      name,
      productName,
      productId,
    });

    const emailText = generateImmediatePurchaseConfirmationText({
      name,
      productName,
      productId,
    });

    // Send email with Resend (with fallback sender for testing)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({
      from: `Eredeti Csakra <${fromEmail}>`,
      to: [email],
      subject: "✅ Sikeres Vásárlás - Termékeid Hamarosan Készen Állnak!",
      html: emailHtml,
      text: emailText,
      tags: [
        { name: "type", value: "immediate-purchase-confirmation" },
        { name: "result_id", value: resultId },
        { name: "product_id", value: productId },
      ],
    });

    if (error) {
      logger.error("Failed to send immediate confirmation email", {
        error,
        email,
        resultId,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Failed to send email",
            code: "EMAIL_SEND_FAILED",
          },
        },
        { status: 500 }
      );
    }

    logger.info("Immediate confirmation email sent successfully", {
      emailId: data?.id,
      email,
      resultId,
    });

    return NextResponse.json({
      data: {
        success: true,
        emailId: data?.id,
      },
      error: null,
    });
  } catch (error) {
    logger.error("Failed to send immediate confirmation email", { error });

    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
