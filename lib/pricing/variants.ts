/**
 * Pricing Variant Management System
 *
 * This module provides centralized pricing configuration for A/B/C testing.
 * All product prices should be fetched through this module to ensure consistency.
 *
 * @module lib/pricing/variants
 */

/**
 * Valid pricing variant identifiers
 * - 'a': Control group (baseline pricing)
 * - 'b': Mid-tier pricing test
 * - 'c': Premium pricing test
 */
export type VariantId = 'a' | 'b' | 'c';

/**
 * Product identifiers that support variant pricing
 */
export type ProductId =
  | 'ai_analysis_pdf'
  | 'workbook_30day'
  | 'gift_bundle_full'  // AI + Workbook gift bundle (40% off)
  | 'gift_ai_only';     // AI only gift (40% off)

/**
 * Pricing variant configuration structure
 */
export interface PricingVariant {
  /** Unique variant identifier */
  id: VariantId;
  /** Human-readable variant name */
  name: string;
  /** Detailed description of the variant */
  description: string;
  /** Price mapping for all products (in HUF) */
  prices: Record<ProductId, number>;
  /** Optional: Pre-created Stripe Price IDs for this variant */
  stripePriceIds?: Partial<Record<ProductId, string>>;
}

/**
 * Complete pricing configuration for all variants
 *
 * Variant A: Control (current production prices)
 * Variant B: Mid-tier pricing test
 * Variant C: Premium pricing test
 */
export const PRICING_VARIANTS: Record<VariantId, PricingVariant> = {
  a: {
    id: 'a',
    name: 'Control',
    description: 'Baseline pricing (original production prices)',
    prices: {
      ai_analysis_pdf: 990,
      workbook_30day: 3990,
      // Gift products: 40% discount on combined price
      gift_bundle_full: 2988,  // (990 + 3990) * 0.6 = 2,988 Ft
      gift_ai_only: 594,       // 990 * 0.6 = 594 Ft
    },
  },
  b: {
    id: 'b',
    name: 'Mid-Tier',
    description: 'Medium pricing test',
    prices: {
      ai_analysis_pdf: 1990,
      workbook_30day: 4990,
      // Gift products: 40% discount on combined price
      gift_bundle_full: 4188,  // (1990 + 4990) * 0.6 = 4,188 Ft
      gift_ai_only: 1194,      // 1990 * 0.6 = 1,194 Ft
    },
  },
  c: {
    id: 'c',
    name: 'Premium',
    description: 'High pricing test',
    prices: {
      ai_analysis_pdf: 2990,
      workbook_30day: 5990,
      // Gift products: 40% discount on combined price
      gift_bundle_full: 5388,  // (2990 + 5990) * 0.6 = 5,388 Ft
      gift_ai_only: 1794,      // 2990 * 0.6 = 1,794 Ft
    },
  },
};

/**
 * List of all valid variant IDs for validation
 */
export const VALID_VARIANT_IDS: readonly VariantId[] = ['a', 'b', 'c'] as const;

/**
 * Get the price for a specific product and variant
 *
 * @param productId - The product identifier
 * @param variant - The pricing variant (defaults to 'a')
 * @returns Price in HUF
 *
 * @example
 * ```typescript
 * const price = getPrice('ai_analysis_pdf', 'b'); // Returns 1990
 * ```
 */
export function getPrice(productId: ProductId, variant: VariantId = 'a'): number {
  const variantConfig = PRICING_VARIANTS[variant];

  if (!variantConfig) {
    console.warn(`[Pricing] Invalid variant "${variant}", falling back to control`);
    return PRICING_VARIANTS.a.prices[productId];
  }

  const price = variantConfig.prices[productId];

  if (typeof price !== 'number' || price <= 0) {
    console.error(`[Pricing] Invalid price for ${productId} in variant ${variant}`);
    return PRICING_VARIANTS.a.prices[productId];
  }

  return price;
}

/**
 * Get all prices for a specific variant
 *
 * @param variant - The pricing variant (defaults to 'a')
 * @returns Object mapping product IDs to prices
 *
 * @example
 * ```typescript
 * const prices = getAllPrices('c');
 * // Returns: { ai_analysis_pdf: 2990, workbook_30day: 5990 }
 * ```
 */
export function getAllPrices(variant: VariantId = 'a'): Record<ProductId, number> {
  const variantConfig = PRICING_VARIANTS[variant];

  if (!variantConfig) {
    console.warn(`[Pricing] Invalid variant "${variant}", falling back to control`);
    return PRICING_VARIANTS.a.prices;
  }

  return variantConfig.prices;
}

