'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generatedTestimonials } from '@/data/generated-testimonials';
import { useAnalytics } from '@/lib/admin/tracking/client';

/**
 * API Response type for light result
 */
type LightResultData = {
  id: string;
  name: string;
  email: string;
  primary_blocked_chakra: string;
  chakra_color: string;
  chakra_metadata: {
    name: string;
    nameEn: string;
    sanskritName: string;
    element: string;
    location: string;
    description: string;
  };
  interpretation: {
    status: string;
    summary: string;
    manifestations: string[];
    first_aid_plan: string;
  };
  light_scores: Record<string, number>;
  created_at: string;
};

type APIResponse = {
  data: LightResultData | null;
  error: {
    message: string;
    code: string;
    details?: unknown;
  } | null;
};

/**
 * Animation variants
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const pulseGlow = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Teaser Result Page - Shown after light quiz
 *
 * Displays:
 * 1. Personalized greeting
 * 2. Primary blocked chakra with color
 * 3. Symptoms/manifestations
 * 4. Emotional hook text
 * 5. CTA to purchase full analysis
 */
export default function TeaserResultPage(): JSX.Element {
  const params = useParams();
  const id = params.id as string;
  const { trackEvent } = useAnalytics();

  const [result, setResult] = useState<LightResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);

  // Fetch light result from API
  useEffect(() => {
    const fetchResult = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/light-result/${id}`);
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
          // Track teaser view event
          trackEvent('teaser_viewed', {
            light_result_id: id,
            primary_blocked_chakra: data.data.primary_blocked_chakra,
          });
        }
      } catch (err: unknown) {
        console.error('[TeaserResultPage] Fetch error:', err);
        setError({
          message: 'Nem sikerült betölteni az eredményt',
          code: 'FETCH_ERROR',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id, trackEvent]);

  // Get a relevant testimonial for social proof
  const getRelevantTestimonial = () => {
    if (!result) return generatedTestimonials[0];

    // Try to find testimonial matching the blocked chakra
    const matching = generatedTestimonials.find(
      (t) => t.chakra === result.primary_blocked_chakra
    );
    return matching || generatedTestimonials[0];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-spiritual-purple-50 to-white">
        <LoadingSpinner message="Eredményed betöltése..." />
      </div>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-spiritual-purple-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto"
          >
            <div className="text-6xl mb-4">!</div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Hiba történt
            </h1>
            <p className="text-gray-600 mb-6">
              {error?.message || 'Nem sikerült betölteni az eredményt'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-spiritual-purple-600 text-white rounded-lg hover:bg-spiritual-purple-700 transition-colors"
            >
              Újrapróbálom
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const testimonial = getRelevantTestimonial();

  // Handle direct checkout - skip checkout page and go straight to Stripe
  const handleCheckout = async (): Promise<void> => {
    if (!result || isCheckoutLoading) return;

    setIsCheckoutLoading(true);

    // Track CTA click
    trackEvent('teaser_cta_clicked', {
      light_result_id: id,
      primary_blocked_chakra: result.primary_blocked_chakra,
    });

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultId: id,
          email: result.email,
          items: [{ productId: 'ai_analysis_pdf', quantity: 1 }],
          light_result_id: id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('[TeaserResultPage] Checkout error:', data.error);
        setError({
          message: data.error?.message || 'Hiba történt a fizetés indításakor',
          code: 'CHECKOUT_ERROR',
        });
        setIsCheckoutLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      console.error('[TeaserResultPage] Checkout fetch error:', err);
      setError({
        message: 'Hiba történt a fizetés indításakor',
        code: 'CHECKOUT_FETCH_ERROR',
      });
      setIsCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-spiritual-purple-50/30 to-white">
      {/* Hero Section with Personalized Greeting */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Kedves {result.name}!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              A gyorsteszted alapján azonosítottuk az energiarendszered fő gyengeségét.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blocked Chakra Display */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Chakra Color Header */}
              <div
                className="relative h-24 md:h-32 flex items-center justify-center"
                style={{ backgroundColor: result.chakra_color }}
              >
                {/* Animated glow effect */}
                <motion.div
                  variants={pulseGlow}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle, ${result.chakra_color}40 0%, transparent 70%)`,
                  }}
                />

                <div className="relative z-10 text-center text-white">
                  <p className="text-sm md:text-base font-medium opacity-90 mb-1">
                    Leginkább blokkolt csakrád
                  </p>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold">
                    {result.primary_blocked_chakra}
                  </h2>
                </div>
              </div>

              {/* Chakra Info */}
              <div className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-2">
                    {result.chakra_metadata.sanskritName} - {result.chakra_metadata.element} elem
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    {result.chakra_metadata.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                  <span
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: result.chakra_color }}
                  >
                    {result.interpretation.status}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-gray-700 text-center leading-relaxed mb-8">
                  {result.interpretation.summary}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Symptoms/Manifestations List */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl mx-auto"
          >
            <motion.h3
              variants={fadeInUp}
              className="text-xl md:text-2xl font-serif font-bold text-gray-900 text-center mb-6"
            >
              Ezekből ismerheted fel:
            </motion.h3>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <ul className="space-y-4">
                {result.interpretation.manifestations.map((manifestation, index) => (
                  <motion.li
                    key={index}
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5"
                      style={{ backgroundColor: result.chakra_color }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">
                      {manifestation}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emotional Hook */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-gradient-to-r from-spiritual-purple-100 to-spiritual-rose-100 rounded-xl p-6 md:p-8">
              <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed">
                Ez a blokk háttérben meghúzódik az életedben, és sok más területre is hatással van.
                A jó hír: tudatos munkával feloldhatod!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Testimonial Snippet */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{testimonial.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {testimonial.name}
                    </span>
                    <span className="text-yellow-500">
                      {'*'.repeat(testimonial.rating)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    &quot;{testimonial.text.substring(0, 150)}...&quot;
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {testimonial.chakra} munkája után - {testimonial.timeframe}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof Number */}
            <div className="text-center">
              <p className="text-gray-600">
                <span className="font-bold text-spiritual-purple-600">2,400+</span> nő már elvégezte a teljes elemzést
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="pb-12 md:pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-spiritual-purple-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-500 p-6 md:p-8 text-center text-white">
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-2">
                  Fedezd fel a teljes képet!
                </h3>
                <p className="opacity-90">
                  Részletes 28 kérdéses elemzés mind a 7 csakrádról
                </p>
              </div>

              {/* Benefits */}
              <div className="p-6 md:p-8">
                <ul className="space-y-3 mb-6">
                  {[
                    'Minden csakrád részletes állapotfelmérése',
                    'Személyre szabott elsősegély terv',
                    'Konkrét gyakorlatok a blokkok feloldásához',
                    'Azonnali PDF letöltés',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-gray-400 line-through text-lg">
                      7 990 Ft
                    </span>
                    <span className="text-3xl md:text-4xl font-bold text-spiritual-purple-600">
                      990 Ft
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Egyszeri fizetés, nincs előfizetés
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`block w-full py-4 px-6 bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-500 text-white text-center text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ${
                    isCheckoutLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isCheckoutLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Átirányítás...
                    </span>
                  ) : (
                    'Megrendelem a teljes elemzést'
                  )}
                </button>

                {/* Trust Badge */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Biztonságos Stripe fizetés
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note - Money Back Guarantee */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-green-800 text-sm font-medium">
                30 napos pénz-visszafizetés garancia
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Ha nem vagy elégedett, visszaadjuk az árát kérdés nélkül.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
