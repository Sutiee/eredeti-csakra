'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChakraSilhouette from '@/components/result/ChakraSilhouette';
import ChakraCards from '@/components/result/ChakraCards';
import { getChakraByName, CHAKRAS } from '@/lib/quiz/chakras';
import type { QuizResultWithInterpretations, ChakraMetadata } from '@/types';
import { useAnalytics } from '@/lib/admin/tracking/client';

/**
 * Helper: Get chakra emoji symbol by position
 */
function getChakraSymbol(position: number): string {
  const symbols: Record<number, string> = {
    1: '🔴', // Root - Red
    2: '🟠', // Sacral - Orange
    3: '🟡', // Solar - Yellow
    4: '💚', // Heart - Green
    5: '🔵', // Throat - Blue
    6: '🟣', // Third Eye - Purple
    7: '⚪', // Crown - White/Violet
  };
  return symbols[position] || '✨';
}

/**
 * Chakra-based background gradients
 */
const chakraBackgrounds: Record<number, string> = {
  1: 'from-red-50/80 via-rose-50/60 to-white',        // Root
  2: 'from-orange-50/80 via-amber-50/60 to-white',    // Sacral
  3: 'from-yellow-50/80 via-amber-100/60 to-white',   // Solar Plexus
  4: 'from-green-50/80 via-emerald-50/60 to-white',   // Heart
  5: 'from-blue-50/80 via-sky-50/60 to-white',        // Throat
  6: 'from-purple-50/80 via-indigo-50/60 to-white',   // Third Eye
  7: 'from-violet-50/80 via-purple-50/60 to-white',   // Crown
};

/**
 * API Response type matching the route structure
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
 * Result Page Component
 * Fetches and displays personalized chakra analysis results
 */
