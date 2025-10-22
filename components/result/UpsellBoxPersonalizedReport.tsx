"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UpsellBoxPersonalizedReportProps {
  resultId: string;
  email: string;
  onCtaClick?: () => void;
}

/**
 * UpsellBoxPersonalizedReport Component
 *
 * Promotional upsell box for the personalized report on the result page.
 * Features:
 * - Bold emotional hook ("Ez még csak a jéghegy csúcsa!")
 * - Clear value proposition with checkmarks
 * - Strikethrough pricing (7,990 Ft → 990 Ft)
 * - Prominent CTA with fire emoji
 * - Purple gradient background for brand consistency
 * - Direct Stripe checkout (bypasses cart/checkout page)
 */
export default function UpsellBoxPersonalizedReport({
  resultId,
  email,
  onCtaClick,
}: UpsellBoxPersonalizedReportProps): JSX.Element {
  const router = useRouter();

  const handleCtaClick = async (): Promise<void> => {
    // Call analytics callback if provided
    if (onCtaClick) {
      onCtaClick();
    }

    // DIRECT STRIPE CHECKOUT - Bypass checkout/cart page
    // Create Stripe Checkout Session and redirect immediately
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: resultId,
          email: email,
          items: [
            {
              productId: 'ai_analysis_pdf',
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        console.error('[UpsellBox] Failed to create checkout session:', data);
        // Fallback to checkout page if API fails
        router.push(`/checkout/${resultId}?product=ai_analysis_pdf`);
      }
    } catch (error) {
      console.error('[UpsellBox] Error creating checkout session:', error);
      // Fallback to checkout page if request fails
      router.push(`/checkout/${resultId}?product=ai_analysis_pdf`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto my-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-spiritual-purple-600 via-spiritual-purple-500 to-spiritual-rose-500 text-white shadow-2xl"
    >
      {/* Emotional Hook */}
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            🔮
          </span>
          <span>Ez még csak a jéghegy csúcsa!</span>
        </h3>
      </div>

      {/* Value Proposition */}
      <div className="mb-6">
        <p className="text-base md:text-lg mb-4 text-center">
          Nézd meg személyre szabott csakráid teljes elemzését, ahol kiderül:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
              ✅
            </span>
            <p className="text-base md:text-lg">
              Milyen <strong>OKOK</strong> állnak a háttérben
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
              ✅
            </span>
            <p className="text-base md:text-lg">
              Mi történik <strong>6 HÓNAP</strong> múlva, ha nem kezeled
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
              ✅
            </span>
            <p className="text-base md:text-lg">
              Következmények <strong>1 ÉV</strong> és <strong>2 ÉV</strong>{" "}
              múlva
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
              ✅
            </span>
            <p className="text-base md:text-lg">
              Konkrét lépések a feloldáshoz
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-2xl md:text-3xl font-bold line-through opacity-70">
            7,990 Ft
          </span>
          <span className="text-3xl md:text-4xl font-black">→</span>
          <span className="text-3xl md:text-4xl font-black">
            Most csak 990 Ft
          </span>
        </div>
        <p className="text-sm opacity-90">
          87% kedvezmény - csak most, a teszteredményed megtekintésekor
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <motion.button
          onClick={handleCtaClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-spiritual-purple-700 font-bold text-lg md:text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          style={{
            boxShadow:
              "0 4px 30px rgba(255, 255, 255, 0.4), 0 2px 12px rgba(255, 255, 255, 0.3)",
          }}
        >
          <span>Megrendelem a Személyre Szabott Elemzést</span>
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            aria-hidden="true"
          >
            🔥
          </motion.span>
        </motion.button>
      </div>

      {/* Trust Signal */}
      <div className="text-center mt-4">
        <p className="text-sm opacity-90">
          ✓ Azonnali hozzáférés | ✓ 14 napos pénzvisszafizetési garancia
        </p>
      </div>
    </motion.div>
  );
}
