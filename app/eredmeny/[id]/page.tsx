'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChakraSilhouette from '@/components/result/ChakraSilhouette';
import ChakraCards from '@/components/result/ChakraCards';
import type { QuizResultWithInterpretations } from '@/types';

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
  }, [id]);

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
      <main className="min-h-screen bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50 flex items-center justify-center px-4">
        <LoadingSpinner size="lg" message="Eredményed betöltése..." />
      </main>
    );
  }

  /**
   * Error State: Not Found (404)
   */
  if (error?.code === 'NOT_FOUND') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center"
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
      <main className="min-h-screen bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center"
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Element */}
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-spiritual opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

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
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-spiritual-purple-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="text-lg text-gray-700 leading-relaxed">{getSummaryMessage()}</p>
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
      <section className="container mx-auto px-4 pb-16">
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-spiritual-purple-100">
            <ChakraSilhouette
              chakraScores={result.interpretations}
              onChakraClick={handleChakraClick}
            />
          </div>
        </motion.div>
      </section>

      {/* Chakra Interpretation Cards */}
      <section className="container mx-auto px-4 pb-16" ref={chakraCardsRef}>
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
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="max-w-4xl mx-auto bg-gradient-spiritual rounded-3xl p-8 md:p-12 shadow-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Mit szeretnél most?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Mented az eredményed, oszd meg másokkal, vagy fedezd fel a csakraharmonizáló programjainkat!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={() => window.print()}
              className="bg-white text-spiritual-purple-700 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Eredmény mentése
            </motion.button>

            <motion.button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Link vágólapra másolva!');
              }}
              className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Link másolása
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Programok felfedezése
            </motion.button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
