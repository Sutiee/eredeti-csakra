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
import GiftModal from '@/components/success/GiftModal';
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
 * Upsell modal state machine
 * idle → workbook_modal → gift_modal → completed
 */
type UpsellModalState = 'idle' | 'workbook_modal' | 'gift_modal' | 'completed';

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
  const [upsellState, setUpsellState] = useState<UpsellModalState>('idle');
  const [workbookPurchased, setWorkbookPurchased] = useState(false);
  const { trackEvent } = useAnalytics();

  /**
   * Fetch purchase data from API with intelligent polling
   * Retries until purchases are found or max attempts reached
   */
  const fetchPurchases = async (retryCount = 0, maxRetries = 10): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch purchases from API
      const response = await fetch(`/api/purchases/${resultId}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch purchases');
      }

      const fetchedPurchases = data.data || [];
      const purchaseCount = fetchedPurchases.length;

      // DEBUG: Log fetched purchases
      console.log('[SUCCESS PAGE] Fetched purchases:', {
        count: purchaseCount,
        purchases: fetchedPurchases,
        resultId,
        sessionId,
        retryCount,
      });

      // If we have purchases, update state and track event
      if (purchaseCount > 0) {
        setPurchases(fetchedPurchases);

        // Track purchase completion (only on initial load with no existing purchases)
        if (purchases.length === 0) {
          trackEvent('page_view', {
            page_path: `/success/${resultId}`,
            page_name: 'success',
          });
          trackEvent('purchase_completed', {
            result_id: resultId,
            session_id: sessionId,
            products: fetchedPurchases.map((p: Purchase) => p.product_id),
            total_amount: fetchedPurchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0),
          });
          trackEvent('email_sent', {
            result_id: resultId,
            email_type: 'purchase_confirmation',
          });
        }

        setLoading(false);
        return true; // Success
      }

      // No purchases found - retry if we haven't exceeded max attempts
      if (retryCount < maxRetries) {
        console.log(`[SUCCESS PAGE] No purchases found, retrying in 1s (${retryCount + 1}/${maxRetries})...`);
        setLoading(true); // Keep loading state

        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Recursive retry
        return fetchPurchases(retryCount + 1, maxRetries);
      }

      // Max retries exceeded - show error
      console.error('[SUCCESS PAGE] Max retries exceeded, no purchases found');
      setError('A vásárlás feldolgozása folyamatban van. Kérlek frissítsd az oldalt 1-2 perc múlva.');
      setLoading(false);
      return false;

    } catch (err) {
      console.error('[SUCCESS PAGE] Error fetching purchases:', err);
      setError('Hiba történt a vásárlás adatainak betöltésekor');
      setLoading(false);
      return false;
    }
  };

  /**
   * Initial fetch on mount
   * FIX: Remove sessionId dependency - purchases are linked to result_id, not session_id
   * This allows the page to work even if the user refreshes or accesses directly without session_id
   */
  useEffect(() => {
    if (resultId) {
      fetchPurchases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  /**
   * Upsell State Machine Controller
   * Timing: idle → (3s) → workbook_modal → (user response) → (2s) → gift_modal → (user response) → completed
   *
   * Changed from 5s → 3s for first modal (per Phase 2.2 requirement)
   */
  useEffect(() => {
    // Only trigger if we have sessionId, purchases loaded, no error, and state is idle
    if (!sessionId || loading || error || upsellState !== 'idle') {
      return;
    }

    // Check if workbook was already purchased (skip workbook modal if so)
    const hasWorkbook = purchases.some(p => p.product_id === 'workbook_30day');

    if (hasWorkbook) {
      // User already has workbook - skip to gift modal
      const timer = setTimeout(() => {
        setWorkbookPurchased(true);
        setUpsellState('gift_modal');
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    } else {
      // Show workbook upsell modal first
      const timer = setTimeout(() => {
        setUpsellState('workbook_modal');

        // Track upsell modal impression
        trackEvent('upsell_viewed', {
          result_id: resultId,
          session_id: sessionId,
          product_id: 'workbook_30day',
        });
      }, 3000); // 3 seconds delay (changed from 5s)

      return () => clearTimeout(timer);
    }
  }, [upsellState, sessionId, loading, error, purchases, resultId, trackEvent]);

  /**
   * Handle workbook upsell purchase success
   * Uses intelligent polling to wait for purchase to appear in database
   * Then transitions to gift modal after 2-second delay
   */
  const handleWorkbookUpsellSuccess = async () => {
    try {
      console.log('[WORKBOOK UPSELL SUCCESS] Starting purchase refresh with polling...');

      // Poll for new purchase with up to 10 retries (10 seconds total)
      const expectedPurchaseCount = purchases.length + 1;

      for (let attempt = 0; attempt < 10; attempt++) {
        // Wait 1 second between attempts
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch purchases
        const response = await fetch(`/api/purchases/${resultId}`);
        const data = await response.json();

        if (data.data && data.data.length >= expectedPurchaseCount) {
          // New purchase found!
          console.log('[WORKBOOK UPSELL SUCCESS] New purchase found:', {
            expected: expectedPurchaseCount,
            actual: data.data.length,
            attempt: attempt + 1,
          });

          // Update purchases
          setPurchases(data.data);

          // Mark workbook as purchased
          setWorkbookPurchased(true);

          // Close workbook modal
          setUpsellState('idle');

          // Wait 2 seconds then show gift modal
          setTimeout(() => {
            setUpsellState('gift_modal');
          }, 2000);

          return;
        }

        console.log(`[WORKBOOK UPSELL SUCCESS] Waiting for new purchase (${attempt + 1}/10)...`);
      }

      // Max retries exceeded
      console.error('[WORKBOOK UPSELL SUCCESS] Failed to find new purchase after polling');
      alert('A vásárlás sikeres volt, de az oldal frissítése szükséges. Kérlek töltsd újra az oldalt!');

    } catch (error) {
      console.error('[WORKBOOK UPSELL SUCCESS] Error during purchase refresh:', error);
      alert('Hiba történt a vásárlás frissítésekor. Kérlek töltsd újra az oldalt!');
    }
  };

  /**
   * Handle workbook upsell modal close (user declined)
   * Transition to gift modal after 2-second delay
   */
  const handleWorkbookUpsellClose = () => {
    // Track workbook upsell declined
    trackEvent('upsell_declined', {
      result_id: resultId,
      session_id: sessionId || '',
      product_id: 'workbook_30day',
    });

    // Close workbook modal
    setUpsellState('idle');

    // Wait 2 seconds then show gift modal
    setTimeout(() => {
      setUpsellState('gift_modal');
    }, 2000);
  };

  /**
   * Handle gift modal purchase success
   * Refresh purchases list
   */
  const handleGiftPurchaseSuccess = async () => {
    try {
      console.log('[GIFT PURCHASE SUCCESS] Starting purchase refresh...');

      // Poll for new purchase with up to 10 retries (10 seconds total)
      const expectedPurchaseCount = purchases.length + 1;

      for (let attempt = 0; attempt < 10; attempt++) {
        // Wait 1 second between attempts
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch purchases
        const response = await fetch(`/api/purchases/${resultId}`);
        const data = await response.json();

        if (data.data && data.data.length >= expectedPurchaseCount) {
          // New purchase found!
          console.log('[GIFT PURCHASE SUCCESS] New purchase found:', {
            expected: expectedPurchaseCount,
            actual: data.data.length,
            attempt: attempt + 1,
          });

          // Update purchases
          setPurchases(data.data);

          // Close gift modal and mark sequence complete
          setUpsellState('completed');

          return;
        }

        console.log(`[GIFT PURCHASE SUCCESS] Waiting for new purchase (${attempt + 1}/10)...`);
      }

      // Max retries exceeded
      console.error('[GIFT PURCHASE SUCCESS] Failed to find new purchase after polling');
      alert('A vásárlás sikeres volt, de az oldal frissítése szükséges. Kérlek töltsd újra az oldalt!');

    } catch (error) {
      console.error('[GIFT PURCHASE SUCCESS] Error during purchase refresh:', error);
      alert('Hiba történt a vásárlás frissítésekor. Kérlek töltsd újra az oldalt!');
    }
  };

  /**
   * Handle gift modal close (user declined)
   * Mark upsell sequence as completed
   */
  const handleGiftModalClose = () => {
    // Track gift modal dismissed
    trackEvent('gift_modal_dismissed', {
      result_id: resultId,
      session_id: sessionId || '',
    });

    // Close gift modal and complete sequence
    setUpsellState('completed');
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <LoadingSpinner size="lg" message="Vásárlás feldolgozása..." />
          <p className="mt-4 text-sm text-gray-600">
            A fizetés sikeresen megtörtént. Néhány másodperc múlva betöltjük a vásárolt termékeket...
          </p>
          <p className="mt-2 text-xs text-gray-500">
            (Ez általában 5-10 másodpercet vesz igénybe)
          </p>
        </div>
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

      {/* Workbook Upsell Modal (first modal in sequence) */}
      {upsellState === 'workbook_modal' && sessionId && (
        <UpsellModal
          sessionId={sessionId}
          resultId={resultId}
          onClose={handleWorkbookUpsellClose}
          onPurchaseSuccess={handleWorkbookUpsellSuccess}
        />
      )}

      {/* Gift Modal (second modal in sequence) */}
      {upsellState === 'gift_modal' && sessionId && (
        <GiftModal
          sessionId={sessionId}
          resultId={resultId}
          workbookPurchased={workbookPurchased}
          onClose={handleGiftModalClose}
          onPurchaseSuccess={handleGiftPurchaseSuccess}
        />
      )}
    </main>
  );
}
