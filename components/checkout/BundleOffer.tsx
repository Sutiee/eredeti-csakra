/**
 * Bundle Offer Component
 * Eredeti Csakra - Full Harmony Bundle Promotion
 */

'use client';

import { motion } from 'framer-motion';
import { PRODUCTS, calculateBundleDiscount } from '@/lib/stripe/products';

type BundleOfferProps = {
  isSelected: boolean;
  onToggle: () => void;
};

/**
 * Bundle Offer Component
 */
export default function BundleOffer({ isSelected, onToggle }: BundleOfferProps) {
  const bundle = PRODUCTS.bundle;
  const discount = calculateBundleDiscount();

  const individualTotal =
    PRODUCTS.detailed_pdf.price +
    PRODUCTS.ebook.price +
    PRODUCTS.meditations.price;

  const savings = individualTotal - bundle.price;

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative">
        {/* Discount Badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <motion.div
            className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            -{discount}% kedvezmény
          </motion.div>
        </div>

        <motion.label
          className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${
            isSelected
              ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-purple-50 shadow-lg'
              : 'border-gray-300 bg-white hover:border-rose-400 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggle}
              className="mt-1 w-6 h-6 text-rose-600 rounded focus:ring-rose-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌟</span>
                <h3 className="text-xl font-bold text-gray-800">{bundle.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>

              {/* Bundle Contents */}
              <div className="bg-white/50 rounded-lg p-3 mb-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Személyre Szabott Csakra Csomag</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Csakra Kézikönyv (80+ oldal)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>7 Vezetett Meditáció</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 line-through">
                    {individualTotal.toLocaleString()} Ft
                  </div>
                  <div className="text-2xl font-bold text-rose-700">
                    {bundle.price.toLocaleString()} Ft
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Megtakarítás:</div>
                  <div className="text-xl font-bold text-green-600">
                    {savings.toLocaleString()} Ft
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.label>
      </div>
    </motion.div>
  );
}
