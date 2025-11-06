/**
 * Newsletter Email Templates
 * Conversion-optimized campaign templates for chakra wellness program
 *
 * Target: Hungarian women 35+, spirituality-focused
 * Goal: 0.5-1.3% conversion rate (5-13 sales from 1000 emails)
 * Strategy: PAS Formula (Problem → Agitate → Solution) + Emotional triggers + Scarcity
 */

/**
 * Newsletter email template data
 */
export type NewsletterTemplateData = {
  name: string;
  variantId: 'a' | 'b' | 'c';
  resultId?: string; // Optional personalized link
  campaignId: string;
};

/**
 * Subject line options for A/B testing
 */
export const NEWSLETTER_SUBJECT_LINES = {
  problemFocus: 'Miért érzed magad kimerültnek naponta? 🌀',
  curiosity: '{{name}}, csakráid üzennek neked... ✨',
  urgency: '⏰ Csak 48 órád maradt: Csakra Elemzés -87%',
} as const;

/**
 * Pricing configuration for each variant
 */
const PRICING_VARIANTS = {
  a: {
    price: 990,
    originalPrice: 7990,
    discount: 87,
    badge: null,
    positioning: 'Kezdd el most 990 Ft-ért',
    emphasis: 'Mindenki számára elérhető ár - nincs kockázat!',
  },
  b: {
    price: 1990,
    originalPrice: 7990,
    discount: 75,
    badge: '⭐ LEGJOBB ÉRTÉK',
    positioning: 'Fele áron, teljes elemzés',
    emphasis: 'Legtöbben ezt választják - tökéletes ár-érték arány!',
  },
  c: {
    price: 2990,
    originalPrice: 7990,
    discount: 63,
    badge: '👑 PRÉMIUM MINŐSÉG',
    positioning: 'Professzionális, teljes körű értékelés',
    emphasis: 'A legmélyebb betekintés - befektetés az önmagadba!',
  },
} as const;

/**
 * Generate newsletter campaign email with variant-specific pricing
 *
 * @param data - Newsletter template data
 * @returns Email HTML, subject line, and preview text
 */
