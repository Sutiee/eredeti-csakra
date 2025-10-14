'use client';

import { Question } from '@/types';
import { motion } from 'framer-motion';

interface QuestionSliderProps {
  question: Question;
  questionNumber: number;
  value: number;
  onChange: (value: number) => void;
  accentColor: string;
}

export default function QuestionSlider({
  question,
  questionNumber,
  value,
  onChange,
  accentColor,
}: QuestionSliderProps) {
  return (
    <div className="group">
      {/* Question Text */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-start gap-3">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: accentColor }}
          >
            {questionNumber}
          </span>
          <span className="flex-1">{question.text}</span>
        </h4>
      </div>

      {/* Radio Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="radiogroup" aria-label={question.text}>
        {question.options.map((option, index) => {
          const isSelected = value === option.score;
          return (
            <motion.label
              key={option.score}
              className={`relative flex items-center justify-center p-4 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'scale-105 shadow-2xl'
                  : 'hover:shadow-lg'
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}30)`
                  : 'white',
                border: `2px solid ${isSelected ? accentColor : '#e5e7eb'}`,
                boxShadow: isSelected
                  ? `0 0 30px ${accentColor}40, 0 10px 20px rgba(0,0,0,0.1)`
                  : '0 2px 8px rgba(0,0,0,0.05)',
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 0 20px ${accentColor}30, 0 8px 16px rgba(0,0,0,0.08)`,
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Belső glow kiválasztásnál */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl blur-md pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}35)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Külső pulzáló gyűrű kiválasztásnál */}
              {isSelected && (
                <motion.div
                  className="absolute -inset-1 rounded-xl pointer-events-none"
                  style={{
                    border: `3px solid ${accentColor}`,
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.score}
                checked={isSelected}
                onChange={() => onChange(option.score)}
                className="sr-only"
                aria-label={option.label}
                tabIndex={0}
              />

              {/* Szám badge */}
              <div
                className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: isSelected ? accentColor : '#f3f4f6',
                }}
              >
                {option.score}
              </div>

              {/* Label szöveg */}
              <span
                className={`text-center font-medium relative z-10 ${
                  isSelected ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {option.label}
              </span>
            </motion.label>
          );
        })}
      </div>

      {/* Required Indicator */}
      {value === 0 && (
        <p className="mt-2 text-sm text-gray-400 italic">
          * Kötelező kérdés
        </p>
      )}
    </div>
  );
}
