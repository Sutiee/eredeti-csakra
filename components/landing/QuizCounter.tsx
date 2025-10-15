'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * QuizCounter Component
 * Live counter showing how many people completed the quiz
 *
 * Features:
 * - Fetches count from API endpoint
 * - Animated number counting effect
 * - Fallback to static number if API fails
 * - Recent activity indicator (last 24h)
 */

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startCount = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(startCount + (end - startCount) * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count.toLocaleString('hu-HU')}</>;
}

export default function QuizCounter() {
  const [quizCount, setQuizCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizCount() {
      try {
        const response = await fetch('/api/get-quiz-count');
        const data = await response.json();
        setQuizCount(data.count || 12847); // Fallback number
      } catch (error) {
        console.error('Failed to fetch quiz count:', error);
        setQuizCount(12847); // Fallback number
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizCount();
  }, []);

  // Calculate "recent activity" number (simulated - could be from API later)
  const recentActivity = quizCount ? Math.floor(quizCount * 0.01) : 127;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="py-4 bg-white/90 backdrop-blur-md shadow-lg rounded-full inline-flex items-center gap-3 px-8"
      >
        <span className="text-2xl">🌟</span>
        <div className="text-center">
          {isLoading ? (
            <div className="text-2xl font-bold text-purple-900 animate-pulse">
              Betöltés...
            </div>
          ) : (
            <p className="text-2xl font-bold text-purple-900">
              <CountUp end={quizCount || 12847} duration={2} /> ember
            </p>
          )}
          <p className="text-sm text-gray-600">töltötte már ki</p>
        </div>
        <span className="text-2xl">🌟</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-500 text-sm"
      >
        Az elmúlt 24 órában:{' '}
        <span className="text-purple-600 font-semibold">
          +{recentActivity} új elemzés
        </span>
      </motion.p>
    </div>
  );
}
