/**
 * Stripe Product Definitions
 * Eredeti Csakra - Product Metadata
 *
 * SETUP INSTRUCTIONS:
 * 1. Create products in Stripe Dashboard (see docs/STRIPE_PRODUCT_SETUP.md)
 * 2. Replace STRIPE_PRODUCT_IDS placeholder values with actual Product IDs from Stripe
 * 3. Update STRIPE_PRICE_IDS with actual Price IDs from Stripe
 */

export type ProductId =
  | 'detailed_pdf'
  | 'meditations'
  | 'bundle'
  | 'ebook';

export type ProductMetadata = {
  id: ProductId;
  stripeProductId: string; // Actual Stripe Product ID (prod_xxx...)
  stripePriceId: string;   // Actual Stripe Price ID (price_xxx...)
  name: string;
  description: string;
  price: number; // In HUF
  currency: string;
  metadata: {
    product_type: string;
    includes_meditation?: boolean;
    includes_pdf?: boolean;
    pdf_template?: string;
    meditation_count?: number;
    chakra_specific?: boolean;
    access_duration_days?: number;
    downloadable?: boolean;
  };
};

/**
 * IMPORTANT: Replace these with actual Stripe Product IDs
 * Get these from: Stripe Dashboard → Products → [Product] → Copy Product ID
 */
const STRIPE_PRODUCT_IDS = {
  DETAILED_PDF: process.env.STRIPE_PRODUCT_ID_DETAILED_PDF || 'prod_REPLACE_ME',
  MEDITATIONS: process.env.STRIPE_PRODUCT_ID_MEDITATIONS || 'prod_REPLACE_ME',
  BUNDLE: process.env.STRIPE_PRODUCT_ID_BUNDLE || 'prod_REPLACE_ME',
  EBOOK: process.env.STRIPE_PRODUCT_ID_EBOOK || 'prod_REPLACE_ME',
} as const;

/**
 * IMPORTANT: Replace these with actual Stripe Price IDs
 * Get these from: Stripe Dashboard → Products → [Product] → Pricing → Copy Price ID
 */
const STRIPE_PRICE_IDS = {
  DETAILED_PDF: process.env.STRIPE_PRICE_ID_DETAILED_PDF || 'price_REPLACE_ME',
  MEDITATIONS: process.env.STRIPE_PRICE_ID_MEDITATIONS || 'price_REPLACE_ME',
  BUNDLE: process.env.STRIPE_PRICE_ID_BUNDLE || 'price_REPLACE_ME',
  EBOOK: process.env.STRIPE_PRICE_ID_EBOOK || 'price_REPLACE_ME',
} as const;

/**
 * Product catalog - all available products
 */
export const PRODUCTS: Record<ProductId, ProductMetadata> = {
  detailed_pdf: {
    id: 'detailed_pdf',
    stripeProductId: STRIPE_PRODUCT_IDS.DETAILED_PDF,
    stripePriceId: STRIPE_PRICE_IDS.DETAILED_PDF,
    name: 'Részletes Csakra Elemzés PDF',
    description: 'Személyre szabott, 15+ oldalas PDF elemzés a 7 csakra részletes diagnosztikájával, gyakorlatokkal és első segély tervvel.',
    price: 4990,
    currency: 'HUF',
    metadata: {
      product_type: 'detailed_pdf',
      includes_meditation: false,
      pdf_template: 'detailed_analysis',
      chakra_specific: false,
    },
  },
  meditations: {
    id: 'meditations',
    stripeProductId: STRIPE_PRODUCT_IDS.MEDITATIONS,
    stripePriceId: STRIPE_PRICE_IDS.MEDITATIONS,
    name: '7 Meditációs Audiófájl Csomag',
    description: 'Minden csakrához személyre szabott, magyar nyelvű geführt meditáció (összesen 7 audiófájl) a blokkok feloldására.',
    price: 9990,
    currency: 'HUF',
    metadata: {
      product_type: 'meditations',
      includes_meditation: true,
      meditation_count: 7,
      chakra_specific: true,
      access_duration_days: 365,
    },
  },
  bundle: {
    id: 'bundle',
    stripeProductId: STRIPE_PRODUCT_IDS.BUNDLE,
    stripePriceId: STRIPE_PRICE_IDS.BUNDLE,
    name: 'Teljes Csakra Csomag (PDF + Meditációk)',
    description: 'Kombinált ajánlat: Részletes PDF elemzés + 7 személyre szabott meditációs audiófájl. Teljes spirituális önfejlesztési csomag.',
    price: 12990,
    currency: 'HUF',
    metadata: {
      product_type: 'bundle',
      includes_meditation: true,
      includes_pdf: true,
      meditation_count: 7,
      chakra_specific: true,
      access_duration_days: 365,
    },
  },
  ebook: {
    id: 'ebook',
    stripeProductId: STRIPE_PRODUCT_IDS.EBOOK,
    stripePriceId: STRIPE_PRICE_IDS.EBOOK,
    name: 'Csakra Gyógyítás Kézikönyv PDF',
    description: 'Átfogó, 50+ oldalas digitális kézikönyv a 7 csakráról, gyógyítási technikákról, gyakorlatokról és mindennapi rutinokról.',
    price: 6990,
    currency: 'HUF',
    metadata: {
      product_type: 'ebook',
      includes_meditation: false,
      pdf_template: 'handbook',
      chakra_specific: false,
      downloadable: true,
    },
  },
};

/**
 * Get product by ID
 */
export function getProductById(id: ProductId): ProductMetadata | null {
  return PRODUCTS[id] || null;
}

/**
 * Calculate discount percentage for bundle
 */
export function calculateBundleDiscount(): number {
  const individualTotal =
    PRODUCTS.prod_personal_chakra_report.price +
    PRODUCTS.prod_chakra_handbook.price +
    PRODUCTS.prod_chakra_meditations.price;

  const bundlePrice = PRODUCTS.prod_full_harmony_bundle.price;
  const discount = ((individualTotal - bundlePrice) / individualTotal) * 100;

  return Math.round(discount);
}
