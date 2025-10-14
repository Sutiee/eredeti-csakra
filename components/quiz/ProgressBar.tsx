'use client';

import { motion } from 'framer-motion';
import { ChakraMetadata } from '@/types';

interface ProgressBarProps {
  currentQuestionIndex: number; // 0-27
  totalQuestions: number; // 28
  chakras: ChakraMetadata[];
}

export default function ProgressBar({ currentQuestionIndex, totalQuestions, chakras }: ProgressBarProps) {
  // Számítások
  const currentChakraIndex = Math.floor(currentQuestionIndex / 4);
  const questionWithinChakra = (currentQuestionIndex % 4) + 1;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentChakra = chakras[currentChakraIndex];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Section Title */}
      <div className="mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentChakra.color }}
            />
            <h2
              className="text-2xl font-bold"
              style={{ color: currentChakra.color }}
            >
              {currentChakra.name}
            </h2>
            <span className="text-gray-400 text-lg">
              {currentChakra.sanskritName}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            {currentChakra.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <div>
            <span className="font-medium text-gray-700">
              Kérdés {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className="text-gray-400 ml-2">
              • {currentChakra.name}: {questionWithinChakra}/4
            </span>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* Multi-color chakra gradient bar */}
        <div
          className="h-3 bg-gray-100 rounded-full overflow-hidden relative"
          role="progressbar"
          aria-label="Kvíz haladás"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${Math.round(progress)}% teljesítve, ${currentQuestionIndex + 1}. kérdés a ${totalQuestions}-ből`}
        >
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(90deg,
                #DC143C 0%,     /* Root - piros */
                #FF8C00 14.28%, /* Sacral - narancs */
                #FFD700 28.57%, /* Solar - sárga */
                #32CD32 42.85%, /* Heart - zöld */
                #4169E1 57.14%, /* Throat - kék */
                #9370DB 71.42%, /* Third Eye - lila */
                #9400D3 85.71%  /* Crown - ibolya */
              )`,
              width: `${progress}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Chakra Markers */}
        <div className="absolute top-8 left-0 right-0 flex justify-between px-1">
          {chakras.map((chakra, index) => {
            const isCompleted = Math.floor(currentQuestionIndex / 4) > index;
            const isActive = Math.floor(currentQuestionIndex / 4) === index;
            const isUpcoming = Math.floor(currentQuestionIndex / 4) < index;

            return (
              <motion.div
                key={chakra.key}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                  isCompleted
                    ? 'bg-white text-gray-900 border-2 shadow-lg'
                    : isActive
                    ? 'bg-white text-gray-900 border-2 shadow-2xl scale-110'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
                style={{
                  borderColor: isActive ? chakra.color : isCompleted ? chakra.color : undefined,
                  boxShadow: isActive
                    ? `0 0 20px ${chakra.color}80, 0 0 40px ${chakra.color}40, 0 4px 12px rgba(0,0,0,0.2)`
                    : isCompleted
                    ? `0 0 10px ${chakra.color}40, 0 2px 8px rgba(0,0,0,0.1)`
                    : undefined,
                }}
                animate={isActive ? {
                  scale: [1.1, 1.2, 1.1],
                } : {}}
                transition={isActive ? {
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                } : {
                  delay: index * 0.05
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: isCompleted || isActive ? 1.15 : 1.05 }}
              >
                {index + 1}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
