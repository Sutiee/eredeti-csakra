/**
 * Stripe Product Definitions
 * Eredeti Csakra - Product Metadata
 *
 * SETUP INSTRUCTIONS:
 * 1. Create products in Stripe Dashboard (see docs/STRIPE_PRODUCT_SETUP.md)
 * 2. Replace STRIPE_PRODUCT_IDS placeholder values with actual Product IDs from Stripe
 * 3. Update STRIPE_PRICE_IDS with actual Price IDs from Stripe
 *
 * IMPORTANT: Prices for ai_analysis_pdf and workbook_30day are managed through
 * the pricing variants system (lib/pricing/variants.ts) for A/B/C testing.
 * Use getProductPrice() to get the current price based on the active variant.
 */

import { getPrice, type VariantId } from '@/lib/pricing/variants';

export type ProductId =
  // v2.0 Upsell Products
  | 'ai_analysis_pdf'        // Entry product (variant pricing)
  | 'workbook_30day'         // Upsell product (variant pricing)
  // v2.5 Gift Products
  | 'gift_bundle_full'       // AI + Workbook gift bundle (40% off)
  | 'gift_ai_only'           // AI only gift (40% off)
  // v1.x Products
  | 'detailed_pdf'
  | 'meditations'
  | 'bundle'
  | 'ebook'
  // Backward compatibility
  | 'prod_personal_chakra_report'
  | 'prod_chakra_handbook'
  | 'prod_chakra_meditations'
  | 'prod_full_harmony_bundle';

export type ProductMetadata = {
  id: ProductId;
  stripeProductId: string; // Actual Stripe Product ID (prod_xxx...)
  stripePriceId: string;   // Actual Stripe Price ID (price_xxx...)
  name: string;
  description: string;
  price: number; // In HUF
  originalPrice?: number; // For upsell products (strikethrough price)
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
    is_entry_product?: boolean;  // NEW: Entry-level product
    is_upsell?: boolean;          // NEW: Upsell product
    is_gift?: boolean;            // NEW: Gift product
    ai_generated?: boolean;       // NEW: AI-generated content
  };
};

/**
 * IMPORTANT: Replace these with actual Stripe Product IDs
 * Get these from: Stripe Dashboard → Products → [Product] → Copy Product ID
 */
const STRIPE_PRODUCT_IDS = {
  // v2.0 Upsell Products
  AI_ANALYSIS: process.env.STRIPE_PRODUCT_ID_AI_ANALYSIS || 'prod_REPLACE_ME',
  WORKBOOK: process.env.STRIPE_PRODUCT_ID_WORKBOOK || 'prod_THbfA6Ig4B28Yo',
  // v1.x Products
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
  // v2.0 Upsell Products
  AI_ANALYSIS: process.env.STRIPE_PRICE_ID_AI_ANALYSIS || 'price_REPLACE_ME',
  WORKBOOK: process.env.STRIPE_PRICE_ID_WORKBOOK || 'price_1SL2VD4g26nclPGfGaC7efg7',
  // v1.x Products
  DETAILED_PDF: process.env.STRIPE_PRICE_ID_DETAILED_PDF || 'price_REPLACE_ME',
  MEDITATIONS: process.env.STRIPE_PRICE_ID_MEDITATIONS || 'price_REPLACE_ME',
  BUNDLE: process.env.STRIPE_PRICE_ID_BUNDLE || 'price_REPLACE_ME',
  EBOOK: process.env.STRIPE_PRICE_ID_EBOOK || 'price_REPLACE_ME',
} as const;

/**
 * Product catalog - all available products
 */
