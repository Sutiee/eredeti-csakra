/**
 * Upsell Checkboxes Component
 * Eredeti Csakra - Additional Product Selection
 */

'use client';

import { motion } from 'framer-motion';
import { PRODUCTS, ProductId } from '@/lib/stripe/products';

type UpsellCheckboxesProps = {
  selectedProducts: ProductId[];
  onToggle: (productId: ProductId) => void;
};

/**
 * Upsell Checkboxes Component
 */
export default function UpsellCheckboxes({
  selectedProducts,
  onToggle,
}: UpsellCheckboxesProps) {
  const upsellProducts: ProductId[] = ['prod_chakra_handbook', 'prod_chakra_meditations'];

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Kiegészítő ajánlatok
      </h3>

      {upsellProducts.map((productId, index) => {
        const product = PRODUCTS[productId];
        const isSelected = selectedProducts.includes(productId);

        return (
          <motion.label
            key={productId}
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-gray-50 hover:border-purple-300'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(productId)}
                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold text-purple-700">
                    +{product.price.toLocaleString()} Ft
                  </span>
                  {/* Temporarily commented out - bundlePrice property removed
                  {product.bundlePrice && (
                    <span className="text-xs text-gray-500">
                      (Bundle-ben: {product.bundlePrice.toLocaleString()} Ft)
                    </span>
                  )}
                  */}
                </div>
              </div>
            </div>
          </motion.label>
        );
      })}
    </div>
  );
}
