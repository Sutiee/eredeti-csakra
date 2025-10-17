/**
 * Upsell Modal Component
 * Displays a time-limited, psychologically optimized upsell offer on the success page
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/lib/admin/tracking/client';

type UpsellModalProps = {
  sessionId: string;
  resultId: string;
  onClose: () => void;
  onPurchaseSuccess?: () => void | Promise<void>;
};

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Upsell Modal Component
 */
export default function UpsellModal({
  sessionId,
  resultId,
  onClose,
  onPurchaseSuccess
}: UpsellModalProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired
          trackEvent('upsell_expired', { result_id: resultId, session_id: sessionId });
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose, trackEvent, resultId, sessionId]);

  /**
   * Handle purchase button click
   */
  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/upsell/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          resultId,
          upsellProductId: 'workbook_30day',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fizetési hiba történt');
      }

      // Success!
      setPurchased(true);

      // Track successful purchase
      trackEvent('upsell_purchased', {
        result_id: resultId,
        session_id: sessionId,
        product_id: 'workbook_30day',
        amount: 3990,
      });

      // Call success callback to refresh purchases
      if (onPurchaseSuccess) {
        await onPurchaseSuccess();
      }

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Upsell purchase error:', err);
      setError(err instanceof Error ? err.message : 'Váratlan hiba történt');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine urgency color (red when < 2 minutes)
   */
  const isUrgent = timeLeft < 120; // Less than 2 minutes

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Close on backdrop click
      >
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Close button */}
          {!purchased && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 transition-colors"
              aria-label="Bezárás"
            >
              ✕
            </button>
          )}

          {!purchased ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <motion.h2
                  className="text-3xl font-serif font-bold text-purple-900 mb-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  🎉 Gratulálunk a vásárlásodhoz!
                </motion.h2>
                <motion.p
                  className="text-purple-700 text-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Exkluzív ajánlat - <strong>CSAK EGYSZER</strong> látod ezt!
                </motion.p>
              </div>

              {/* Product showcase */}
              <motion.div
                className="bg-white rounded-xl p-6 mb-6 shadow-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">📘</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      30 Napos Csakra Munkafüzet
                    </h3>
                    <ul className="space-y-2 text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✨</span>
                        <span>Napi 10-15 perces gyakorlatok minden csakrára</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">🧘</span>
                        <span>Személyre szabott meditációs scriptek</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">📝</span>
                        <span>Journaling kérdések önreflexióhoz</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">📊</span>
                        <span>Heti értékelő lapok és haladás követés</span>
                      </li>
                    </ul>

                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-bold text-purple-600">3990 Ft</span>
                      <span className="text-xl text-gray-400 line-through">9990 Ft</span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -60% 🔥
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Urgency timer */}
              <motion.div
                className={`${
                  isUrgent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                } border-2 rounded-lg p-4 mb-6 text-center`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className={`${isUrgent ? 'text-red-800' : 'text-orange-800'} font-semibold mb-1`}>
                  ⏰ Ez az ajánlat hamarosan lejár!
                </p>
                <motion.p
                  className={`text-3xl font-bold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}
                  animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                  transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
                >
                  {formatTime(timeLeft)}
                </motion.p>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-red-800 font-semibold">❌ {error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 underline text-sm mt-2"
                  >
                    Bezárás
                  </button>
                </motion.div>
              )}

              {/* CTA buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Feldolgozás...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 IGEN, HOZZÁADOM!</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-4 text-gray-600 hover:text-gray-800 font-semibold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Nem, köszönöm
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.p
                className="text-center text-sm text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                ⚡ Nincs új fizetési adat megadása • 🔒 Biztonságos fizetés
              </motion.p>

              {/* Social proof */}
              <motion.p
                className="text-center text-xs text-gray-400 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                🌟 Több mint 800 elégedett felhasználó választotta
              </motion.p>
            </>
          ) : (
            // Success state
            <motion.div
              className="text-center py-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              <h3 className="text-2xl font-bold text-green-600 mb-2">Sikeres vásárlás!</h3>
              <p className="text-gray-700">
                A <strong>30 Napos Csakra Munkafüzetet</strong> hamarosan megkapod emailben.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ez az ablak automatikusan bezáródik...
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
