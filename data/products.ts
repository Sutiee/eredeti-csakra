/**
 * Product Data & Metadata
 * Eredeti Csakra - Extended Product Information
 */

import { ProductId } from '@/lib/stripe/products';

export type ProductFeature = {
  icon: string;
  text: string;
};

export type ExtendedProductData = {
  id: ProductId;
  slug: string;
  icon: string; // Emoji or icon identifier
  features: ProductFeature[];
  benefits: string[];
  deliveryInfo: string;
  accessDuration?: string; // For meditation access
};

/**
 * Extended product information for UI display
 */
export const PRODUCT_DATA: Record<ProductId, ExtendedProductData> = {
  prod_personal_chakra_report: {
    id: 'prod_personal_chakra_report',
    slug: 'csakra-csomag',
    icon: '📊',
    features: [
      { icon: '✨', text: 'Személyre szabott PDF jelentés' },
      { icon: '🎯', text: '7 csakra részletes elemzése' },
      { icon: '💡', text: 'Konkrét gyakorlati tanácsok' },
      { icon: '📈', text: 'Egyensúly javítási terv' },
    ],
    benefits: [
      'Mélyebb önismeret',
      'Személyre szabott megoldások',
      'Praktikus útmutató',
      'Azonnali hozzáférés',
    ],
    deliveryInfo: 'Azonnal letölthető PDF formátumban a vásárlás után',
  },

  prod_chakra_handbook: {
    id: 'prod_chakra_handbook',
    slug: 'csakra-kezikonyv',
    icon: '📖',
    features: [
      { icon: '📚', text: '80+ oldalas részletes útmutató' },
      { icon: '🧘', text: 'Gyakorlatok minden csakrához' },
      { icon: '🌈', text: 'Színterápia technikák' },
      { icon: '🎵', text: 'Hangterápia útmutató' },
    ],
    benefits: [
      'Átfogó csakra tudás',
      'Gyakorlati eszközök',
      'Önálló gyakorlás',
      'Életre szóló referencia',
    ],
    deliveryInfo: 'Letölthető PDF kézikönyv, nyomtatható formátumban',
  },

  prod_chakra_meditations: {
    id: 'prod_chakra_meditations',
    slug: 'meditaciok',
    icon: '🧘‍♀️',
    features: [
      { icon: '🎧', text: '7 vezetett meditáció' },
      { icon: '⏱️', text: '10-15 perces gyakorlatok' },
      { icon: '🎙️', text: 'Professzionális felolvasás' },
      { icon: '🎼', text: 'Gyógyító háttérzenék' },
    ],
    benefits: [
      'Mélyebb relaxáció',
      'Energetikai tisztítás',
      'Napi gyakorlat',
      'Stresszoldás',
    ],
    deliveryInfo: 'Online hozzáférés a meditációkhoz + letölthető MP3 fájlok',
    accessDuration: '1 év korlátlan hozzáférés',
  },

  prod_full_harmony_bundle: {
    id: 'prod_full_harmony_bundle',
    slug: 'teljes-csomag',
    icon: '🌟',
    features: [
      { icon: '📊', text: 'Személyre szabott jelentés' },
      { icon: '📖', text: 'Teljes csakra kézikönyv' },
      { icon: '🧘‍♀️', text: '7 vezetett meditáció' },
      { icon: '💎', text: '22% kedvezmény' },
    ],
    benefits: [
      'Teljes körű támogatás',
      'Legnagyobb kedvezmény',
      'Minden eszköz egy helyen',
      'Komplexebb fejlődés',
    ],
    deliveryInfo: 'Minden tartalom azonnal elérhető a vásárlás után',
    accessDuration: '1 év korlátlan hozzáférés a meditációkhoz',
  },
};

/**
 * Get product data by ID
 */
export function getProductData(id: ProductId): ExtendedProductData | null {
  return PRODUCT_DATA[id] || null;
}

/**
 * Get upsell recommendations
 */
export function getUpsellProducts(currentProductId: ProductId): ProductId[] {
  if (currentProductId === 'prod_personal_chakra_report') {
    return ['prod_chakra_handbook', 'prod_chakra_meditations', 'prod_full_harmony_bundle'];
  }

  return [];
}
