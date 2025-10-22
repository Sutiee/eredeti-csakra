'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HeroPersonalized from '@/components/result/HeroPersonalized';
import FloatingChakraNav from '@/components/result/FloatingChakraNav';
import ChakraDetailPanel from '@/components/result/ChakraDetailPanel';
import UpsellBoxPersonalizedReport from '@/components/result/UpsellBoxPersonalizedReport';
import TestimonialsGridDynamic from '@/components/result/TestimonialsGridDynamic';
import StatsDynamic from '@/components/result/StatsDynamic';
import FAQAccordion from '@/components/result/FAQAccordion';
import StickyCTA from '@/components/result/StickyCTA';
import type { QuizResultWithInterpretations, ChakraName, ChakraScore } from '@/types';
import { trackEvent as trackAnalyticsEvent } from '@/lib/analytics/track-event';
import { getChakraByName } from '@/lib/quiz/chakras';

/**
 * API Response type
 */
type APIResponse = {
  data: QuizResultWithInterpretations | null;
  error: {
    message: string;
    code: string;
    details?: unknown;
  } | null;
};

/**
 * Result Page Component - v2.1 Complete Redesign
 *
 * New Structure:
 * 1. Hero (Personalized greeting)
 * 2. Tab Navigation (7 chakras with warning icons)
 * 3. Chakra Detail Panel (Összegzés + Megnyilvánulások + Tennivaló)
 * 4. Upsell Box (990 Ft Personal Report)
 * 5. Testimonials Grid (12-15 reviews)
 * 6. Stats (Dynamic social proof)
 * 7. FAQ (7 conversion-focused questions)
 * 8. Sticky CTA (Bottom bar)
 */
export default function ResultPage(): JSX.Element {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<QuizResultWithInterpretations | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);
  const [activeChakra, setActiveChakra] = useState<ChakraName | null>(null);

  /**
   * Fetch result from API
   */
  useEffect(() => {
    const fetchResult = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/result/${id}`);
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

          // Find the most blocked chakra (lowest score)
          const mostBlocked = data.data.interpretations
            .sort((a, b) => a.score - b.score)[0];

          setActiveChakra(mostBlocked.chakra);

          // Track page view
          const chakraMetadata = getChakraByName(mostBlocked.chakra);
          trackAnalyticsEvent(id, 'accordion_open', {
            chakra: mostBlocked.chakra,
            position: (chakraMetadata?.position || 1) - 1,
            is_open: true,
            initial_load: true,
          });
        }
      } catch (err: unknown) {
        console.error('[ResultPage] Fetch error:', err);
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
  }, [id]);

  /**
   * Handle tab change
   */
  const handleTabChange = (chakra: ChakraName): void => {
    setActiveChakra(chakra);

    // Track tab change
    const chakraMetadata = getChakraByName(chakra);
    if (chakraMetadata) {
      trackAnalyticsEvent(id, 'accordion_open', {
        chakra: chakra,
        position: chakraMetadata.position - 1,
        is_open: true,
      });
    }
  };

  /**
   * Handle upsell CTA click
   */
  const handleUpsellClick = (): void => {
    trackAnalyticsEvent(id, 'softupsell_click', {
      position: 'main_upsell_box',
      price: 2990,
      original_price: 12990,
    });
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-spiritual-purple-50 to-white">
        <LoadingSpinner />
      </div>
    );
  }

  /**
   * Error State
   */
  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-spiritual-purple-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto"
          >
            <div className="text-6xl mb-4">⚠️</div>
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

  /**
   * Get active chakra data
   */
  const activeChakraData = result.interpretations.find(
    (c) => c.chakra === activeChakra
  );

  /**
   * Find most blocked chakra
   */
  const mostBlockedChakra = result.interpretations
    .sort((a, b) => a.score - b.score)[0];

  const isTopBlocked = activeChakraData?.chakra === mostBlockedChakra.chakra;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-spiritual-purple-50">
      {/* Hero Section - Personalized Greeting */}
      <section className="pt-16 pb-8">
        <HeroPersonalized name={result.name} />
      </section>

      {/* Floating Chakra Navigation */}
      <FloatingChakraNav
        chakras={result.interpretations}
        activeChakra={activeChakra || mostBlockedChakra.chakra}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area - Above the Fold */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Chakra Detail Panel (Összegzés + Megnyilvánulások + Tennivaló) */}
          {activeChakraData && (
            <motion.div
              key={activeChakra}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <ChakraDetailPanel
                chakra={activeChakraData}
                isTopBlocked={isTopBlocked}
              />
            </motion.div>
          )}

          {/* Upsell Box - 990 Ft Personal Report */}
          <div className="mt-16 mb-16">
            <UpsellBoxPersonalizedReport
              resultId={id}
              onCtaClick={handleUpsellClick}
            />
          </div>
        </div>
      </section>

      {/* Below-the-Fold Content */}

      {/* Testimonials Grid - Social Proof */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <TestimonialsGridDynamic />
      </section>

      {/* Dynamic Stats Bar */}
      <section className="py-8 bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-500">
        <StatsDynamic />
      </section>

      {/* FAQ Accordion - Conversion Focused */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50">
        <FAQAccordion />
      </section>

      {/* Sticky CTA - Always Visible */}
      <StickyCTA
        blockedChakrasCount={
          result.interpretations.filter((c) => c.level === 'blocked').length
        }
        resultId={id}
        onCtaClick={(copyVariant) => {
          trackAnalyticsEvent(id, 'sticky_click', {
            copy_variant: copyVariant,
            blocked_count: result.interpretations.filter(
              (c) => c.level === 'blocked'
            ).length,
          });
        }}
      />
    </main>
  );
}
