/**
 * Stripe Product Definitions
 * Eredeti Csakra - Product Metadata
 */

export type ProductId =
  | 'prod_personal_chakra_report'
  | 'prod_chakra_handbook'
  | 'prod_chakra_meditations'
  | 'prod_full_harmony_bundle';

export type ProductMetadata = {
  id: ProductId;
  name: string;
  description: string;
  price: number; // In HUF
  priceId: string;
  currency: string;
  bundlePrice?: number; // Discounted price when bought in bundle
};

/**
 * Product catalog - all available products
 */
export const PRODUCTS: Record<ProductId, ProductMetadata> = {
  prod_personal_chakra_report: {
    id: 'prod_personal_chakra_report',
    name: 'Személyre Szabott Csakra Csomag',
    description: 'Részletes PDF jelentés a csakráidról, személyre szabott javaslatokkal',
    price: 2990,
    priceId: 'price_2990_huf',
    currency: 'HUF',
  },
  prod_chakra_handbook: {
    id: 'prod_chakra_handbook',
    name: 'Csakra Kézikönyv',
    description: 'Átfogó útmutató a csakrák megértéséhez és harmonizálásához',
    price: 1990,
    priceId: 'price_1990_huf',
    currency: 'HUF',
    bundlePrice: 1490, // Discounted in bundle
  },
  prod_chakra_meditations: {
    id: 'prod_chakra_meditations',
    name: 'Meditációs Csomag',
    description: '7 vezetett meditáció minden csakrához, professzionális hangminőséggel',
    price: 3990,
    priceId: 'price_3990_huf',
    currency: 'HUF',
    bundlePrice: 2990, // Discounted in bundle
  },
  prod_full_harmony_bundle: {
    id: 'prod_full_harmony_bundle',
    name: 'Teljes Harmónia Csomag',
    description: 'Minden termék együtt - Jelentés + Kézikönyv + Meditációk (22% kedvezmény)',
    price: 6990,
    priceId: 'price_6990_huf',
    currency: 'HUF',
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