export const PRODUCTS: Record<ProductId, ProductMetadata> = {
  // ========================================
  // v2.0 Upsell Products (PRIMARY)
  // ========================================
  ai_analysis_pdf: {
    id: 'ai_analysis_pdf',
    stripeProductId: STRIPE_PRODUCT_IDS.AI_ANALYSIS,
    stripePriceId: STRIPE_PRICE_IDS.AI_ANALYSIS,
    name: 'Személyre Szabott Csakra Elemzés PDF',
    description: '20+ oldalas személyre szabott csakra jelentés a 7 csakra részletes diagnosztikájával és konkrét gyakorlatokkal.',
    price: 990,
    currency: 'HUF',
    metadata: {
      product_type: 'personalized_pdf',
      includes_meditation: false,
      includes_pdf: true,
      pdf_template: 'personalized_analysis',
      is_entry_product: true,
    },
  },
  workbook_30day: {
    id: 'workbook_30day',
    stripeProductId: STRIPE_PRODUCT_IDS.WORKBOOK,
    stripePriceId: STRIPE_PRICE_IDS.WORKBOOK,
    name: '30 Napos Csakra Munkafüzet',
    description: 'Személyre szabott 30 napos gyakorlati program napi meditációkkal, journaling kérdésekkel, heti értékelő lapokkal és konkrét csakra gyakorlatokkal.',
    price: 3990,
    originalPrice: 9990, // Strikethrough price for upsell
    currency: 'HUF',
    metadata: {
      product_type: 'workbook',
      includes_meditation: false,
      includes_pdf: true,
      pdf_template: 'workbook_30day',
      is_upsell: true,
    },
  },

  // ========================================
  // v2.5 Gift Products
  // ========================================
  gift_bundle_full: {
    id: 'gift_bundle_full',
    stripeProductId: process.env.STRIPE_PRODUCT_ID_GIFT_BUNDLE || 'prod_GIFT_BUNDLE_PLACEHOLDER',
    stripePriceId: process.env.STRIPE_PRICE_ID_GIFT_BUNDLE || 'price_GIFT_BUNDLE_PLACEHOLDER',
    name: 'Ajándék Csomag - AI Elemzés + 30 Napos Munkafüzet',
    description: 'Teljes ajándékcsomag: Személyre szabott AI csakra elemzés PDF + 30 napos gyakorlati munkafüzet. 40% kedvezménnyel ajándékba.',
    price: 2988, // Base price for variant A (overridden by getProductPrice)
    originalPrice: 4980, // Sum of AI (990) + Workbook (3990)
    currency: 'HUF',
    metadata: {
      product_type: 'gift_bundle',
      includes_meditation: false,
      includes_pdf: true,
      pdf_template: 'gift_bundle',
      is_gift: true,
      is_upsell: true,
      ai_generated: true,
    },
  },
  gift_ai_only: {
    id: 'gift_ai_only',
    stripeProductId: process.env.STRIPE_PRODUCT_ID_GIFT_AI || 'prod_GIFT_AI_PLACEHOLDER',
    stripePriceId: process.env.STRIPE_PRICE_ID_GIFT_AI || 'price_GIFT_AI_PLACEHOLDER',
    name: 'Ajándék AI Elemzés PDF',
    description: 'Személyre szabott csakra AI elemzés ajándékba. 40% kedvezménnyel.',
    price: 594, // Base price for variant A (overridden by getProductPrice)
    originalPrice: 990, // Original AI analysis price
    currency: 'HUF',
    metadata: {
      product_type: 'gift_ai_analysis',
      includes_meditation: false,
      includes_pdf: true,
      pdf_template: 'personalized_analysis',
      is_gift: true,
      is_upsell: true,
      ai_generated: true,
    },
  },

  // ========================================
  // v1.x Products (LEGACY)
  // ========================================
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
  // Backward compatibility aliases
  prod_personal_chakra_report: {} as ProductMetadata,
  prod_chakra_handbook: {} as ProductMetadata,
  prod_chakra_meditations: {} as ProductMetadata,
  prod_full_harmony_bundle: {} as ProductMetadata,
};

// Set up aliases after object creation
PRODUCTS.prod_personal_chakra_report = PRODUCTS.detailed_pdf;
PRODUCTS.prod_chakra_handbook = PRODUCTS.ebook;
PRODUCTS.prod_chakra_meditations = PRODUCTS.meditations;
PRODUCTS.prod_full_harmony_bundle = PRODUCTS.bundle;

/**
 * Get product by ID
 */
export function getProductById(id: ProductId): ProductMetadata | null {
  return PRODUCTS[id] || null;
}

/**
 * Get product price with A/B/C variant support
 * For products in the variants system, returns dynamic price based on variant.
 * For other products, returns the static price from PRODUCTS.
 *
 * @param productId - Product identifier
 * @param variant - Optional variant ID (defaults to 'a')
 * @returns Price in HUF
 */
export function getProductPrice(productId: ProductId, variant?: VariantId): number {
  // Products with dynamic pricing (A/B/C testing)
  if (
    productId === 'ai_analysis_pdf' ||
    productId === 'workbook_30day' ||
    productId === 'gift_bundle_full' ||  // NEW: Gift products
    productId === 'gift_ai_only'         // NEW: Gift products
  ) {
    return getPrice(productId, variant);
  }

  // Static pricing for legacy products
  const product = PRODUCTS[productId];
  return product?.price || 0;
}

/**
 * Get product metadata with dynamic price
 * Returns a ProductMetadata object with the price updated based on the current variant.
 *
 * @param productId - Product identifier
 * @param variant - Optional variant ID (defaults to 'a')
 * @returns ProductMetadata with dynamic price
 */
export function getProductWithVariantPrice(
  productId: ProductId,
  variant?: VariantId
): ProductMetadata | null {
  const product = getProductById(productId);
  if (!product) return null;

  // For variant-managed products, update the price
  if (
    productId === 'ai_analysis_pdf' ||
    productId === 'workbook_30day' ||
    productId === 'gift_bundle_full' ||  // NEW: Gift products
    productId === 'gift_ai_only'         // NEW: Gift products
  ) {
    return {
      ...product,
      price: getPrice(productId, variant),
    };
  }

  return product;
}

/**
 * Calculate discount percentage for bundle
 */
export function calculateBundleDiscount(): number {
  const individualTotal =
    PRODUCTS.detailed_pdf.price +
    PRODUCTS.ebook.price +
    PRODUCTS.meditations.price;

  const bundlePrice = PRODUCTS.bundle.price;
  const discount = ((individualTotal - bundlePrice) / individualTotal) * 100;

  return Math.round(discount);
}
