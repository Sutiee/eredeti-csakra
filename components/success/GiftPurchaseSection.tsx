/**
 * Gift Purchase Section Component
 * Inline gift purchase flow on success page
 * Shows compact offer initially, expands to delivery panel after purchase
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/lib/admin/tracking/client';
import { getPrice, calculateGiftDiscount, getCurrentVariant } from '@/lib/pricing/variants';

type GiftPurchaseSectionProps = {
  sessionId: string;
  resultId: string;
  workbookPurchased: boolean; // Determines which gift product to show
};

type PurchaseState = 'offer' | 'purchasing' | 'success';

type GiftData = {
  giftCode: string;
  expiresAt: string;
  productName: string;
};

export default function GiftPurchaseSection({
  sessionId,
  resultId,
  workbookPurchased,
}: GiftPurchaseSectionProps) {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('offer');
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const { trackEvent } = useAnalytics();

  // Get current variant and determine which gift product to offer
  const variant = getCurrentVariant();
  const productId = workbookPurchased ? 'gift_bundle_full' : 'gift_ai_only';
  const giftPrice = getPrice(productId, variant);
  const discountPercent = calculateGiftDiscount(productId, variant);

  // Product details based on what user purchased
  const productName = workbookPurchased
    ? 'AI Elemzés + 30 Napos Munkafüzet Ajándék Csomag'
    : 'AI Elemzés Ajándék';

  const originalPrice = workbookPurchased
    ? getPrice('ai_analysis_pdf', variant) + getPrice('workbook_30day', variant)
    : getPrice('ai_analysis_pdf', variant);

  /**
   * Handle gift purchase
   */
  const handlePurchase = async () => {
    try {
      setPurchaseState('purchasing');
      setError(null);

      trackEvent('gift_purchase_initiated', {
        result_id: resultId,
        session_id: sessionId,
        product_id: productId,
        workbook_purchased: workbookPurchased,
      });

      const response = await fetch('/api/upsell/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          resultId,
          upsellProductId: productId,
          recipientEmail: undefined, // Not collected yet
          giftMessage: undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fizetési hiba történt');
      }

      // Success!
      setGiftData({
        giftCode: data.gift_code,
        expiresAt: data.expires_at,
        productName: data.product_name,
      });
      setPurchaseState('success');

      trackEvent('gift_purchased', {
        result_id: resultId,
        session_id: sessionId,
        product_id: productId,
        amount: giftPrice,
        gift_code: data.gift_code,
      });
    } catch (err) {
      console.error('Gift purchase error:', err);
      setError(err instanceof Error ? err.message : 'Váratlan hiba történt');
      setPurchaseState('offer');

      trackEvent('gift_purchase_error', {
        result_id: resultId,
        session_id: sessionId,
        product_id: productId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  /**
   * Copy gift code to clipboard
   */
  const handleCopyCode = async () => {
    if (!giftData) return;

    try {
      const textToCopy = `Ajándék kód: ${giftData.giftCode}\n\nBeváltás: https://eredeticsakra.hu/bevaltas\n\nLejárat: ${new Date(giftData.expiresAt).toLocaleDateString('hu-HU')}`;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      trackEvent('gift_code_copied', {
        result_id: resultId,
        gift_code: giftData.giftCode,
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  /**
   * Send gift code via email to recipient
   */
  const handleSendEmail = async () => {
    if (!giftData || !recipientEmail) return;

    try {
      setSendingEmail(true);
      setError(null);

      const response = await fetch('/api/send-gift-code-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          giftCode: giftData.giftCode,
          productName: giftData.productName,
          expiresAt: giftData.expiresAt,
          senderName: 'Ajándékozó', // Could be made dynamic
        }),
      });

      if (!response.ok) {
        throw new Error('Email küldése sikertelen');
      }

      setEmailSent(true);
      trackEvent('gift_email_sent', {
        result_id: resultId,
        gift_code: giftData.giftCode,
        recipient_email: recipientEmail,
      });

      // Clear input after success
      setTimeout(() => {
        setRecipientEmail('');
        setEmailSent(false);
      }, 3000);
    } catch (err) {
      console.error('Email send error:', err);
      setError('Email küldése sikertelen. Próbáld újra vagy másold ki a kódot!');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <AnimatePresence mode="wait">
        {(purchaseState === 'offer' || purchaseState === 'purchasing') && (
          <motion.div
            key="offer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border-2 border-purple-200"
          >
            {/* Offer Header */}
            <div className="text-center mb-6">
              <h3 className="text-3xl font-serif font-bold text-purple-900 mb-2">
                🎁 Ajándékozz spirituális fejlődést!
              </h3>
              <p className="text-purple-700 text-lg">
                Oszd meg szeretteddel ezt az élményt
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🎁</div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">
                    {productName}
                  </h4>

                  {workbookPurchased ? (
                    <ul className="space-y-2 text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✨</span>
                        <span>20+ oldalas személyre szabott AI elemzés PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">📘</span>
                        <span>30 napos gyakorlati munkafüzet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">🧘</span>
                        <span>Napi meditációs scriptek és journaling</span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-2 text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✨</span>
                        <span>20+ oldalas személyre szabott AI elemzés PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">🔮</span>
                        <span>7 csakra részletes diagnosztikája</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">💡</span>
                        <span>Konkrét gyakorlatok minden csakrára</span>
                      </li>
                    </ul>
                  )}

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-purple-600">
                      {giftPrice.toLocaleString('hu-HU')} Ft
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {originalPrice.toLocaleString('hu-HU')} Ft
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discountPercent}% 🔥
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6 text-center">
              <p className="text-purple-900 font-semibold">
                💝 Tökéletes ajándék családtagnak vagy barátnőnek aki a spirituális utat járja
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-red-800 font-semibold">❌ {error}</p>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handlePurchase}
              disabled={purchaseState === 'purchasing'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purchaseState === 'purchasing' ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Feldolgozás...</span>
                </>
              ) : (
                <span>🎁 AJÁNDÉKBA VESZEM!</span>
              )}
            </button>

            {/* Trust Indicators */}
            <p className="text-center text-sm text-gray-500 mt-4">
              ⚡ Nincs új fizetési adat megadása • 🔒 Biztonságos fizetés
            </p>
          </motion.div>
        )}

        {purchaseState === 'success' && giftData && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border-2 border-green-200"
          >
            {/* Success Header */}
            <div className="text-center mb-6">
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

              <h3 className="text-3xl font-bold text-green-600 mb-2">
                Sikeres vásárlás! 🎉
              </h3>
              <p className="text-green-700 text-lg">
                Az ajándékod készen áll, most már csak át kell adnod!
              </p>
            </div>

            {/* Gift Code Display */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <div className="text-center mb-4">
                <p className="text-gray-600 mb-2 font-semibold">Az ajándék kódod:</p>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-3">
                  <p className="text-3xl font-bold text-purple-900 tracking-wider font-mono">
                    {giftData.giftCode}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Lejárat: {new Date(giftData.expiresAt).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyCode}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Másolva!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Kód másolása</span>
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                📝 Hogyan add át az ajándékot?
              </h4>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </span>
                  <span>
                    <strong>Küldd el emailben:</strong> Add meg az ajándékozott email címét alább,
                    és mi elküldjük neki a kódot és a beváltási útmutatót
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </span>
                  <span>
                    <strong>Vagy másold ki:</strong> Használd a "Kód másolása" gombot és küldd el
                    személyesen (WhatsApp, SMS, stb.)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </span>
                  <span>
                    <strong>Beváltás:</strong> A címzett a kódot az{' '}
                    <a
                      href="https://eredeticsakra.hu/bevaltas"
                      className="text-purple-600 underline font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      eredeticsakra.hu/bevaltas
                    </a>{' '}
                    oldalon tudja beváltani
                  </span>
                </li>
              </ol>
            </div>

            {/* Email Sending Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                ✉️ Küldés emailben
              </h4>
              <p className="text-gray-600 mb-4 text-sm">
                Add meg az ajándékozott email címét, és mi elküldjük neki a kódot
              </p>

              <div className="flex gap-3">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="ajandekozott@email.hu"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  disabled={sendingEmail || emailSent}
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!recipientEmail || sendingEmail || emailSent}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {sendingEmail ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Küldés...</span>
                    </>
                  ) : emailSent ? (
                    <>
                      <span>✓</span>
                      <span>Elküldve!</span>
                    </>
                  ) : (
                    <span>Küldés</span>
                  )}
                </button>
              </div>

              {emailSent && (
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ✓ Email sikeresen elküldve!
                </p>
              )}
            </div>

            {/* Confirmation Email Note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                📧 A vásárlás megerősítését és az ajándék kódot emailben is megkapod
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
