'use client';

import { motion } from 'framer-motion';
import { ChakraMetadata } from '@/types';

interface ProgressBarProps {
  currentSection: number;
  totalSections: number;
  chakra: ChakraMetadata | null;
}

export default function ProgressBar({ currentSection, totalSections, chakra }: ProgressBarProps) {
  const progress = ((currentSection + 1) / (totalSections + 1)) * 100;
  const isUserInfoStep = currentSection === totalSections;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Section Title */}
      <div className="mb-4">
        {isUserInfoStep ? (
          <div>
            <h2 className="text-2xl font-bold bg-gradient-spiritual bg-clip-text text-transparent">
              Befejezés
            </h2>
            <p className="text-gray-600 mt-1">
              Még csak néhány személyes adat, és kész!
            </p>
          </div>
        ) : chakra ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: chakra.color }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: chakra.color }}
              >
                {chakra.name}
              </h2>
              <span className="text-gray-400 text-lg">
                {chakra.sanskritName}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {chakra.description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            {isUserInfoStep ? 'Befejezés' : `${currentSection + 1}/${totalSections} Csakra`}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-spiritual"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Chakra Markers */}
        <div className="absolute top-8 left-0 right-0 flex justify-between px-1">
          {Array.from({ length: totalSections }).map((_, idx) => (
            <motion.div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                idx < currentSection
                  ? 'bg-gradient-spiritual text-white shadow-md'
                  : idx === currentSection && !isUserInfoStep
                  ? 'bg-white border-2 text-gray-700 shadow-lg scale-110'
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={{
                borderColor: idx === currentSection && !isUserInfoStep ? chakra?.color : undefined,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {idx + 1}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
