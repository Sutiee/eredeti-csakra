"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/stripe/products";

interface PricingSectionProps {
  resultId: string;
  onProductSelect?: (productId: string, isDecoy: boolean) => void;
}

/**
 * PricingSection Component
 *
 * 3-card pricing layout with decoy strategy to maximize Bundle conversions.
 * 
 * **Decoy Strategy**:
 * - PDF (2,990 Ft) - Entry point
 * - **AJÁNLOTT: Bundle (12,990 Ft)** - TARGET (visually elevated)
 * - Prémium (placeholder) - Anchor to make Bundle look affordable
 *
 * **Expected result**: 50%+ click rate on Bundle card (decoy effect)
 *
 * v2.1 Feature: Conversion Booster
 */
export default function PricingSection({
  resultId,
  onProductSelect,
}: PricingSectionProps) {
  const router = useRouter();

  // Products to display
  const pdfProduct = PRODUCTS.ai_analysis_pdf;
  const bundleProduct = PRODUCTS.bundle;

  // Calculate bundle discount
  const bundleOriginalPrice = 24970; // PDF + Ebook + Meditations theoretical total
  const bundleSavings = bundleOriginalPrice - bundleProduct.price;
  const bundleDiscountPercent = Math.round(
    (bundleSavings / bundleOriginalPrice) * 100
  );

  // Handle product selection
  const handleProductClick = (productId: string, isDecoy: boolean) => {
    // Analytics tracking
    if (onProductSelect) {
      onProductSelect(productId, isDecoy);
    }

    // Navigate to checkout
    router.push(`/checkout/${resultId}?product=${productId}`);
  };

  return (
    <section id="pricing-cards-section" className="w-full max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 bg-gradient-spiritual bg-clip-text text-transparent">
          Válaszd ki a számodra tökéletes csomagot
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Minden csomag azonnali hozzáférést biztosít a személyre szabott
          tartalmakhoz
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1: PDF - Entry Point */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-200"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {pdfProduct.name}
            </h3>
            <p className="text-sm text-gray-600">
              Személyre szabott AI elemzés
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>20+ oldalas részletes PDF</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>7 csakra személyre szabott elemzése</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>7 napos akcióterv</span>
            </li>
          </ul>

          <div className="mb-6 text-center">
            <div className="text-3xl font-bold text-purple-700">
              {pdfProduct.price.toLocaleString("hu-HU")} Ft
            </div>
            <p className="text-xs text-gray-500 mt-1">Egyszeri fizetés</p>
          </div>

          <motion.button
            onClick={() => handleProductClick(pdfProduct.id, false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Választom
          </motion.button>
        </motion.div>

        {/* Card 2: Bundle - AJÁNLOTT (DECOY TARGET) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ y: -12, scale: 1.05 }}
          className="relative bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border-2 border-spiritual-gold-400 scale-105 md:scale-105"
          style={{
            boxShadow:
              "0 0 40px rgba(234, 179, 8, 0.2), 0 20px 50px rgba(0,0,0,0.15)",
          }}
        >
          {/* AJÁNLOTT Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-spiritual-gold-400 to-spiritual-gold-600 text-white font-bold text-sm px-6 py-2 rounded-full shadow-lg">
            ⭐ AJÁNLOTT
          </div>

          <div className="text-center mb-6 mt-2">
            <div className="text-5xl mb-3">🎁</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {bundleProduct.name}
            </h3>
            <p className="text-sm text-gray-600">
              Teljes harmónia csomag
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-gold-600 mt-0.5">✨</span>
              <span className="font-semibold">Minden a PDF-ből</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-gold-600 mt-0.5">✨</span>
              <span className="font-semibold">
                + 50+ oldalas Csakra Kézikönyv
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-gold-600 mt-0.5">✨</span>
              <span className="font-semibold">
                + 7 vezetett meditáció (70+ perc)
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-gold-600 mt-0.5">✨</span>
              <span>365 napos hozzáférés</span>
            </li>
          </ul>

          {/* Price with strikethrough */}
          <div className="mb-6 text-center">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-lg text-gray-400 line-through">
                {bundleOriginalPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div className="text-4xl font-bold text-spiritual-purple-700">
              {bundleProduct.price.toLocaleString("hu-HU")} Ft
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 border-2 border-emerald-300 rounded-full px-3 py-1 mt-2">
              <span className="text-emerald-700 font-bold text-sm">
                {bundleDiscountPercent}% megtakarítás
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Teljes értéke: {bundleOriginalPrice.toLocaleString("hu-HU")} Ft
            </p>
          </div>

          <motion.button
            onClick={() => handleProductClick(bundleProduct.id, true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Ezt választom! 🎯
          </motion.button>
        </motion.div>

        {/* Card 3: Prémium (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-2 border-purple-200 opacity-75"
        >
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Hamarosan
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">👑</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Prémium Csomag
            </h3>
            <p className="text-sm text-gray-600">
              1:1 személyes konzultációval
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Minden a Bundle-ből</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span className="font-semibold">
                + 30 perces 1:1 online konzultáció
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Személyre szabott tanácsadás</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>VIP support</span>
            </li>
          </ul>

          <div className="mb-6 text-center">
            <div className="text-3xl font-bold text-purple-700">
              Hamarosan elérhető
            </div>
          </div>

          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          >
            Érdekel
          </button>
        </motion.div>
      </div>

      {/* Trust signals below cards */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-gray-600"
      >
        <div className="flex items-center gap-2">
          <span>🛡️</span>
          <span>14 napos garancia</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💳</span>
          <span>Biztonságos fizetés</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⚡</span>
          <span>Azonnali hozzáférés</span>
        </div>
      </motion.div>
    </section>
  );
}
