'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo } from '@/types';
import { LIGHT_QUESTIONS, TOTAL_LIGHT_QUESTIONS } from '@/lib/quiz/light-questions';
import { CHAKRAS } from '@/lib/quiz/chakras';
import UserInfoForm from '@/components/quiz/UserInfoForm';
import QuestionSlider from '@/components/quiz/QuestionSlider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { useAnalytics } from '@/lib/admin/tracking/client';

// Chakra-specific background gradient definitions
const chakraGradients: Record<number, string> = {
  0: 'from-red-50 via-rose-50 to-white',        // Gyokercsakra
  1: 'from-orange-50 via-amber-50 to-white',    // Szakralis
  2: 'from-yellow-50 via-amber-100 to-white',   // Napfonat
  3: 'from-green-50 via-emerald-50 to-white',   // Sziv
  4: 'from-blue-50 via-sky-50 to-white',        // Torok
  5: 'from-purple-50 via-indigo-50 to-white',   // Harmadik szem
  6: 'from-violet-50 via-purple-50 to-white'    // Korona
};

export default function LightQuizPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-6
  const [answers, setAnswers] = useState<number[]>(new Array(TOTAL_LIGHT_QUESTIONS).fill(0));
  const [history, setHistory] = useState<number[]>([]);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);

  // Debug mode
  const [isDebugMode, setIsDebugMode] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug') === 'true';
    const isDev = process.env.NODE_ENV === 'development';
    setIsDebugMode(debugParam || isDev);
  }, []);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view', { page_path: '/kviz/light', page_name: 'light_quiz' });
    trackEvent('light_quiz_started');
  }, [trackEvent]);

  // Track abandonment on unmount (if quiz not completed)
  useEffect(() => {
    return () => {
      if (!isSubmitting) {
        trackEvent('light_quiz_abandoned');
      }
    };
  }, [trackEvent, isSubmitting]);

  // Current question data
  const currentQuestion = LIGHT_QUESTIONS[currentQuestionIndex];
  const currentChakra = CHAKRAS[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerChange = (value: number) => {
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    // Track question answered
    trackEvent('light_quiz_question_answered', {
      question_index: currentQuestionIndex,
      question_number: currentQuestionIndex + 1,
      chakra: currentChakra.name,
      answer_value: value,
    });

    // Clear any existing timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }

    // Auto-advance after 800ms
    const timer = setTimeout(() => {
      if (currentQuestionIndex < TOTAL_LIGHT_QUESTIONS - 1) {
        handleNext();
      } else {
        // Last question - show user info form
        setShowUserInfoForm(true);
      }
    }, 800);

    setAutoAdvanceTimer(timer);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < TOTAL_LIGHT_QUESTIONS - 1) {
      setHistory(prev => [...prev, currentQuestionIndex]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentQuestionIndex === TOTAL_LIGHT_QUESTIONS - 1 && answers[TOTAL_LIGHT_QUESTIONS - 1] > 0) {
      setShowUserInfoForm(true);
    }
  };

  // Navigate to previous question
  const handleBack = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (history.length > 0) {
      const previousIndex = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentQuestionIndex(previousIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle user info form submission
  const handleUserInfoSubmit = async (userInfo: UserInfo) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const requestBody = {
        name: userInfo.full_name,
        email: userInfo.email,
        age: userInfo.age || undefined,
        answers,
      };

      console.log('Submitting light quiz:', requestBody);

      const response = await fetch('/api/submit-light-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Hiba tortent a kviz bekuldesee soran');
      }

      const data = await response.json();

      // Track quiz completion
      trackEvent('light_quiz_completed', { result_id: data.data?.id });

      // Redirect to preliminary result page
      if (data.data?.id) {
        setTimeout(() => {
          router.push(`/elozetes-eredmeny/${data.data.id}`);
        }, 500);
      } else {
        throw new Error('Nincs eredmeny azonosito');
      }
    } catch (err) {
      console.error('Light quiz submission error:', err);
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba tortent');
      setIsSubmitting(false);
    }
  };

  // Timer cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  // Debug auto-fill
  const handleDebugAutoFill = () => {
    const randomAnswers = Array.from({ length: TOTAL_LIGHT_QUESTIONS }, () => Math.floor(Math.random() * 3) + 2);
    setAnswers(randomAnswers);
    setShowUserInfoForm(true);
  };

  // Get chakra symbol
  const getChakraSymbol = (position: number): string => {
    const symbols: Record<number, string> = {
      1: '🔴',
      2: '🟠',
      3: '🟡',
      4: '💚',
      5: '🔵',
      6: '🟣',
      7: '⚪',
    };
    return symbols[position] || '✨';
  };

  return (
    <main className="min-h-screen relative">
      {/* Error Toast */}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <LoadingSpinner size="lg" message="Csakraid elemzese folyamatban..." />
            <p className="text-center text-gray-500 text-sm mt-4">
              Kerlek varj, amig kiszamitjuk az elozetese eredmenyeidet
            </p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-to-br ${chakraGradients[currentQuestionIndex]} transition-colors duration-1000 py-8 px-4 relative overflow-hidden`}>
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{
              backgroundColor: currentChakra.color,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{
              backgroundColor: currentChakra.color,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-32 right-1/4 w-48 h-48 rounded-full blur-2xl opacity-15"
            style={{
              backgroundColor: currentChakra.color,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        {/* Debug auto-fill button */}
        {isDebugMode && !showUserInfoForm && (
          <button
            onClick={handleDebugAutoFill}
            className="fixed top-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
            title="Gyors teszt: Automatikus kitoltes random valaszokkal"
          >
            Gyors Teszt
          </button>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Progress indicator */}
          {!showUserInfoForm && (
            <div className="mb-8">
              <div className="flex justify-center items-center gap-2 mb-4">
                {Array.from({ length: TOTAL_LIGHT_QUESTIONS }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index < currentQuestionIndex
                        ? 'bg-spiritual-purple-500'
                        : index === currentQuestionIndex
                        ? 'bg-current scale-125'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      backgroundColor: index === currentQuestionIndex ? currentChakra.color : undefined,
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-gray-600 font-medium">
                Kerdes {currentQuestionIndex + 1}/{TOTAL_LIGHT_QUESTIONS}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {!showUserInfoForm ? (
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto"
                >
                  {/* Chakra Header */}
                  <div className="mb-8 text-center">
                    <motion.div
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg mb-4"
                      style={{
                        backgroundColor: `${currentChakra.color}15`,
                        border: `2px solid ${currentChakra.color}`,
                        boxShadow: `0 0 30px ${currentChakra.color}30`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 20px ${currentChakra.color}30`,
                          `0 0 40px ${currentChakra.color}50`,
                          `0 0 20px ${currentChakra.color}30`,
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                        style={{ backgroundColor: currentChakra.color }}
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentChakra.position}
                      </motion.div>
                      <div className="text-left">
                        <h2 className="text-lg font-semibold text-gray-900">{currentChakra.name}</h2>
                        <p className="text-sm text-gray-600">{currentChakra.sanskritName}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Question Card */}
                  <motion.div
                    className="bg-white rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden"
                    style={{
                      boxShadow: `0 0 60px ${currentChakra.color}15, 0 20px 40px rgba(0,0,0,0.08)`,
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Gradient overlay */}
                    <div
                      className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none"
                      style={{
                        background: `linear-gradient(180deg, ${currentChakra.color} 0%, transparent 100%)`,
                      }}
                    />

                    {/* Chakra symbol watermark */}
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5 pointer-events-none select-none"
                      style={{ color: currentChakra.color }}
                    >
                      {getChakraSymbol(currentChakra.position)}
                    </div>

                    <QuestionSlider
                      question={currentQuestion}
                      questionNumber={currentQuestionIndex + 1}
                      value={answers[currentQuestionIndex]}
                      onChange={handleAnswerChange}
                      accentColor={currentChakra.color}
                    />
                  </motion.div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between gap-4">
                    <motion.button
                      onClick={handleBack}
                      disabled={history.length === 0}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        history.length > 0
                          ? 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={history.length > 0 ? { scale: 1.05 } : {}}
                      whileTap={history.length > 0 ? { scale: 0.95 } : {}}
                    >
                      Vissza
                    </motion.button>

                    <motion.button
                      onClick={handleNext}
                      disabled={answers[currentQuestionIndex] === 0}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        answers[currentQuestionIndex] > 0
                          ? 'text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      style={{
                        background: answers[currentQuestionIndex] > 0 ? `linear-gradient(135deg, ${currentChakra.color}, ${currentChakra.color}dd)` : undefined,
                      }}
                      whileHover={answers[currentQuestionIndex] > 0 ? { scale: 1.05 } : {}}
                      whileTap={answers[currentQuestionIndex] > 0 ? { scale: 0.95 } : {}}
                    >
                      {currentQuestionIndex === TOTAL_LIGHT_QUESTIONS - 1 ? 'Befejezese' : 'Kovetkezo'}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserInfoForm
                    onSubmit={handleUserInfoSubmit}
                    disabled={isSubmitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