export function generateNewsletterEmail(data: NewsletterTemplateData): {
  html: string;
  subject: string;
  previewText: string;
} {
  const variant = PRICING_VARIANTS[data.variantId];
  const checkoutUrl = data.resultId
    ? `https://eredeticsakra.hu/checkout/${data.resultId}?variant=${data.variantId}&campaign=${data.campaignId}`
    : `https://eredeticsakra.hu/kviz?variant=${data.variantId}&campaign=${data.campaignId}`;

  // Subject line with personalization
  const subject = NEWSLETTER_SUBJECT_LINES.curiosity.replace('{{name}}', data.name);

  // Preview text (appears after subject in inbox)
  const previewText = 'Fedezd fel, melyik csakrád blokkolt és mi okozza a kimerültségedet...';

  const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Csakra Elemzés - Különleges Ajánlat</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 45px 30px;
      text-align: center;
    }
    .header .emoji {
      font-size: 56px;
      margin-bottom: 15px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.3;
    }
    .content {
      padding: 45px 35px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 25px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section p {
      font-size: 17px;
      line-height: 1.7;
      margin-bottom: 15px;
    }
    .problem-highlight {
      background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%);
      border-left: 4px solid #FC8181;
      padding: 20px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .problem-highlight strong {
      color: #C53030;
      font-size: 18px;
    }
    .solution-box {
      background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 100%);
      border-left: 4px solid #48BB78;
      padding: 25px;
      margin: 30px 0;
      border-radius: 6px;
    }
    .solution-box h3 {
      color: #22543D;
      font-size: 20px;
      margin: 0 0 15px 0;
    }
    .value-stack {
      background-color: #F7FAFC;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .value-stack h3 {
      color: #667eea;
      margin: 0 0 20px 0;
      font-size: 20px;
    }
    .value-stack ul {
      margin: 0;
      padding-left: 25px;
      list-style: none;
    }
    .value-stack li {
      margin-bottom: 12px;
      padding-left: 10px;
      position: relative;
      font-size: 16px;
    }
    .value-stack li::before {
      content: "✓";
      position: absolute;
      left: -20px;
      color: #48BB78;
      font-weight: bold;
      font-size: 18px;
    }
    .pricing-box {
      background: linear-gradient(135deg, #FAF5FF 0%, #E9D8FD 100%);
      border: 3px solid #9F7AEA;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 35px 0;
      position: relative;
    }
    .badge {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #000;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      display: inline-block;
      margin-bottom: 15px;
      box-shadow: 0 4px 10px rgba(255, 165, 0, 0.4);
    }
    .old-price {
      font-size: 24px;
      color: #999;
      text-decoration: line-through;
      margin-bottom: 5px;
    }
    .new-price {
      font-size: 48px;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }
    .discount-percent {
      background-color: #FC8181;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
      margin-top: 10px;
    }
    .positioning {
      font-size: 18px;
      color: #4A5568;
      margin-top: 15px;
      font-weight: 600;
    }
    .emphasis {
      font-size: 15px;
      color: #718096;
      margin-top: 10px;
      font-style: italic;
    }
    .urgency-timer {
      background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%);
      border: 2px dashed #FC8181;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .urgency-timer .clock {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .urgency-timer p {
      margin: 5px 0;
      font-size: 16px;
      color: #C53030;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 10px;
      font-size: 20px;
      font-weight: 700;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
    .testimonial {
      background-color: #FFFAF0;
      border-left: 4px solid #FFD700;
      padding: 25px;
      margin: 30px 0;
      border-radius: 6px;
      font-style: italic;
    }
    .testimonial .quote {
      font-size: 16px;
      color: #4A5568;
      margin-bottom: 15px;
      line-height: 1.6;
    }
    .testimonial .author {
      font-weight: 600;
      color: #2D3748;
      font-style: normal;
      font-size: 15px;
    }
    .ps-section {
      background-color: #FFF9E6;
      border-top: 3px solid #FFD700;
      padding: 25px 30px;
      margin-top: 40px;
      border-radius: 6px;
    }
    .ps-section p {
      margin: 10px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .ps-section strong {
      color: #C53030;
      font-size: 17px;
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
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #ddd, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 26px;
      }
      .new-price {
        font-size: 40px;
      }
      .button {
        padding: 16px 35px;
        font-size: 18px;
      }
      .value-stack, .pricing-box, .problem-highlight, .solution-box {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="emoji">🌀✨</div>
      <h1>Miért Érzed Magad Kimerültnek<br>Minden Nap?</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <p class="greeting">Kedves ${data.name}!</p>

      <!-- PROBLEM Section -->
      <div class="section">
        <p>
          Ha őszinte vagy magadhoz, valószínűleg felismered ezeket a jeleket:
        </p>

        <div class="problem-highlight">
          <p style="margin: 0;">
            🔸 <strong>Állandó kimerültség</strong> - még alvás után is fáradt vagy<br>
            🔸 <strong>Érzelmi hullámvasút</strong> - kiszámíthatatlan hangulatingadozások<br>
            🔸 <strong>Kapcsolati nehézségek</strong> - úgy érzed, senki nem ért meg<br>
            🔸 <strong>Belső nyugtalanság</strong> - képtelen vagy ellazulni, leállni<br>
            🔸 <strong>Önbizalomhiány</strong> - kételkedsz a képességeidben
          </p>
        </div>

        <p>
          Tudod, mi a legnagyobb probléma? <strong>Nem a te hibád.</strong>
        </p>
      </div>

      <!-- AGITATE Section -->
      <div class="section">
        <p>
          A legtöbb nő úgy próbálja megoldani ezt, hogy még többet dolgozik,
          még több felelősséget vállal magára, még keményebben próbál...
        </p>

        <p>
          <strong>De ez csak még jobban kimerít.</strong> Még mélyebbre süllyed
          a kimerültségbe, a frusztrációba, az önmagával való elégedetlenségbe.
        </p>

        <p>
          És közben tudom, hogy <em>vágysz a változásra</em>. Szeretnél végre:
        </p>

        <ul style="line-height: 2; margin: 20px 0;">
          <li>🌸 Energikusan ébredni reggelente</li>
          <li>🌸 Biztonságban érezni magad a kapcsolataidban</li>
          <li>🌸 Megtalálni a belső békédet</li>
          <li>🌸 Magabiztosan hozni döntéseket</li>
          <li>🌸 Szabadon kifejezni magad</li>
        </ul>

        <p>
          <strong>De honnan kezdd?</strong> Mi az első lépés?
        </p>
      </div>

      <!-- SOLUTION Section -->
      <div class="solution-box">
        <h3>✨ A Válasz: Csakráid Harmonizálása</h3>
        <p style="margin: 0; font-size: 16px;">
          A csakráid az energetikai központjaid. Amikor blokkoltak vagy
          kiegyensúlyozatlanok, az pontosan azokat a tüneteket okozza,
          amiket most érzel: kimerültség, frusztráció, önbizalomhiány.
        </p>
        <p style="margin: 15px 0 0 0; font-size: 16px;">
          <strong>Az első lépés:</strong> Megtudni, MELYIK csakrád blokkolt,
          és MIÉRT. Csak így tudsz célzottan gyógyítani.
        </p>
      </div>

      <!-- CTA Button #1 -->
      <div class="button-container">
        <a href="${checkoutUrl}" class="button">
          🔮 Elemzésem Megrendelése Most
        </a>
      </div>

      <!-- Value Stack -->
      <div class="value-stack">
        <h3>💎 Mit kapsz a Személyre Szabott Csakra Elemzésben?</h3>
        <ul>
          <li><strong>Komplett Csakra Térképed</strong> - Mind a 7 csakra részletes értékelése</li>
          <li><strong>Blokkolt Csakráid Azonosítása</strong> - Pontosan megtudod, hol van a probléma</li>
          <li><strong>Kialakulási Okok Feltárása</strong> - Milyen életmintázatok vezettek ide</li>
          <li><strong>Gyógyítási Lépések</strong> - Konkrét gyakorlatok minden csakrához</li>
          <li><strong>AI-Generált, Személyre Szabott</strong> - Kizárólag TE rád vonatkozó tartalom</li>
          <li><strong>20+ Oldalas Professzionális PDF</strong> - Letölthető, kinyomtatható</li>
          <li><strong>Azonnali Hozzáférés</strong> - Nincs várakozás, azonnal megkapod</li>
        </ul>
      </div>

      <!-- Pricing Box (Variant-Specific) -->
      <div class="pricing-box">
        ${variant.badge ? `<div class="badge">${variant.badge}</div>` : ''}

        <div class="old-price">${variant.originalPrice.toLocaleString('hu-HU')} Ft</div>
        <div class="new-price">${variant.price.toLocaleString('hu-HU')} Ft</div>
        <div class="discount-percent">-${variant.discount}% KEDVEZMÉNY</div>

        <p class="positioning">${variant.positioning}</p>
        <p class="emphasis">${variant.emphasis}</p>
      </div>

      <!-- Urgency Timer -->
      <div class="urgency-timer">
        <div class="clock">⏰</div>
        <p><strong>Ez az ajánlat 48 óra múlva lejár!</strong></p>
        <p style="font-size: 14px; color: #718096; font-weight: normal;">
          Csak a hírlevél feliratkozók számára - korlátozott ideig
        </p>
      </div>

      <!-- CTA Button #2 -->
      <div class="button-container">
        <a href="${checkoutUrl}" class="button">
          🔮 Igen, Megrendelem Most!
        </a>
      </div>

      <!-- Social Proof Testimonial -->
      <div class="testimonial">
        <div class="quote">
          "Évek óta állandóan fáradt voltam, és azt hittem, ez már így fog maradni.
          A csakra elemzés megmutatta, hogy a gyökércsakrám volt blokkolt - azért
          éreztem magam bizonytalannak és energiátlannak. A gyakorlatok után
          <strong>3 héten belül éreztem a változást</strong>. Végre van energiám
          megint, és magabiztosan állok az életemben! Köszönöm! 💜"
        </div>
        <div class="author">— Éva, 42 éves, Budapest</div>
      </div>

      <div class="divider"></div>

      <!-- Closing -->
      <p>
        ${data.name}, nem kell tovább így élned. A változás egy döntéssel kezdődik.
      </p>

      <p>
        <strong>Most megteheted azt az első lépést</strong>, amire olyan régóta vágysz.
        Felfedezni, mi okozza a kimerültségedet, és hogyan gyógyíthatod meg magad.
      </p>

      <p style="margin-top: 30px;">
        Sok szeretettel és támogatással,<br>
        <strong>Eredeti Csakra csapata</strong> 💜
      </p>

      <!-- P.S. Section (High-Readership Area) -->
      <div class="ps-section">
        <p>
          <strong>P.S.</strong> Ne feledd: <strong>Ez az ajánlat csak 48 óráig érvényes.</strong>
          Utána visszaáll a normál ár (7,990 Ft). Ha most nem cselekedel,
          valószínűleg egy év múlva is ugyanott leszel. Ugyanazzal a kimerültséggel.
          Ugyanazzal a frusztrációval.
        </p>
        <p style="margin-top: 15px;">
          <strong>De nem muszáj.</strong> A változás most kezdődhet. Egy kattintással. ✨
        </p>
        <p style="text-align: center; margin-top: 20px;">
          <a href="${checkoutUrl}" style="color: #667eea; font-weight: bold; font-size: 17px;">
            👉 Kattints ide az elemzésedért
          </a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eredeti Csakra</strong></p>
      <p>
        Kérdésed van? Írj nekünk:
        <a href="mailto:info@eredeticsakra.hu">info@eredeticsakra.hu</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Ez az email azért érkezett, mert feliratkoztál a hírlevelünkre.
        <br>
        Ha nem szeretnél többEmailt kapni,
        <a href="https://eredeticsakra.hu/leiratkozas?email={{email}}&campaign=${data.campaignId}" style="color: #999;">
          itt leiratkozhatsz
        </a>.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    html,
    subject,
    previewText,
  };
}

/**
 * Generate plain text version of newsletter email
 * (Required for email clients that don't support HTML)
 *
 * @param data - Newsletter template data
 * @returns Plain text string
 */
export function generateNewsletterEmailText(data: NewsletterTemplateData): string {
  const variant = PRICING_VARIANTS[data.variantId];
  const checkoutUrl = data.resultId
    ? `https://eredeticsakra.hu/checkout/${data.resultId}?variant=${data.variantId}&campaign=${data.campaignId}`
    : `https://eredeticsakra.hu/kviz?variant=${data.variantId}&campaign=${data.campaignId}`;

  return `
Miért Érzed Magad Kimerültnek Minden Nap? 🌀

Kedves ${data.name}!

Ha őszinte vagy magadhoz, valószínűleg felismered ezeket a jeleket:

🔸 Állandó kimerültség - még alvás után is fáradt vagy
🔸 Érzelmi hullámvasút - kiszámíthatatlan hangulatingadozások
🔸 Kapcsolati nehézségek - úgy érzed, senki nem ért meg
🔸 Belső nyugtalanság - képtelen vagy ellazulni, leállni
🔸 Önbizalomhiány - kételkedsz a képességeidben

Tudod, mi a legnagyobb probléma? Nem a te hibád.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A legtöbb nő úgy próbálja megoldani ezt, hogy még többet dolgozik, még több felelősséget vállal magára, még keményebben próbál...

De ez csak még jobban kimerít.

És közben tudom, hogy vágysz a változásra. Szeretnél végre:

🌸 Energikusan ébredni reggelente
🌸 Biztonságban érezni magad a kapcsolataidban
🌸 Megtalálni a belső békédet
🌸 Magabiztosan hozni döntéseket
🌸 Szabadon kifejezni magad

De honnan kezdd? Mi az első lépés?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ A VÁLASZ: CSAKRÁID HARMONIZÁLÁSA

A csakráid az energetikai központjaid. Amikor blokkoltak vagy kiegyensúlyozatlanok, az pontosan azokat a tüneteket okozza, amiket most érzel.

Az első lépés: Megtudni, MELYIK csakrád blokkolt, és MIÉRT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 MIT KAPSZ A SZEMÉLYRE SZABOTT CSAKRA ELEMZÉSBEN?

✓ Komplett Csakra Térképed - Mind a 7 csakra részletes értékelése
✓ Blokkolt Csakráid Azonosítása - Pontosan megtudod, hol van a probléma
✓ Kialakulási Okok Feltárása - Milyen életmintázatok vezettek ide
✓ Gyógyítási Lépések - Konkrét gyakorlatok minden csakrához
✓ AI-Generált, Személyre Szabott - Kizárólag TE rád vonatkozó tartalom
✓ 20+ Oldalas Professzionális PDF - Letölthető, kinyomtatható
✓ Azonnali Hozzáférés - Nincs várakozás, azonnal megkapod

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${variant.badge ? `${variant.badge}\n` : ''}
NORMÁL ÁR: ${variant.originalPrice.toLocaleString('hu-HU')} Ft

MOST CSAK: ${variant.price.toLocaleString('hu-HU')} Ft
-${variant.discount}% KEDVEZMÉNY

${variant.positioning}
${variant.emphasis}

⏰ Ez az ajánlat 48 óra múlva lejár!

🔮 ELEMZÉSEM MEGRENDELÉSE MOST:
${checkoutUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AMIT MÁSOK MONDANAK:

"Évek óta állandóan fáradt voltam, és azt hittem, ez már így fog maradni. A csakra elemzés megmutatta, hogy a gyökércsakrám volt blokkolt - azért éreztem magam bizonytalannak és energiátlannak. A gyakorlatok után 3 héten belül éreztem a változást. Végre van energiám megint! Köszönöm! 💜"
— Éva, 42 éves, Budapest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.name}, nem kell tovább így élned. A változás egy döntéssel kezdődik.

Most megteheted azt az első lépést, amire olyan régóta vágysz.

👉 Kattints ide az elemzésedért:
${checkoutUrl}

Sok szeretettel és támogatással,
Eredeti Csakra csapata 💜

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

P.S. Ne feledd: Ez az ajánlat csak 48 óráig érvényes. Utána visszaáll a normál ár (7,990 Ft). Ha most nem cselekedel, valószínűleg egy év múlva is ugyanott leszel. Ugyanazzal a kimerültséggel. Ugyanazzal a frusztrációval.

De nem muszáj. A változás most kezdődhet. Egy kattintással. ✨

${checkoutUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Eredeti Csakra
Kérdésed van? info@eredeticsakra.hu

Ez az email azért érkezett, mert feliratkoztál a hírlevelünkre.
Leiratkozás: https://eredeticsakra.hu/leiratkozas?email={{email}}&campaign=${data.campaignId}
  `.trim();
}

/**
 * Get all subject line variants for A/B testing
 *
 * @param name - Recipient's name for personalization
 * @returns Array of subject line options
 */
export function getAllSubjectLineVariants(name: string): string[] {
  return [
    NEWSLETTER_SUBJECT_LINES.problemFocus,
    NEWSLETTER_SUBJECT_LINES.curiosity.replace('{{name}}', name),
    NEWSLETTER_SUBJECT_LINES.urgency,
  ];
}

/**
 * Preview email variants (useful for testing)
 *
 * @param name - Test recipient name
 * @param campaignId - Campaign identifier
 * @returns Object with all three variant previews
 */
export function generateAllVariantPreviews(name: string, campaignId: string) {
  const variants: ('a' | 'b' | 'c')[] = ['a', 'b', 'c'];

  return {
    variantA: generateNewsletterEmail({
      name,
      variantId: 'a',
      campaignId,
    }),
    variantB: generateNewsletterEmail({
      name,
      variantId: 'b',
      campaignId,
    }),
    variantC: generateNewsletterEmail({
      name,
      variantId: 'c',
      campaignId,
    }),
    subjectLines: getAllSubjectLineVariants(name),
  };
}
