'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Pre-Quiz Ritual Page
 * URL: /kviz/bevezeto
 *
 * Purpose: Create a calming, focused state before the quiz
 * Features:
 * - Breathing circle animation (4s cycle)
 * - Sequential text fade-in
 * - 5-second delayed button activation
 * - Smooth transition to quiz
 */

function DelayedButton({
  delay,
  children,
  onReady
}: {
  delay: number;
  children: React.ReactNode;
  onReady: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(delay / 1000);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsReady(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <button
      disabled={!isReady}
      onClick={onReady}
      className={`px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300 ${
        isReady
          ? 'bg-white text-purple-900 hover:scale-105 shadow-2xl cursor-pointer'
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isReady ? children : `Gomb aktív lesz ${secondsLeft} másodperc múlva...`}
    </button>
  );
}

export default function PreQuizRitualPage() {
  const router = useRouter();

  const handleReady = () => {
    router.push('/kviz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient noise texture */}
      <div className="absolute inset-0 bg-black/5 opacity-50" />

      {/* Breathing Circle Animation */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Sequential Fade-in Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-4xl md:text-5xl font-serif font-bold text-white mb-8"
        >
          Vegyél egy mély levegőt...
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="text-2xl md:text-3xl text-purple-100 mb-4"
        >
          ...és engedd ki lassan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="text-xl text-purple-200 mb-12 leading-relaxed"
        >
          <p className="mb-4">A következő percek csak rólad szólnak.</p>
          <p>Légy őszinte magadhoz.</p>
        </motion.div>

        {/* Delayed Button (5 seconds) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, duration: 0.6 }}
        >
          <DelayedButton delay={5000} onReady={handleReady}>
            Készen állsz?
          </DelayedButton>
        </motion.div>
      </div>
    </div>
  );
}
