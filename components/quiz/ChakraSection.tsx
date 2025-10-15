'use client';

import { motion } from 'framer-motion';
import { ChakraMetadata, Question } from '@/types';
import QuestionSlider from './QuestionSlider';

interface ChakraSectionProps {
  chakra: ChakraMetadata;
  questions: Question[];
  answers: number[];
  onAnswerChange: (questionIndex: number, value: number) => void;
}

export default function ChakraSection({
  chakra,
  questions,
  answers,
  onAnswerChange,
}: ChakraSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl p-8 border-t-4"
      style={{ borderColor: chakra.color }}
    >
      {/* Chakra Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: chakra.color }}
          >
            <span className="text-white text-2xl font-bold">{chakra.position}</span>
          </div>
          <div>
            <h3
              className="text-3xl font-bold"
              style={{ color: chakra.color }}
            >
              {chakra.name}
            </h3>
            <p className="text-gray-500 text-sm">{chakra.sanskritName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Elem:</span>
            <span className="ml-2 font-medium">{chakra.element}</span>
          </div>
          <div>
            <span className="text-gray-500">Pozíció:</span>
            <span className="ml-2 font-medium">{chakra.location}</span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuestionSlider
              question={question}
              questionNumber={index + 1}
              value={answers[index]}
              onChange={(value) => onAnswerChange(index, value)}
              accentColor={chakra.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Completion Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Kitöltött kérdések ebben a szekcióban:
          </span>
          <span
            className="font-bold text-lg"
            style={{ color: chakra.color }}
          >
            {answers.filter(a => a > 0).length} / {questions.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
