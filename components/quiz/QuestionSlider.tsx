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

const OPTIONS = [
  { value: 1, label: 'Egyáltalán nem jellemző' },
  { value: 2, label: 'Ritkán jellemző' },
  { value: 3, label: 'Gyakran jellemző' },
  { value: 4, label: 'Teljes mértékben jellemző' },
] as const;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.label
              key={option.value}
              className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-current shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              style={{
                borderColor: isSelected ? accentColor : undefined,
                backgroundColor: isSelected ? `${accentColor}10` : undefined,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
                aria-label={option.label}
              />

              <div className="text-center">
                {/* Number Badge */}
                <div
                  className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-gray-400 bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? accentColor : undefined,
                  }}
                >
                  {option.value}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId={`selected-${question.id}`}
                  className="absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: accentColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
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
