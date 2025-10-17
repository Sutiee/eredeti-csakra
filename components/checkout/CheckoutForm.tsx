/**
 * Checkout Form Component
 * Eredeti Csakra - Product Selection & Payment
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import UpsellCheckboxes from './UpsellCheckboxes';
import BundleOffer from './BundleOffer';
import { PRODUCTS } from '@/lib/stripe/products';
import type { ProductId } from '@/lib/stripe/products';
import { useAnalytics } from '@/lib/admin/tracking/client';

type CheckoutFormProps = {
  resultId: string;
  email: string;
};

// Initialize Stripe
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!STRIPE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}
console.log('🔑 STRIPE KEY LOADED:', STRIPE_KEY.substring(0, 20) + '...',
  STRIPE_KEY.startsWith('pk_test_') ? '✅ TEST MODE' : '❌ LIVE MODE');
const stripePromise = loadStripe(STRIPE_KEY);

/**
 * Checkout Form Component
 */
export default function CheckoutForm({ resultId, email }: CheckoutFormProps) {
  const searchParams = useSearchParams();
  const preselectedProduct = searchParams.get('product') as ProductId | null;

  // Initialize with preselected product from query param or default
  const getInitialSelection = (): ProductId[] => {
    if (preselectedProduct && PRODUCTS[preselectedProduct]) {
      return [preselectedProduct];
    }
    // Default to new AI Analysis product (v2.0)
    return ['ai_analysis_pdf'];
  };

  const [selectedProducts, setSelectedProducts] = useState<ProductId[]>(getInitialSelection());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  // Track when preselected product is loaded
  useEffect(() => {
    if (preselectedProduct && PRODUCTS[preselectedProduct]) {
      trackEvent('checkout_product_preselected', {
        product_id: preselectedProduct,
        result_id: resultId,
      });
    }
  }, [preselectedProduct, resultId, trackEvent]);

  /**
   * Calculate total price
   */
  const calculateTotal = (): number => {
    // If bundle is selected, return bundle price
    if (selectedProducts.includes('prod_full_harmony_bundle')) {
      return PRODUCTS.prod_full_harmony_bundle.price;
    }

    // Otherwise sum individual products
    return selectedProducts.reduce((total, productId) => {
      const product = PRODUCTS[productId];
      return total + (product?.price || 0);
    }, 0);
  };

  /**
   * Handle product selection toggle
   */
  const toggleProduct = (productId: ProductId) => {
    setSelectedProducts((prev) => {
      let newSelection: ProductId[];

      // If toggling bundle
      if (productId === 'prod_full_harmony_bundle') {
        if (prev.includes(productId)) {
          // Remove bundle, keep base report
          newSelection = ['ai_analysis_pdf'];
        } else {
          // Select bundle only
          newSelection = ['prod_full_harmony_bundle'];
        }
      } else {
        // If bundle is selected, deselect it when selecting individual items
        const withoutBundle = prev.filter((id) => id !== 'prod_full_harmony_bundle');

        // Toggle individual product
        if (withoutBundle.includes(productId)) {
          const filtered = withoutBundle.filter((id) => id !== productId);
          // Keep at least base report
          newSelection = filtered.length > 0 ? filtered : ['ai_analysis_pdf'];
        } else {
          newSelection = [...withoutBundle, productId];
        }
      }

      // Track product selection
      const isAdding = !prev.includes(productId);
      if (isAdding) {
        trackEvent('product_selected', {
          product_id: productId,
          product_name: PRODUCTS[productId]?.name,
          result_id: resultId,
        });
      }

      return newSelection;
    });
  };

  /**
   * Handle checkout submission
   */
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultId,
          email,
          items: selectedProducts.map((productId) => ({
            productId,
            quantity: 1,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Hiba történt a fizetés indításakor');
      }

      // Redirect to Stripe Checkout URL directly
      if (data.data.url) {
        window.location.href = data.data.url;
      } else if (data.data.sessionId) {
        // Fallback: Load Stripe and redirect
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe betöltési hiba');
        }

        // Use window.location for redirect (more reliable)
        window.location.href = `https://checkout.stripe.com/c/pay/${data.data.sessionId}`;
      } else {
        throw new Error('Hiányzó session URL vagy ID');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
      setLoading(false);
    }
  };

  const totalPrice = calculateTotal();
  const isBundle = selectedProducts.includes('prod_full_harmony_bundle');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">
        Válassz csomagot
      </h2>

      {/* Base Product (Always Included) */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {PRODUCTS.ai_analysis_pdf.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {PRODUCTS.ai_analysis_pdf.description}
            </p>
            <p className="text-lg font-bold text-purple-700 mt-2">
              {PRODUCTS.ai_analysis_pdf.price.toLocaleString()} Ft
            </p>
          </div>
        </div>
      </div>

      {/* Upsell Checkboxes (Handbook & Meditations) */}
      {!isBundle && (
        <UpsellCheckboxes
          selectedProducts={selectedProducts}
          onToggle={toggleProduct}
        />
      )}

      {/* Bundle Offer */}
      <BundleOffer
        isSelected={isBundle}
        onToggle={() => toggleProduct('prod_full_harmony_bundle')}
      />

      {/* Error Message */}
      {error && (
        <motion.div
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Total & Checkout Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-gray-700">Végösszeg:</span>
          <span className="text-3xl font-bold text-purple-700">
            {totalPrice.toLocaleString()} Ft
          </span>
        </div>

        <motion.button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-spiritual text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Betöltés...
            </span>
          ) : (
            'Tovább a fizetéshez'
          )}
        </motion.button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Biztonságos fizetés a Stripe rendszerén keresztül
        </p>
      </div>
    </div>
  );
}