/**
 * Get the current active variant from URL or cookie
 *
 * Priority order:
 * 1. URL query parameter (?variant=b)
 * 2. Cookie (__variant)
 * 3. Default to 'a' (control)
 *
 * @param searchParams - Optional URLSearchParams object (for server-side usage)
 * @returns The active variant ID
 *
 * @example
 * ```typescript
 * // Client-side usage
 * const variant = getCurrentVariant();
 *
 * // With URLSearchParams
 * const params = new URLSearchParams(window.location.search);
 * const variant = getCurrentVariant(params);
 * ```
 */
export function getCurrentVariant(searchParams?: URLSearchParams): VariantId {
  // Server-side check
  if (typeof window === 'undefined') {
    return 'a';
  }

  try {
    // Priority 1: URL query parameter
    const params = searchParams || new URLSearchParams(window.location.search);
    const urlVariant = params.get('variant');

    if (urlVariant && isValidVariant(urlVariant)) {
      return urlVariant;
    }

    // Priority 2: Cookie
    const cookies = document.cookie.split(';');
    const variantCookie = cookies
      .find(c => c.trim().startsWith('__variant='))
      ?.split('=')[1]
      ?.trim();

    if (variantCookie && isValidVariant(variantCookie)) {
      return variantCookie as VariantId;
    }
  } catch (error) {
    console.error('[Pricing] Error reading variant:', error);
  }

  // Default: Control variant
  return 'a';
}

/**
 * Validate if a value is a valid variant ID
 *
 * @param variant - Value to validate
 * @returns True if valid variant ID
 *
 * @example
 * ```typescript
 * isValidVariant('a'); // true
 * isValidVariant('b'); // true
 * isValidVariant('x'); // false
 * ```
 */
export function isValidVariant(variant: any): variant is VariantId {
  return VALID_VARIANT_IDS.includes(variant as VariantId);
}

/**
 * Get variant configuration by ID
 *
 * @param variant - The variant ID
 * @returns Complete variant configuration object
 *
 * @example
 * ```typescript
 * const config = getVariantConfig('b');
 * console.log(config.name); // "Mid-Tier"
 * console.log(config.prices.ai_analysis_pdf); // 1990
 * ```
 */
export function getVariantConfig(variant: VariantId = 'a'): PricingVariant {
  return PRICING_VARIANTS[variant] || PRICING_VARIANTS.a;
}

/**
 * Calculate discount percentage between two prices
 *
 * @param originalPrice - Original price
 * @param currentPrice - Discounted price
 * @returns Discount percentage (rounded to nearest integer)
 *
 * @example
 * ```typescript
 * calculateDiscount(7990, 990); // Returns 87
 * calculateDiscount(3990, 2990); // Returns 25
 * ```
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0 || currentPrice < 0) {
    console.warn('[Pricing] Invalid prices for discount calculation');
    return 0;
  }

  if (currentPrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Type guard to check if a string is a valid ProductId
 *
 * @param productId - Value to validate
 * @returns True if valid product ID
 */
export function isValidProductId(productId: any): productId is ProductId {
  return (
    productId === 'ai_analysis_pdf' ||
    productId === 'workbook_30day' ||
    productId === 'gift_bundle_full' ||
    productId === 'gift_ai_only'
  );
}

/**
 * Calculate gift product discount percentage
 * Compares gift price to the sum of individual product prices
 *
 * @param giftProductId - Gift product identifier
 * @param variant - Pricing variant
 * @returns Discount percentage (rounded to nearest integer)
 *
 * @example
 * ```typescript
 * calculateGiftDiscount('gift_bundle_full', 'b'); // Returns 40
 * calculateGiftDiscount('gift_ai_only', 'a'); // Returns 40
 * ```
 */
export function calculateGiftDiscount(
  giftProductId: Extract<ProductId, 'gift_bundle_full' | 'gift_ai_only'>,
  variant: VariantId = 'a'
): number {
  if (giftProductId === 'gift_bundle_full') {
    const aiPrice = getPrice('ai_analysis_pdf', variant);
    const workbookPrice = getPrice('workbook_30day', variant);
    const originalPrice = aiPrice + workbookPrice;
    const giftPrice = getPrice('gift_bundle_full', variant);
    return calculateDiscount(originalPrice, giftPrice);
  }

  if (giftProductId === 'gift_ai_only') {
    const originalPrice = getPrice('ai_analysis_pdf', variant);
    const giftPrice = getPrice('gift_ai_only', variant);
    return calculateDiscount(originalPrice, giftPrice);
  }

  return 0;
}