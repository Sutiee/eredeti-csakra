/**
 * Gift Redemption Page
 * /ajandek/[code]
 *
 * Public page for recipients to redeem their gift codes
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type GiftValidationData = {
  valid: boolean;
  product_id?: string;
  product_name?: string;
  expires_at?: string;
  status?: string;
  reason?: string;
  message?: string;
};

export default function GiftRedemptionPage() {
  const params = useParams();
  const router = useRouter();
  const giftCode = params.code as string;

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [giftData, setGiftData] = useState<GiftValidationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);

  /**
   * Validate gift code on mount
   */
  useEffect(() => {
    const validateGift = async () => {
      try {
        setValidating(true);
        const response = await fetch(`/api/gift/validate?code=${giftCode}`);
        const data = await response.json();

        if (data.data) {
          setGiftData(data.data);

          if (!data.data.valid) {
            setError(data.data.message || 'Az ajándékkód érvénytelen');
          }
        } else {
          setError('Az ajándékkód ellenőrzése sikertelen');
        }
      } catch (err) {
        console.error('[GIFT PAGE] Validation error:', err);
        setError('Váratlan hiba történt az ajándékkód ellenőrzésekor');
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    if (giftCode) {
      validateGift();
    }
  }, [giftCode]);

  /**
   * Check if user has completed quiz
   */
  useEffect(() => {
    // Check localStorage for recent quiz result
    const recentResultId = localStorage.getItem('recent_quiz_result_id');
    const recentEmail = localStorage.getItem('recent_quiz_email');

    if (recentResultId && recentEmail) {
      setHasQuiz(true);
    }
  }, []);

  /**
   * Handle gift redemption
   */
  const handleRedeem = async () => {
    const resultId = localStorage.getItem('recent_quiz_result_id');
    const email = localStorage.getItem('recent_quiz_email');

    if (!resultId || !email) {
      alert('Előbb ki kell töltened a csakra kvízt! Átirányítunk a főoldalra.');
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/gift/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftCode,
          resultId,
          email,
        }),
      });

      const data = await response.json();

      if (data.data?.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkout_url;
      } else {
        setError(data.error?.message || 'A beváltás sikertelen');
        setLoading(false);
      }
    } catch (err) {
      console.error('[GIFT PAGE] Redemption error:', err);
      setError('Váratlan hiba történt a beváltás során');
      setLoading(false);
    }
  };

  /**
   * Loading state
   */
  if (validating) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <LoadingSpinner size="lg" message="Ajándékkód ellenőrzése..." />
        </div>
      </main>
    );
  }

  /**
   * Invalid gift code
   */
  if (error || !giftData?.valid) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50/80 via-rose-50/60 to-white flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
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
              Érvénytelen Ajándékkód
            </h1>

            <p className="text-gray-600 mb-6">{error || giftData?.message}</p>

            {giftData?.reason === 'not_found' && (
              <p className="text-sm text-gray-500 mb-6">
                Az ajándékkód nem található. Kérlek ellenőrizd, hogy helyesen írtad-e be!
              </p>
            )}

            {giftData?.reason === 'already_redeemed' && (
              <p className="text-sm text-gray-500 mb-6">
                Ez az ajándékkód már be lett váltva. Minden ajándékkód csak egyszer használható fel.
              </p>
            )}

            {giftData?.reason === 'expired' && (
              <p className="text-sm text-gray-500 mb-6">
                Az ajándékkód lejárt. Az ajándékkódok 30 napig érvényesek.
              </p>
            )}

            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-spiritual text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Vissza a Főoldalra
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /**
   * Valid gift - Show redemption UI
   */
  const expiryDate = giftData.expires_at
    ? new Date(giftData.expires_at).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header with Gift Icon */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              🎁
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
              Gratulálunk!
            </h1>
            <p className="text-white/90 text-lg">
              Kaptál egy ajándékot!
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Gift Code Display */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-dashed border-amber-400 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Ajándékkód:</p>
              <p className="text-2xl font-bold text-amber-600 tracking-wider mb-2">
                {giftCode}
              </p>
              <p className="text-xs text-gray-500">
                Érvényes: {expiryDate}-ig
              </p>
            </div>

            {/* Product Info */}
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">
                Az ajándékod tartalma:
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-900 mb-2">
                  {giftData.product_name}
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  {giftData.product_id === 'gift_bundle_full' ? (
                    <>
                      <li>✨ Személyre Szabott AI Csakra Elemzés (PDF)</li>
                      <li>📖 30 Napos Csakra Munkafüzet</li>
                      <li>🎯 Napi Gyakorlatok és Affirmációk</li>
                      <li>📊 Heti Értékelő Lapok</li>
                    </>
                  ) : (
                    <>
                      <li>✨ Személyre Szabott AI Csakra Elemzés (PDF)</li>
                      <li>📊 7 Részletes Csakra Elemzés</li>
                      <li>🔍 Kialakulási Okok Feltárása</li>
                      <li>💡 Személyre Szabott Javaslatok</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Quiz Requirement */}
            {!hasQuiz && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 mb-3">
                  ⚠️ <strong>Fontos:</strong> Az ajándék beváltásához előbb ki kell töltened a csakra kvízt,
                  hogy személyre szabott elemzést készíthessünk számodra!
                </p>
                <button
                  onClick={() => {
                    // Store gift code for later
                    localStorage.setItem('pending_gift_code', giftCode);
                    router.push('/');
                  }}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kvíz Kitöltése Most
                </button>
              </div>
            )}

            {/* Redemption Button */}
            {hasQuiz && (
              <div className="space-y-4">
                <button
                  onClick={handleRedeem}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Beváltás folyamatban...</span>
                    </span>
                  ) : (
                    '🎉 Ajándék Beváltása'
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  A beváltás ingyenes, nem kell fizetned semmit!
                </p>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">
                Hogyan működik?
              </h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Töltsd ki a csakra kvízt (ha még nem tetted)</li>
                <li>2. Kattints az "Ajándék Beváltása" gombra</li>
                <li>3. Az ajándék automatikusan hozzáadódik a fiókodhoz</li>
                <li>4. Azonnal letöltheted a PDF-eket!</li>
              </ol>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Kérdésed van? Írj nekünk:{' '}
            <a
              href="mailto:hello@eredeticsakra.hu"
              className="text-purple-600 hover:underline"
            >
              hello@eredeticsakra.hu
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
