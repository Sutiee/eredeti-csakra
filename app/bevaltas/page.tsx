/**
 * Gift Redemption Page - /bevaltas
 *
 * Handles gift code redemption in two modes:
 * 1. Direct redirect: /bevaltas?code=GIFT-XXX → redirects to /ajandek/GIFT-XXX
 * 2. Code input form: User manually enters code → redirects to /ajandek/[code]
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function BevaltasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [giftCode, setGiftCode] = useState('');
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect if code is in URL query params
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setIsRedirecting(true);
      // Redirect to /ajandek/[code] page
      router.push(`/ajandek/${codeParam}`);
    }
  }, [searchParams, router]);

  /**
   * Handle gift code submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate gift code format
    const trimmedCode = giftCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Kérlek add meg az ajándék kódot!');
      return;
    }

    // Basic format validation (GIFT-XXXXXXXX)
    if (!trimmedCode.startsWith('GIFT-') || trimmedCode.length !== 13) {
      setError('Érvénytelen kód formátum. Az ajándék kód formátuma: GIFT-XXXXXXXX');
      return;
    }

    // Redirect to gift redemption page
    setIsRedirecting(true);
    router.push(`/ajandek/${trimmedCode}`);
  };

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-900 text-lg font-semibold">Átirányítás...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            🎁
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-purple-900 mb-3">
            Ajándék Beváltás
          </h1>
          <p className="text-purple-700 text-lg">
            Add meg az ajándék kódot a beváltáshoz
          </p>
        </div>

        {/* Redemption Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gift Code Input */}
            <div>
              <label
                htmlFor="giftCode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Ajándék Kód
              </label>
              <input
                type="text"
                id="giftCode"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                placeholder="GIFT-XXXXXXXX"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-center text-lg font-mono tracking-wider"
                maxLength={13}
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                A kód formátuma: GIFT-XXXXXXXX
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-red-800 font-semibold">❌ {error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              🎁 Beváltom az Ajándékot
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t-2 border-purple-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              💡 Segítség
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Az ajándék kódot emailben kaptad meg</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>A kód 30 napig érvényes a kiállítástól számítva</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Először ki kell töltened a csakra kvízt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Ezután azonnal hozzáférhetsz az ajándék termékekhez</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Kérdésed van?{' '}
            <a
              href="/"
              className="text-purple-600 font-semibold hover:underline"
            >
              Vissza a főoldalra
            </a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function BevaltasPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-900 text-lg font-semibold">Betöltés...</p>
        </div>
      </main>
    }>
      <BevaltasContent />
    </Suspense>
  );
}
