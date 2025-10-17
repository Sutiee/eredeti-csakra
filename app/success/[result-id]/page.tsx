/**
 * Success Page
 * Eredeti Csakra - Purchase Confirmation
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ThankYouMessage from '@/components/success/ThankYouMessage';
import DownloadLinks from '@/components/success/DownloadLinks';
import UpsellModal from '@/components/success/UpsellModal';
import { useAnalytics } from '@/lib/admin/tracking/client';

/**
 * Purchase data type
 */
type Purchase = {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  pdf_url: string | null;
  created_at: string;
};

/**
 * Success Page Component
 */
export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = params['result-id'] as string;
  const sessionId = searchParams.get('session_id');

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [hasSeenUpsell, setHasSeenUpsell] = useState(false);
  const { trackEvent } = useAnalytics();

  /**
   * Fetch purchase data from API
   */
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch purchases from API
      const response = await fetch(`/api/purchases/${resultId}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch purchases');
      }

      setPurchases(data.data || []);

      // Track purchase completion (only on initial load with no existing purchases)
      if (data.data && data.data.length > 0 && purchases.length === 0) {
        trackEvent('page_view', {
          page_path: `/success/${resultId}`,
          page_name: 'success',
        });
        trackEvent('purchase_completed', {
          result_id: resultId,
          session_id: sessionId,
          products: data.data.map((p: Purchase) => p.product_id),
          total_amount: data.data.reduce((sum: number, p: Purchase) => sum + p.amount, 0),
        });
        trackEvent('email_sent', {
          result_id: resultId,
          email_type: 'purchase_confirmation',
        });
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Hiba történt a vásárlás adatainak betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (resultId && sessionId) {
      fetchPurchases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId, sessionId]);

  /**
   * Show upsell modal after 5 seconds (only once)
   */
  useEffect(() => {
    if (!hasSeenUpsell && sessionId && !loading && !error) {
      const timer = setTimeout(() => {
        setShowUpsell(true);
        setHasSeenUpsell(true);

        // Track upsell modal impression
        trackEvent('upsell_viewed', {
          result_id: resultId,
          session_id: sessionId,
          product_id: 'workbook_30day',
        });
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [hasSeenUpsell, sessionId, loading, error, resultId, trackEvent]);

  /**
   * Handle upsell purchase success
   */
  const handleUpsellSuccess = async () => {
    // Refresh purchases to show the newly purchased item
    await fetchPurchases();
    setShowUpsell(false);
  };

  /**
   * Handle upsell modal close
   */
  const handleUpsellClose = () => {
    setShowUpsell(false);

    // Track upsell declined
    trackEvent('upsell_declined', {
      result_id: resultId,
      session_id: sessionId || '',
    });
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-white flex items-center justify-center px-4">
        <LoadingSpinner size="lg" message="Vásárlás megerősítése..." />
      </main>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50/80 via-rose-50/60 to-white flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
              Hiba történt
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
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
   * Success State
   */
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Animation & Message */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <motion.svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Sikeres vásárlás!
          </motion.h1>

          <motion.p
            className="text-xl text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Köszönjük a bizalmat! 🙏
          </motion.p>
        </motion.div>

        {/* Thank You Message */}
        <ThankYouMessage purchases={purchases} />

        {/* Download Links */}
        <DownloadLinks purchases={purchases} resultId={resultId} />

        {/* Next Steps */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">
            Mit tehetsz most?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => window.location.href = `/eredmeny/${resultId}`}
              className="bg-gradient-spiritual text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Eredményem megtekintése
            </motion.button>
            <motion.button
              onClick={() => window.location.href = '/'}
              className="bg-white text-purple-700 font-semibold py-3 px-8 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Vissza a főoldalra
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Upsell Modal (only if sessionId exists and user hasn't seen it yet) */}
      {showUpsell && sessionId && (
        <UpsellModal
          sessionId={sessionId}
          resultId={resultId}
          onClose={handleUpsellClose}
          onPurchaseSuccess={handleUpsellSuccess}
        />
      )}
    </main>
  );
}