export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [result, setResult] = useState<QuizResultWithInterpretations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  // Analytics
  const { trackEvent } = useAnalytics();

  // Refs for scroll-to functionality
  const chakraCardsRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch result from API
   */
  useEffect(() => {
    const fetchResult = async () => {
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

          // Track result view
          trackEvent('page_view', {
            page_path: `/eredmeny/${id}`,
            page_name: 'result',
          });
          trackEvent('result_viewed', {
            result_id: id,
          });
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError({
          message: 'Hiba történt az eredmény betöltésekor',
          code: 'NETWORK_ERROR',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id, trackEvent]);

  /**
   * Get dominant chakra (most blocked/imbalanced) for dynamic theming
   */
  const getDominantChakra = (): ChakraMetadata => {
    if (!result?.interpretations) return CHAKRAS[3]; // Default: Heart chakra

    // First find blocked chakra
    const blockedChakra = result.interpretations.find((i) => i.level === 'blocked');
    if (blockedChakra) {
      return getChakraByName(blockedChakra.chakra) || CHAKRAS[3];
    }

    // If no blocked, find imbalanced
    const imbalancedChakra = result.interpretations.find((i) => i.level === 'imbalanced');
    if (imbalancedChakra) {
      return getChakraByName(imbalancedChakra.chakra) || CHAKRAS[3];
    }

    // If all balanced, use beautiful purple/pink gradient (Heart chakra)
    return CHAKRAS[3];
  };

  /**
   * Generate summary message based on overall chakra health
   */
  const getSummaryMessage = (): string => {
    if (!result || !result.interpretations || !Array.isArray(result.interpretations)) return '';

    const interpretations = result.interpretations;
    const balancedCount = interpretations.filter((i) => i.level === 'balanced').length;
    const blockedCount = interpretations.filter((i) => i.level === 'blocked').length;

    if (balancedCount === 7) {
      return 'Gratulálunk! Valamennyi csakrád harmonikus állapotban van. Ez ritka és csodálatos egyensúly!';
    } else if (balancedCount >= 5) {
      return 'Nagyszerű eredmény! A legtöbb csakrád egyensúlyban van, csak kisebb finomhangolásra van szükség.';
    } else if (blockedCount >= 4) {
      return 'Úgy tűnik, több csakrád is különös figyelmet igényel. Ne aggódj, ez a tudatosság az első lépés a gyógyulás felé!';
    } else {
      return 'Vegyes kép rajzolódik ki. Van mit dolgozni, de jó úton haladsz! Lássuk részletesen, mi segíthet.';
    }
  };

  /**
   * Retry handler for error state
   */
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by reloading the page
    router.refresh();
  };

  /**
   * Scroll to specific chakra card
   */
  const handleChakraClick = (chakraKey: string) => {
    // Track chakra click
    trackEvent('chakra_clicked', {
      result_id: id,
      chakra_name: chakraKey,
    });

    if (chakraCardsRef.current) {
      const cardElement = chakraCardsRef.current.querySelector(`[data-chakra="${chakraKey}"]`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#9370DB' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: '#DB7093' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative z-10">
          <LoadingSpinner size="lg" message="Eredményed betöltése..." />
        </div>
      </main>
    );
  }

  /**
   * Error State: Not Found (404)
   */
  if (error?.code === 'NOT_FOUND') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#9370DB' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: '#DB7093' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          className="max-w-md w-full text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-spiritual-purple-100">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-spiritual flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>

            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
              Eredmény nem található
            </h1>
            <p className="text-gray-600 mb-6">
              A keresett eredmény nem létezik vagy már nem elérhető. Ellenőrizd a linket, vagy töltsd ki újra a kvízt!
            </p>

            <motion.button
              onClick={() => router.push('/kviz')}
              className="w-full bg-gradient-spiritual text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Kvíz kitöltése
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  /**
   * Error State: Server Error or Network Error
   */
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50/80 via-rose-50/60 to-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#DC143C' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: '#FF8C00' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          className="max-w-md w-full text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-spiritual-purple-100">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-rose-gold flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>

            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
              Hiba történt
            </h1>
            <p className="text-gray-600 mb-6">{error.message}</p>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={handleRetry}
                className="w-full bg-gradient-spiritual text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Újrapróbálkozás
              </motion.button>

              <motion.button
                onClick={() => router.push('/')}
                className="w-full bg-white text-spiritual-purple-600 font-semibold py-3 px-6 rounded-lg border-2 border-spiritual-purple-200 hover:border-spiritual-purple-300 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Vissza a főoldalra
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  /**
   * Success State: Display Result
   */
  if (!result) {
    return null;
  }

  // Calculate dominant chakra for theming
  const dominantChakra = getDominantChakra();

  return (
    <main className={`min-h-screen bg-gradient-to-br ${chakraBackgrounds[dominantChakra.position]} transition-colors duration-1000 relative overflow-hidden`}>
      {/* Ambient gradient orbs - dominant chakra color */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large orb - top right */}
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{
            backgroundColor: dominantChakra.color,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Smaller orb - bottom left */}
        <motion.div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{
            backgroundColor: dominantChakra.color,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Extra small orb - center */}
        <motion.div
          className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full blur-2xl opacity-15"
          style={{
            backgroundColor: dominantChakra.color,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Pulsating Chakra Symbol */}
          <motion.div
            className="text-8xl mb-6 mx-auto"
            style={{ color: dominantChakra.color }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {getChakraSymbol(dominantChakra.position)}
          </motion.div>

          {/* Greeting */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 bg-gradient-spiritual bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Üdv, {result.name}!
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-700 font-serif mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Itt az eredményed
          </motion.p>

          {/* Summary Message */}
          <motion.div
            className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/40 max-w-2xl mx-auto relative overflow-hidden"
            style={{
              boxShadow: `0 0 60px ${dominantChakra.color}10, 0 20px 40px rgba(0,0,0,0.05)`,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute top-0 left-0 right-0 h-24 opacity-5 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${dominantChakra.color} 0%, transparent 100%)`,
              }}
            />
            <p className="text-lg text-gray-700 leading-relaxed relative z-10">{getSummaryMessage()}</p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-sm text-gray-500 mb-2">Görgess tovább a részletekért</p>
            <motion.div
              className="w-6 h-10 mx-auto border-2 border-spiritual-purple-300 rounded-full flex items-start justify-center p-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-1.5 h-1.5 bg-spiritual-purple-400 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Chakra Silhouette Visualization */}
      <section className="container mx-auto px-4 pb-16 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 bg-gradient-spiritual bg-clip-text text-transparent">
            Csakráid állapota
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Kattints a csakra pontokra a részletes értelmezésért
          </p>

          <div
            className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 relative overflow-hidden"
            style={{
              boxShadow: `0 0 60px ${dominantChakra.color}10, 0 20px 40px rgba(0,0,0,0.05)`,
            }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute top-0 left-0 right-0 h-24 opacity-5 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${dominantChakra.color} 0%, transparent 100%)`,
              }}
            />
            <ChakraSilhouette
              chakraScores={result.interpretations}
              onChakraClick={handleChakraClick}
            />
          </div>
        </motion.div>
      </section>

      {/* Chakra Interpretation Cards */}
      <section className="container mx-auto px-4 pb-16 relative z-10" ref={chakraCardsRef}>
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 bg-gradient-spiritual bg-clip-text text-transparent">
            Részletes Értelmezés
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Az alábbi kártyák részletesen bemutatják az egyes csakráid állapotát és javaslatokat adnak a harmonizálásukra
          </p>

          <ChakraCards chakraScores={result.interpretations} />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${dominantChakra.color}, ${dominantChakra.color}dd)`,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Pulsating background overlay */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${dominantChakra.color}80, transparent)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          <div className="relative z-10">
            {/* Action buttons (Save/Copy) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                onClick={() => window.print()}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💾 Eredmény mentése
              </motion.button>

              <motion.button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert('Link vágólapra másolva!');
                }}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔗 Link másolása
              </motion.button>
            </div>

            {/* Main Product Offer */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-900 mb-3 text-center">
                🔮 Mélyíts még tovább!
              </h2>
              <p className="text-gray-700 text-lg mb-6 text-center">
                A kvíz eredményed csak a <strong>felszín</strong>.
                <br />
                Az igazi átalakulás a <strong>részletekben</strong> rejlik.
              </p>

              {/* Product Card */}
              <div className="border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">📄</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      AI Csakra Elemzés PDF
                    </h3>
                    <p className="text-gray-600 mb-4">
                      20+ oldalas AI-generált személyre szabott jelentés
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 mt-1">✨</span>
                    <span>Minden csakrára <strong>részletes elemzés</strong> a pontszámaid alapján</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 mt-1">🎯</span>
                    <span><strong>Konkrét gyakorlati tanácsok</strong> (jóga pózok, affirmációk, kristályok)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 mt-1">💡</span>
                    <span><strong>7 napos akcióterv</strong> a csakra egyensúly visszaállításához</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 mt-1">📈</span>
                    <span>Személyre szabott <strong>meditációs gyakorlatok</strong></span>
                  </li>
                </ul>

                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-4xl font-bold text-purple-600">2990 Ft</span>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Egyszeri fizetés • Azonnali hozzáférés
                  </p>
                </div>

                <motion.button
                  onClick={() => router.push(`/checkout/${id}?product=ai_analysis_pdf`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🚀 Megrendelem az AI Elemzést
                </motion.button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🔒 Biztonságos fizetés • ⚡ Azonnali email küldés
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
