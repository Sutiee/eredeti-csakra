/**
 * Gift Code Input Component
 * Allows users to redeem gift codes from the result page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type GiftCodeInputProps = {
  resultId: string;
  email: string;
};

export default function GiftCodeInput({ resultId, email }: GiftCodeInputProps): JSX.Element {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!giftCode.trim()) {
      setError('Kérlek add meg az ajándékkódot');
      return;
    }

    // Format code (uppercase, remove spaces)
    const formattedCode = giftCode.trim().toUpperCase();

    if (!formattedCode.startsWith('GIFT-')) {
      setError('Az ajándékkód GIFT- kezdetű kell legyen');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate gift code first
      const validateResponse = await fetch(`/api/gift/validate?code=${formattedCode}`);
      const validateData = await validateResponse.json();

      if (!validateData.data?.valid) {
        setError(validateData.data?.message || 'Az ajándékkód érvénytelen');
        setLoading(false);
        return;
      }

      // Redeem gift code
      const redeemResponse = await fetch('/api/gift/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftCode: formattedCode,
          resultId,
          email,
        }),
      });

      const redeemData = await redeemResponse.json();

      if (redeemData.data?.checkout_url) {
        // Success! Show success message then redirect
        setSuccess(true);

        setTimeout(() => {
          window.location.href = redeemData.data.checkout_url;
        }, 1500);
      } else {
        setError(redeemData.error?.message || 'A beváltás sikertelen');
        setLoading(false);
      }
    } catch (err) {
      console.error('[GIFT CODE] Error:', err);
      setError('Váratlan hiba történt. Kérlek próbáld újra később.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">🎁</div>
        <div className="flex-1">
          <h3 className="text-xl font-serif font-bold text-amber-900 mb-2">
            Van ajándékkódod?
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            Ha kaptál ajándékba egy csakra elemzést vagy munkafüzetet, itt tudod beváltani!
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => {
                  setGiftCode(e.target.value);
                  setError(null);
                }}
                placeholder="GIFT-ABC123XY"
                disabled={loading || success}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono tracking-wider"
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-sm text-red-600 mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    ❌ {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p
                    className="text-sm text-green-600 mt-2 font-semibold"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    ✅ Sikeres beváltás! Átirányítunk...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Beváltás...
                </span>
              ) : success ? (
                '✅ Sikeres!'
              ) : (
                '🎉 Ajándék Beváltása'
              )}
            </button>
          </form>

          <p className="text-xs text-amber-700 mt-3 text-center">
            Az ajándékkódok 30 napig érvényesek és csak egyszer használhatók fel.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
