/**
 * Email Templates
 * HTML email templates for purchase confirmation and report delivery
 */

/**
 * Purchase confirmation email template data
 */
export type PurchaseEmailData = {
  name: string;
  downloadUrl: string;
  resultId: string;
  productName?: string;
  productType?: 'ai_analysis_pdf' | 'workbook_30day';
};

/**
 * Gift buyer confirmation email template data
 */
export type GiftBuyerEmailData = {
  buyerName: string;
  giftCode: string;
  expiresAt: string; // ISO date string
  productName: string;
  recipientEmail?: string;
};

/**
 * Generate purchase confirmation email HTML
 *
 * @param data - Email template data
 * @returns HTML string
 */
export function generatePurchaseConfirmationEmail(
  data: PurchaseEmailData
): string {
  // Determine product-specific content
  const isWorkbook = data.productType === 'workbook_30day';
  const productName = data.productName || 'Személyre Szabott Csakra Elsősegély Csomag';
  const emoji = isWorkbook ? '📖' : '✨';
  const buttonText = isWorkbook ? 'Munkafüzet Letöltése (PDF)' : 'Elemzés Letöltése (PDF)';

  const features = isWorkbook ? `
    <li><strong>Személyre Szabott 30 Napos Program</strong> - Blokkolt csakráidra több napot szánva</li>
    <li><strong>Napi Gyakorlatok</strong> - Részletes lépésenkénti útmutatók minden napra</li>
    <li><strong>Journaling Kérdések</strong> - 3-5 önreflexiós kérdés naponta</li>
    <li><strong>Affirmációk és Meditációk</strong> - Csakra-specifikus gyakorlatok</li>
    <li><strong>Heti Értékelő Lapok</strong> - Haladásod nyomon követése</li>
  ` : `
    <li><strong>Átfogó Összefoglaló</strong> - Általános energetikai mintázatod és fő prioritások</li>
    <li><strong>7 Részletes Csakra Elemzés</strong> - Minden csakrád mélyreható vizsgálata (blokkolt/egészséges)</li>
    <li><strong>Kialakulási Okok</strong> - Milyen életmintázatok vezethettek ehhez az állapothoz</li>
    <li><strong>Személyre Szabott Tartalom</strong> - Kizárólag a TE válaszaid alapján, AI-generált</li>
    <li><strong>20+ Oldal PDF</strong> - Letölthető, kinyomtatható elemzés</li>
  `;

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Köszönjük a vásárlásod!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header .emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    .features {
      background-color: #f8f9ff;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .features h3 {
      color: #667eea;
      margin-top: 0;
      font-size: 18px;
      margin-bottom: 15px;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .heart {
      color: #e25555;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #ddd, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .button {
        padding: 14px 30px;
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="emoji">${emoji}</div>
      <h1>Köszönjük a vásárlásod!</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Kedves ${data.name}!</p>

      <p>
        Sikeresen megvásároltad a <strong>${productName}</strong>.
        Örömmel értesítünk, hogy a ${isWorkbook ? 'munkafüzeted' : 'részletes elemzésed'} elkészült és már letölthető!
      </p>

      <div class="button-container">
        <a href="${data.downloadUrl}" class="button">
          ${buttonText}
        </a>
      </div>

      <div class="features">
        <h3>A PDF tartalma:</h3>
        <ul>
          ${features}
        </ul>
      </div>

      <div class="divider"></div>

      <p>
        Az elemzésed egyedi és személyre szabott, kizárólag a Te válaszaid alapján készült.
        Javasoljuk, hogy nyomtasd ki vagy mentsd el, hogy mindig kéznél legyen.
      </p>

      <p>
        Ha bármilyen kérdésed van, vagy segítségre van szükséged, ne habozz kapcsolatba lépni velünk!
      </p>

      <p style="margin-top: 30px;">
        Sok szeretettel,<br>
        <strong>Eredeti Csakra csapata</strong> <span class="heart">💜</span>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eredeti Csakra</strong></p>
      <p>
        Kérdésed van? Írj nekünk:
        <a href="mailto:hello@eredeticsakra.hu">hello@eredeticsakra.hu</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Ez az email automatikusan lett küldve. A PDF letöltési link 30 napig érvényes.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of purchase confirmation email
 * (Required for some email clients)
 *
 * @param data - Email template data
 * @returns Plain text string
 */
export function generatePurchaseConfirmationEmailText(
  data: PurchaseEmailData
): string {
  const isWorkbook = data.productType === 'workbook_30day';
  const productName = data.productName || 'Személyre Szabott Csakra Elsősegély Csomag';

  const features = isWorkbook
    ? `- Személyre Szabott 30 Napos Program - Blokkolt csakráidra több napot szánva
- Napi Gyakorlatok - Részletes lépésenkénti útmutatók minden napra
- Journaling Kérdések - 3-5 önreflexiós kérdés naponta
- Affirmációk és Meditációk - Csakra-specifikus gyakorlatok
- Heti Értékelő Lapok - Haladásod nyomon követése`
    : `- Átfogó Összefoglaló - Általános energetikai mintázatod és fő prioritások
- 7 Részletes Csakra Elemzés - Minden csakrád mélyreható vizsgálata (blokkolt/egészséges)
- Kialakulási Okok - Milyen életmintázatok vezethettek ehhez az állapothoz
- Személyre Szabott Tartalom - Kizárólag a TE válaszaid alapján, AI-generált
- 20+ Oldal PDF - Letölthető, kinyomtatható elemzés`;

  return `
Köszönjük a vásárlásod!

Kedves ${data.name}!

Sikeresen megvásároltad a ${productName}.

A ${isWorkbook ? 'munkafüzeted' : 'részletes elemzésed'} elkészült és letölthető az alábbi linken:
${data.downloadUrl}

A PDF tartalma:
${features}

Az ${isWorkbook ? 'munkafüzeted' : 'elemzésed'} egyedi és személyre szabott, kizárólag a Te válaszaid alapján készült.

Ha bármilyen kérdésed van, írj nekünk: hello@eredeticsakra.hu

Sok szeretettel,
Eredeti Csakra csapata 💜

---
Eredeti Csakra
Email: hello@eredeticsakra.hu

Ez az email automatikusan lett küldve. A PDF letöltési link 30 napig érvényes.
  `.trim();
}

/**
 * Generate gift buyer confirmation email HTML
 *
 * @param data - Gift email template data
 * @returns HTML string
 */
export function generateGiftBuyerEmail(data: GiftBuyerEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ajándékod megerősítése</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9f9f9; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .header .emoji { font-size: 48px; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .content p { line-height: 1.6; margin-bottom: 15px; font-size: 16px; }
    .greeting { font-size: 18px; font-weight: 600; color: #FFA500; margin-bottom: 20px; }
    .gift-code-box { background: linear-gradient(135deg, #FFF9E6 0%, #FFE8CC 100%); border: 2px dashed #FFA500; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; }
    .gift-code { font-size: 32px; font-weight: bold; color: #FF8C00; letter-spacing: 3px; margin: 10px 0; }
    .expiry { font-size: 14px; color: #666; margin-top: 10px; }
    .footer { background-color: #f5f5f5; padding: 30px; text-align: center; font-size: 14px; color: #666; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎁✨</div>
      <h1>Ajándékod Elkészült!</h1>
    </div>

    <div class="content">
      <p class="greeting">Kedves ${data.buyerName}!</p>

      <p>
        Köszönjük, hogy <strong>${data.productName}</strong> termékünket ajándékba vásároltad!
        Az ajándékkód sikeresen létrejött.
      </p>

      <div class="gift-code-box">
        <p style="margin: 0; font-size: 16px; color: #666;">Az ajándékkódod:</p>
        <div class="gift-code">${data.giftCode}</div>
        <p class="expiry">Érvényes: ${expiryDate}-ig (30 nap)</p>
      </div>

      ${data.recipientEmail ? `
      <p>
        <strong>Címzett email:</strong> ${data.recipientEmail}<br>
        Hamarosan küldjük neki az értesítést az ajándékról!
      </p>
      ` : `
      <p>
        <strong>Fontos:</strong> Kérlek add át ezt a kódot az ajándékozottnak!
        A kód beváltásához az ajándékozott is ki kell töltse a kvízt az eredeticsakra.hu oldalon.
      </p>
      `}

      <p>
        Az ajándékozottnak ezekkel a lépésekkel kell beváltania az ajándékot:
      </p>
      <ol>
        <li>Látogasson el az <strong>eredeticsakra.hu</strong> oldalra</li>
        <li>Töltse ki a csakra kvízt</li>
        <li>Az eredmény oldal után add meg neki az ajándékkódot</li>
        <li>Az ajándék automatikusan aktiválódik!</li>
      </ol>

      <p style="margin-top: 30px;">
        Sok szeretettel,<br>
        <strong>Eredeti Csakra csapata</strong> 💜
      </p>
    </div>

    <div class="footer">
      <p><strong>Eredeti Csakra</strong></p>
      <p>Kérdésed van? <a href="mailto:hello@eredeticsakra.hu">hello@eredeticsakra.hu</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of gift buyer email
 */
export function generateGiftBuyerEmailText(data: GiftBuyerEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('hu-HU');

  return `
Ajándékod Elkészült! 🎁

Kedves ${data.buyerName}!

Köszönjük, hogy ${data.productName} termékünket ajándékba vásároltad!

Ajándékkód: ${data.giftCode}
Érvényes: ${expiryDate}-ig (30 nap)

${data.recipientEmail
  ? `Címzett: ${data.recipientEmail}\nHamarosan küldjük neki az értesítést!`
  : `Fontos: Add át ezt a kódot az ajándékozottnak!`
}

Beváltási lépések:
1. Látogasson el az eredeticsakra.hu oldalra
2. Töltse ki a csakra kvízt
3. Add meg neki az ajándékkódot
4. Az ajándék automatikusan aktiválódik!

Sok szeretettel,
Eredeti Csakra csapata 💜

---
Kérdésed van? hello@eredeticsakra.hu
  `.trim();
}
