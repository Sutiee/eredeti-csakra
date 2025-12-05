/**
 * Send Light Purchase Continuation Email API Route
 * POST /api/send-light-purchase-continuation
 *
 * Sends email to user after purchasing full analysis from light quiz result,
 * instructing them to complete the full 28-question quiz to receive their personalized report.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Resend client with fallback API key handling
if (!process.env.RESEND_API_KEY) {
  console.warn("[SEND_LIGHT_CONTINUATION] Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Generate light purchase continuation email HTML
 */
function generateLightPurchaseContinuationEmail({
  name,
  lightResultId,
}: {
  name: string;
  lightResultId: string;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
  const quizUrl = `${siteUrl}/kviz?from=purchase&light_id=${lightResultId}`;

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Folytasd a Csakra Elemzésedet! - Eredeti Csakra</title>
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
                Folytasd a Csakra Elemzésedet!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                Csak egy lépés van hatra a teljes elemzesedhez
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #7c3aed; font-size: 20px; font-weight: 600;">
                Kedves ${name}!
              </p>

              <!-- Success Message -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #166534; font-size: 16px; line-height: 1.6;">
                  <strong>Koszonjuk a vasarlasodat!</strong><br>
                  Sikeresen megvasaroltad a Szemelyre Szabott Csakra Elemzes csomagot.
                </p>
              </div>

              <!-- Explanation -->
              <div style="background: #faf5ff; padding: 25px; border-radius: 12px; border: 2px solid #e9d5ff; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #7c3aed; font-size: 18px;">
                  Mi a kovetkezo lepes?
                </h2>
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.7;">
                  A reszletes, szemelyre szabott csakra elemzesedhez szuksegunk van arra, hogy kitoltsd a <strong>teljes 28 kerdeses kvizunket</strong>.
                  Ez a kviz megmutatja, hogy pontosan melyik csakraid mukodnek egeszseges es melyek blokkoltak.
                </p>
              </div>

              <!-- Benefits Box -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px; color: #92400e; font-size: 18px;">
                  Mit kapsz a teljes elemzessel?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">
                    <strong>7 reszletes csakra elemzes</strong> - Minden csakrad melyrehato vizsgalata
                  </li>
                  <li style="margin-bottom: 8px;">
                    <strong>Szemelyre szabott javaslatok</strong> - AI altal generalt utmutatasok
                  </li>
                  <li style="margin-bottom: 8px;">
                    <strong>Gyakorlati tanacsok</strong> - Hogyan egyensulyozd ki a csakraid
                  </li>
                  <li>
                    <strong>Letoltheto PDF</strong> - 20+ oldalas reszletes jelentes
                  </li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${quizUrl}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);">
                  Kviz Folyttatasa
                </a>
              </div>

              <!-- Time Info -->
              <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">
                  <strong>Idotartam:</strong> Mindossze 5-10 perc<br>
                  A kviz kitoltese utan az elemzesed automatikusan elkeszul es emailben kuldjuk el neked.
                </p>
              </div>

              <!-- Support -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <strong>Kerdesed van?</strong><br>
                  Ha barmilyen problemad adodik, irj nekunk bizalommal:
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
                Koszonjuk, hogy az <strong>Eredeti Csakra</strong> csaladjához tartozol!
              </p>
              <p style="margin: 0 0 15px; color: #a8a29e; font-size: 13px;">
                © ${new Date().getFullYear()} Eredeti Csakra. Minden jog fenntartva.
              </p>
              <div style="margin: 15px 0 0;">
                <a href="https://eredeticsakra.hu" style="color: #9333ea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  Fooldal
                </a>
                <a href="${quizUrl}" style="color: #9333ea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  Kviz
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
function generateLightPurchaseContinuationText({
  name,
  lightResultId,
}: {
  name: string;
  lightResultId: string;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu';
  const quizUrl = `${siteUrl}/kviz?from=purchase&light_id=${lightResultId}`;

  return `
FOLYTASD A CSAKRA ELEMZESEDET - Eredeti Csakra

Kedves ${name}!

Koszonjuk a vasarlasodat! Sikeresen megvasaroltad a Szemelyre Szabott Csakra Elemzes csomagot.

MI A KOVETKEZO LEPES?

A reszletes, szemelyre szabott csakra elemzesedhez szuksegunk van arra, hogy kitoltsd a teljes 28 kerdeses kvizunket.
Ez a kviz megmutatja, hogy pontosan melyik csakraid mukodnek egeszseges es melyek blokkoltak.

MIT KAPSZ A TELJES ELEMZESSEL?

- 7 reszletes csakra elemzes - Minden csakrad melyrehato vizsgalata
- Szemelyre szabott javaslatok - AI altal generalt utmutatasok
- Gyakorlati tanacsok - Hogyan egyensulyozd ki a csakraid
- Letoltheto PDF - 20+ oldalas reszletes jelentes

KVIZ FOLYTTATASA:
${quizUrl}

Idotartam: Mindossze 5-10 perc
A kviz kitoltese utan az elemzesed automatikusan elkeszul es emailben kuldjuk el neked.

KERDESED VAN?
Ha barmilyen problemad adodik, irj nekunk: info@eredeticsakra.hu

Koszonjuk, hogy az Eredeti Csakra csaladjához tartozol!

---
© ${new Date().getFullYear()} Eredeti Csakra
Weboldal: https://eredeticsakra.hu
  `.trim();
}

/**
 * POST /api/send-light-purchase-continuation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, lightResultId } = body;

    // Validate inputs
    if (!name || !email || !lightResultId) {
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

    // UUID validation for lightResultId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lightResultId)) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Invalid light result ID format", code: "INVALID_LIGHT_RESULT_ID" },
        },
        { status: 400 }
      );
    }

    console.log("[SEND_LIGHT_CONTINUATION] Sending email:", {
      name,
      email,
      lightResultId,
    });

    // Generate email HTML and text
    const emailHtml = generateLightPurchaseContinuationEmail({
      name,
      lightResultId,
    });

    const emailText = generateLightPurchaseContinuationText({
      name,
      lightResultId,
    });

    // Send email with Resend (with fallback sender for testing)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({
      from: `Eredeti Csakra <${fromEmail}>`,
      to: [email],
      subject: "Folytasd a Csakra Elemzésedet!",
      html: emailHtml,
      text: emailText,
      tags: [
        { name: "type", value: "light-purchase-continuation" },
        { name: "light_result_id", value: lightResultId },
      ],
    });

    if (error) {
      console.error("[SEND_LIGHT_CONTINUATION] Failed to send email:", {
        error,
        email,
        lightResultId,
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

    console.log("[SEND_LIGHT_CONTINUATION] Email sent successfully:", {
      emailId: data?.id,
      email,
      lightResultId,
    });

    return NextResponse.json({
      data: {
        success: true,
        emailId: data?.id,
      },
      error: null,
    });
  } catch (error) {
    console.error("[SEND_LIGHT_CONTINUATION] Error:", error);

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
