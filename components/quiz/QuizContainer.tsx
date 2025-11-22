'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChakraName, QuizAnswers, UserInfo } from '@/types';
import { QUESTIONS } from '@/lib/quiz/questions';
import { CHAKRAS } from '@/lib/quiz/chakras';
import ProgressBar from './ProgressBar';
import SingleQuestionView from './SingleQuestionView';
import UserInfoForm from './UserInfoForm';
import { useAnalytics } from '@/lib/admin/tracking/client';

interface QuizContainerProps {
  onComplete: (answers: QuizAnswers, userInfo: UserInfo) => void;
  initialUserInfo?: {
    full_name?: string;
    email?: string;
    age?: number;
  };
  welcomeMessage?: string;
  skipUserInfoForm?: boolean; // Skip the user info form and auto-submit
}

// Csakra-specifikus háttér gradiens definíciók
const chakraGradients: Record<number, string> = {
  0: 'from-red-50 via-rose-50 to-white',        // Gyökércsakra
  1: 'from-orange-50 via-amber-50 to-white',    // Szakrális
  2: 'from-yellow-50 via-amber-100 to-white',   // Napfonat
  3: 'from-green-50 via-emerald-50 to-white',   // Szív
  4: 'from-blue-50 via-sky-50 to-white',        // Torok
  5: 'from-purple-50 via-indigo-50 to-white',   // Harmadik szem
  6: 'from-violet-50 via-purple-50 to-white'    // Korona
};

export default function QuizContainer({ onComplete, initialUserInfo, welcomeMessage, skipUserInfoForm }: QuizContainerProps) {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-27
  const [answers, setAnswers] = useState<number[]>(new Array(28).fill(0));
  const [history, setHistory] = useState<number[]>([]); // Vissza gomb történet
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics
  const { trackEvent } = useAnalytics();

  // Check for debug mode (URL param or development env)
  const [isDebugMode, setIsDebugMode] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug') === 'true';
    const isDev = process.env.NODE_ENV === 'development';
    setIsDebugMode(debugParam || isDev);
  }, []);

  // Számított értékek
  const currentChakraIndex = Math.floor(currentQuestionIndex / 4); // 0-6
  const questionWithinChakra = (currentQuestionIndex % 4) + 1; // 1-4
  const currentChakra = CHAKRAS[currentChakraIndex];
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const allQuestionsAnswered = answers.every(a => a > 0);

  // Válasz megváltoztatása
  const handleAnswerChange = (value: number) => {
    // 1. Válasz mentése
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    // 2. Track question answered
    trackEvent('quiz_question_answered', {
      question_index: currentQuestionIndex,
      question_number: currentQuestionIndex + 1,
      chakra: currentChakra.name,
      answer_value: value,
    });

    // 3. Töröld az esetleges korábbi timert
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }

    // 4. Auto-advance 800ms után (csak ha választottál!)
    const timer = setTimeout(() => {
      if (currentQuestionIndex < 27) {
        handleNext();
      } else {
        // Utolsó kérdés után
        setShowUserInfoForm(true);
        if (skipUserInfoForm && initialUserInfo?.full_name && initialUserInfo?.email) {
          // Auto-submit if we have user info and should skip the form
          const userInfo: UserInfo = {
            full_name: initialUserInfo.full_name,
            email: initialUserInfo.email,
            age: initialUserInfo.age,
          };
          handleUserInfoSubmit(userInfo);
        }
      }
    }, 800);

    setAutoAdvanceTimer(timer);
  };

  // Következő kérdésre lépés
  const handleNext = () => {
    if (currentQuestionIndex < 27) {
      // Mentsd az előzményekbe
      setHistory(prev => [...prev, currentQuestionIndex]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentQuestionIndex === 27 && answers[27] > 0) {
      // Utolsó kérdés után
      setShowUserInfoForm(true);
      if (skipUserInfoForm && initialUserInfo?.full_name && initialUserInfo?.email) {
        // Auto-submit if we have user info and should skip the form
        const userInfo: UserInfo = {
          full_name: initialUserInfo.full_name,
          email: initialUserInfo.email,
          age: initialUserInfo.age,
        };
        handleUserInfoSubmit(userInfo);
      }
    }
  };

  // Vissza lépés
  const handleBack = () => {
    // Töröld az auto-advance timert
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
  const handleUserInfoSubmit = async (info: UserInfo) => {
    setIsSubmitting(true);
    try {
      await onComplete(answers as QuizAnswers, info);
    } catch (error) {
      console.error('Quiz submission failed:', error);
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

  // DEBUG: Auto-fill quiz (only in development)
  const handleDebugAutoFill = async () => {
    // Fill all answers with random values (2-4 for variety)
    const randomAnswers = Array.from({ length: 28 }, () => Math.floor(Math.random() * 3) + 2);
    setAnswers(randomAnswers);
    // Jump to user info form
    setShowUserInfoForm(true);

    // Auto-submit if skipUserInfoForm is true (coming from light quiz purchase flow)
    if (skipUserInfoForm && initialUserInfo?.full_name && initialUserInfo?.email) {
      const userInfo: UserInfo = {
        full_name: initialUserInfo.full_name,
        email: initialUserInfo.email,
        age: initialUserInfo.age,
      };
      // Directly call onComplete with randomAnswers (not the state, which hasn't updated yet)
      setIsSubmitting(true);
      try {
        await onComplete(randomAnswers as QuizAnswers, userInfo);
      } catch (error) {
        console.error('Quiz submission failed:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${chakraGradients[currentChakraIndex]} transition-colors duration-1000 py-8 px-4 relative overflow-hidden`}>
      {/* Ambient gradient orbs - csakra színekkel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Nagy gömb - jobb felső */}
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

        {/* Kisebb gömb - bal alsó */}
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

        {/* Extra kis gömb - jobb alsó */}
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

      {/* DEBUG: Auto-fill button (debug mode or development) */}
      {isDebugMode && !showUserInfoForm && (
        <button
          onClick={handleDebugAutoFill}
          className="fixed top-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
          title="Gyors teszt: Automatikus kitöltés random válaszokkal"
        >
          🚀 Gyors Teszt
        </button>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Bar */}
        {!showUserInfoForm && (
          <ProgressBar
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={28}
            chakras={CHAKRAS}
          />
        )}

        {/* Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {!showUserInfoForm ? (
              <SingleQuestionView
                key={`question-${currentQuestionIndex}`}
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={28}
                questionWithinChakra={questionWithinChakra}
                chakra={currentChakra}
                value={answers[currentQuestionIndex]}
                onAnswerChange={handleAnswerChange}
                canGoBack={history.length > 0}
                onBack={handleBack}
                onNext={handleNext}
              />
            ) : skipUserInfoForm && initialUserInfo?.full_name && initialUserInfo?.email ? (
              // Auto-submitting - show loading state instead of form
              <motion.div
                key="auto-submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
              >
                <div className="animate-spin w-12 h-12 border-4 border-spiritual-purple-200 border-t-spiritual-purple-600 rounded-full mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Eredményed feldolgozása...
                </h2>
                <p className="text-gray-600">
                  Kérlek várj, amíg elkészítjük a személyre szabott elemzésedet.
                </p>
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
                  initialValues={initialUserInfo}
                  welcomeMessage={welcomeMessage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
