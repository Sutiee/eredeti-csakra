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
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      style={{
        borderLeft: `4px solid ${color}`
      }}
    >
      {/* Card Content */}
      <div className="p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {name}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 italic ml-6">
              {sanskritName} • {position}. csakra
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start sm:items-end">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentStatus.gradient} text-white font-medium text-sm shadow-md`}
            >
              <span className="text-lg" aria-hidden="true">
                {currentStatus.icon}
              </span>
              <span>{status}</span>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Értelmezés
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Manifestations Section */}
        {manifestations && manifestations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Megnyilvánulások
            </h3>
            <ul className="space-y-2">
              {manifestations.map((manifestation, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + (idx * 0.1)
                  }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 leading-relaxed">
                    {manifestation}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* First Aid Plan Section */}
        {first_aid_plan && (
          <div className={`${currentStatus.bgColor} rounded-xl p-5 border-l-4`} style={{ borderLeftColor: color }}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color }}>
              <span aria-hidden="true">🔧</span>
              <span>Elsősegély Terv</span>
            </h3>
            <p className="text-gray-800 leading-relaxed">
              {first_aid_plan}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`
        }}
        aria-hidden="true"
      />
    </motion.article>
  );
}
