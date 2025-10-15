/**
 * Checkout Page
 * Eredeti Csakra - Product Purchase Flow
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ProductSummary from '@/components/checkout/ProductSummary';
import type { QuizResult } from '@/types';

/**
 * API Response type
 */
type APIResponse = {
  data: QuizResult | null;
  error: {
    message: string;
    code: string;
  } | null;
};

/**
 * Checkout Page Component
 */
export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params['result-id'] as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  /**
   * Fetch quiz result
   */
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/result/${resultId}`);
        const data: APIResponse = await response.json();

        if (!response.ok || data.error) {
          setError({
            message: data.error?.message || 'Hiba történt az eredmény betöltésekor',
            code: data.error?.code || 'UNKNOWN_ERROR',
          });
          return;
        }

        if (data.data) {
          setResult(data.data);
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError({
          message: 'Hiba történt az eredmény betöltésekor',
          code: 'NETWORK_ERROR',
        });
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  /**
   * Loading State
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white flex items-center justify-center px-4">
        <LoadingSpinner size="lg" message="Betöltés..." />
      </main>
    );
  }

  /**
   * Error State
   */
  if (error || !result) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
              Hiba történt
            </h1>
            <p className="text-gray-600 mb-6">
              {error?.message || 'Nem sikerült betölteni az eredményt'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-spiritual text-white font-semibold py-3 px-6 rounded-lg"
            >
              Vissza a főoldalra
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /**
   * Success State: Show Checkout
   */
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-spiritual bg-clip-text text-transparent">
            Megrendelés
          </h1>
          <p className="text-gray-600 text-lg">
            Válaszd ki a számodra megfelelő csomagot
          </p>
        </motion.div>

        {/* Checkout Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Checkout Form (2/3 width) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CheckoutForm resultId={resultId} email={result.email} />
          </motion.div>

          {/* Right Column: Product Summary (1/3 width) */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProductSummary />
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Biztonságos fizetés</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Azonnali hozzáférés</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Minőségi garancia</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
