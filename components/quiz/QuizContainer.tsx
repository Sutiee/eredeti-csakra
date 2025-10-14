'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChakraName, QuizAnswers, UserInfo } from '@/types';
import { QUESTIONS } from '@/lib/quiz/questions';
import { CHAKRAS } from '@/lib/quiz/chakras';
import ProgressBar from './ProgressBar';
import ChakraSection from './ChakraSection';
import UserInfoForm from './UserInfoForm';
import Button from '@/components/ui/Button';

interface QuizContainerProps {
  onComplete: (answers: QuizAnswers, userInfo: UserInfo) => void;
}

export default function QuizContainer({ onComplete }: QuizContainerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(28).fill(0));
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSections = 7; // 7 chakra sections
  const isUserInfoStep = currentSection === totalSections;
  const currentChakra = !isUserInfoStep ? CHAKRAS[currentSection] : null;

  // Get questions for current chakra section
  const getCurrentQuestions = () => {
    if (isUserInfoStep) return [];
    const startIdx = currentSection * 4;
    return QUESTIONS.slice(startIdx, startIdx + 4);
  };

  // Get answers for current section
  const getCurrentAnswers = () => {
    if (isUserInfoStep) return [];
    const startIdx = currentSection * 4;
    return answers.slice(startIdx, startIdx + 4);
  };

  // Update answer for a specific question
  const handleAnswerChange = (questionIndex: number, value: number) => {
    const globalIndex = currentSection * 4 + questionIndex;
    const newAnswers = [...answers];
    newAnswers[globalIndex] = value;
    setAnswers(newAnswers);
  };

  // Check if current section is complete
  const isSectionComplete = () => {
    if (isUserInfoStep) {
      return userInfo !== null;
    }
    const currentAnswers = getCurrentAnswers();
    return currentAnswers.every(answer => answer > 0);
  };

  // Navigate to next section
  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous section
  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle user info form submission
  const handleUserInfoSubmit = async (info: UserInfo) => {
    setUserInfo(info);
    setIsSubmitting(true);
    try {
      await onComplete(answers as QuizAnswers, info);
    } catch (error) {
      console.error('Quiz submission failed:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar
          currentSection={currentSection}
          totalSections={totalSections}
          chakra={currentChakra}
        />

        {/* Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {!isUserInfoStep ? (
              <motion.div
                key={`section-${currentSection}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChakraSection
                  chakra={currentChakra!}
                  questions={getCurrentQuestions()}
                  answers={getCurrentAnswers()}
                  onAnswerChange={handleAnswerChange}
                />
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

        {/* Navigation */}
        {!isUserInfoStep && (
          <div className="mt-12 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="min-w-[120px]"
            >
              ← Előző
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!isSectionComplete()}
              className="min-w-[120px]"
            >
              {currentSection === totalSections - 1 ? 'Befejezés' : 'Következő'} →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
