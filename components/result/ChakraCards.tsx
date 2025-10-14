"use client";

import { motion } from "framer-motion";
import type { ChakraScore } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

interface ChakraCardsProps {
  chakraScores: ChakraScore[];
}

/**
 * ChakraCards Component
 * Displays 7 detailed interpretation cards for each chakra with animations
 */
export default function ChakraCards({ chakraScores }: ChakraCardsProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {chakraScores.map((score, index) => (
        <ChakraCard
          key={score.chakra}
          score={score}
          index={index}
        />
      ))}
    </div>
  );
}

interface ChakraCardProps {
  score: ChakraScore;
  index: number;
}

/**
 * Helper: Get chakra symbol emoji by position
 */
function getChakraSymbol(position: number): string {
  const symbols: Record<number, string> = {
    1: '🔴', 2: '🟠', 3: '🟡', 4: '💚', 5: '🔵', 6: '🟣', 7: '⚪'
  };
  return symbols[position] || '✨';
}

/**
 * Helper: Get status color by level
 */
function getStatusColor(level: string): string {
  switch (level) {
    case 'balanced': return '#10b981'; // emerald-500
    case 'imbalanced': return '#f59e0b'; // amber-500
    case 'blocked': return '#ef4444'; // red-500
    default: return '#6b7280'; // gray-500
  }
}

/**
 * Individual Chakra Card
 * Shows chakra name, score, status, interpretation and first aid plan
 */
function ChakraCard({ score, index }: ChakraCardProps) {
  const chakraMetadata = getChakraByName(score.chakra);

  if (!chakraMetadata) {
    return null;
  }

  const { name, sanskritName, color, position } = chakraMetadata;
  const { score: points, level, interpretation } = score;
  const { status, summary, manifestations, first_aid_plan } = interpretation;

  // Status badge styling based on level
  const statusStyles = {
    balanced: {
      gradient: "from-emerald-500 to-green-500",
      icon: "✓",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    imbalanced: {
      gradient: "from-amber-500 to-orange-500",
      icon: "⚠",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    blocked: {
      gradient: "from-rose-500 to-red-500",
      icon: "✕",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700"
    }
  };

  const currentStatus = statusStyles[level];

  return (
    <motion.article
      id={`chakra-${chakraMetadata.key}`}
      data-chakra={chakraMetadata.key}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -8,
      }}
      className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group"
      style={{
        borderLeft: `6px solid ${color}`,
        boxShadow: `0 0 60px ${color}12, 0 20px 40px rgba(0,0,0,0.08)`,
      }}
    >
      {/* Gradient overlay felül */}
      <div
        className="absolute top-0 left-0 right-0 h-32 opacity-8 pointer-events-none transition-opacity duration-500 group-hover:opacity-12"
        style={{
          background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Csakra szimbólum vízjel (NAGY, fade) */}
      <div
        className="absolute top-1/2 right-8 transform -translate-y-1/2 text-9xl opacity-4 pointer-events-none select-none transition-all duration-500 group-hover:opacity-7 group-hover:scale-110"
        style={{ color }}
        aria-hidden="true"
      >
        {getChakraSymbol(position)}
      </div>

      {/* Pulzáló glow effect balanced esetén */}
      {level === 'balanced' && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}15, transparent)`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
      )}
      {/* Card Content */}
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Nagyobb, pulzáló csakra badge */}
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}60, 0 4px 12px ${color}40`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 15px ${color}50, 0 4px 12px ${color}30`,
                    `0 0 30px ${color}80, 0 6px 16px ${color}50`,
                    `0 0 15px ${color}50, 0 4px 12px ${color}30`,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              >
                {position}
              </motion.div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                  {name}
                </h2>
                <p className="text-sm text-gray-500">{sanskritName}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start sm:items-end">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-base shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${getStatusColor(level)}, ${getStatusColor(level)}dd)`,
                boxShadow: `0 0 25px ${getStatusColor(level)}40, 0 4px 12px rgba(0,0,0,0.15)`,
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  `0 0 20px ${getStatusColor(level)}35, 0 4px 12px rgba(0,0,0,0.12)`,
                  `0 0 35px ${getStatusColor(level)}55, 0 6px 16px rgba(0,0,0,0.18)`,
                  `0 0 20px ${getStatusColor(level)}35, 0 4px 12px rgba(0,0,0,0.12)`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <span className="text-xl" aria-hidden="true">
                {currentStatus.icon}
              </span>
              <span>{status}</span>
            </motion.div>
          </div>
        </div>

        {/* Summary Section */}
        <div
          className={`mb-6 p-5 rounded-2xl ${currentStatus.bgColor} border-2 transition-colors duration-300`}
          style={{ borderColor: `${color}30` }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span style={{ color }} aria-hidden="true">💫</span>
            <span>Összegzés</span>
          </h3>
          <p className={`${currentStatus.textColor} leading-relaxed text-base`}>
            {summary}
          </p>
        </div>

        {/* Manifestations Section */}
        {manifestations && manifestations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span style={{ color }} aria-hidden="true">🌟</span>
              <span>Megnyilvánulások</span>
            </h3>
            <ul className="space-y-2">
              {manifestations.map((manifestation, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 text-gray-700 text-base"
                >
                  <span
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span>{manifestation}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* First Aid Plan Section */}
        {first_aid_plan && (
          <div
            className="p-5 rounded-2xl border-2 transition-colors duration-300"
            style={{
              backgroundColor: `${color}08`,
              borderColor: `${color}25`,
            }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span style={{ color }} aria-hidden="true">🛠️</span>
              <span>Első Segély Terv</span>
            </h3>
            <p className="text-gray-800 leading-relaxed">
              {first_aid_plan}
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
