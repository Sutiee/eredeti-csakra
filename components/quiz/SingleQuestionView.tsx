'use client';

import { motion } from 'framer-motion';
import { Question, ChakraMetadata } from '@/types';
import QuestionSlider from './QuestionSlider';

interface SingleQuestionViewProps {
  question: Question;
  questionNumber: number;  // 1-28 (display)
  totalQuestions: number;  // 28
  questionWithinChakra: number;  // 1-4
  chakra: ChakraMetadata;
  value: number;  // Current answer (0 = unanswered)
  onAnswerChange: (value: number) => void;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function SingleQuestionView({
  question,
  questionNumber,
  totalQuestions,
  questionWithinChakra,
  chakra,
  value,
  onAnswerChange,
  canGoBack,
  onBack,
  onNext,
}: SingleQuestionViewProps) {
  // Csakra szimbólumok (Unicode karakterek)
  function getChakraSymbol(position: number): string {
    const symbols: Record<number, string> = {
      1: '🔴', // Gyökér - piros kör
      2: '🟠', // Szakrális - narancs kör
      3: '🟡', // Napfonat - sárga kör
      4: '💚', // Szív - zöld szív
      5: '🔵', // Torok - kék kör
      6: '🟣', // Harmadik szem - lila kör
      7: '⚪', // Korona - fehér kör/fény
    };
    return symbols[position] || '✨';
  }

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Csakra Header */}
      <div className="mb-8 text-center">
        <motion.div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg mb-4"
          style={{
            backgroundColor: `${chakra.color}15`,
            border: `2px solid ${chakra.color}`,
            boxShadow: `0 0 30px ${chakra.color}30`,
          }}
          animate={{
            boxShadow: [
              `0 0 20px ${chakra.color}30`,
              `0 0 40px ${chakra.color}50`,
              `0 0 20px ${chakra.color}30`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: chakra.color }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {chakra.position}
          </motion.div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">{chakra.name}</h2>
            <p className="text-sm text-gray-600">{chakra.sanskritName}</p>
          </div>
        </motion.div>

        {/* Haladás mutatók */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="font-medium">
            Kérdés {questionNumber}/{totalQuestions}
          </span>
          <span>•</span>
          <span>
            {chakra.name}: {questionWithinChakra}/4
          </span>
        </div>
      </div>

      {/* Kérdés Card - fejlett design */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden"
        style={{
          boxShadow: `0 0 60px ${chakra.color}15, 0 20px 40px rgba(0,0,0,0.08)`,
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Gradient overlay tetején */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${chakra.color} 0%, transparent 100%)`,
          }}
        />

        {/* Csakra szimbólum vízjel (Unicode) */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5 pointer-events-none select-none"
          style={{ color: chakra.color }}
        >
          {getChakraSymbol(chakra.position)}
        </div>

        <QuestionSlider
          question={question}
          questionNumber={questionNumber}
          value={value}
          onChange={onAnswerChange}
          accentColor={chakra.color}
        />
      </motion.div>

      {/* Navigációs Gombok */}
      <div className="flex justify-between gap-4">
        <motion.button
          onClick={onBack}
          disabled={!canGoBack}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            canGoBack
              ? 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={canGoBack ? { scale: 1.05 } : {}}
          whileTap={canGoBack ? { scale: 0.95 } : {}}
        >
          ← Vissza
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={value === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            value > 0
              ? 'text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          style={{
            background: value > 0 ? `linear-gradient(135deg, ${chakra.color}, ${chakra.color}dd)` : undefined,
          }}
          whileHover={value > 0 ? { scale: 1.05 } : {}}
          whileTap={value > 0 ? { scale: 0.95 } : {}}
        >
          {questionNumber === totalQuestions ? 'Befejezés' : 'Következő'} →
        </motion.button>
      </div>
    </motion.div>
  );
}
