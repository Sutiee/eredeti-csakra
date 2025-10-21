"use client";

import { motion } from "framer-motion";
import type { ChakraScore, ChakraScores, ChakraName } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

interface FreeChakraSummaryProps {
  chakraScores: ChakraScores;
  chakraInterpretations: ChakraScore[];
}

/**
 * FreeChakraSummary Component
 *
 * Displays the most important (blocked) chakra card above-the-fold
 * as FREE value before showing the soft-upsell box.
 *
 * **Logic**:
 * 1. Find the chakra with the lowest score (biggest block)
 * 2. Fallback to Gyökércsakra if there's a tie or no clear worst
 * 3. Render 1 card with positive micro-copy
 * 4. Show 1 quick actionable tip
 * 5. "Nézd meg a teljes tervet" smooth scroll link to pricing
 */
export default function FreeChakraSummary({
  chakraScores,
  chakraInterpretations,
}: FreeChakraSummaryProps) {
  // Find the chakra with lowest score (biggest block)
  const topPriorityChakra = findTopPriorityChakra(
    chakraScores,
    chakraInterpretations
  );

  if (!topPriorityChakra) {
    return null; // Safety fallback
  }

  const chakraMetadata = getChakraByName(topPriorityChakra.chakra);

  if (!chakraMetadata) {
    return null;
  }

  const { name, sanskritName, color, position } = chakraMetadata;
  const { score, level, interpretation } = topPriorityChakra;
  const { status, summary, first_aid_plan } = interpretation;

  // Status styling based on level
  const statusStyles = {
    balanced: {
      icon: "✓",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
    },
    imbalanced: {
      icon: "⚠",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
    },
    blocked: {
      icon: "✕",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      borderColor: "border-rose-200",
    },
  };

  const currentStatus = statusStyles[level];

  // Helper: Smooth scroll to pricing section
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12"
    >
      {/* Positive Micro-Copy Header */}
      <div className="text-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3"
        >
          Itt tudsz ma a legtöbbet javítani
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Az alábbi csakrád igényli most a legnagyobb figyelmet.
          Ez az első lépés a harmónia felé!
        </motion.p>
      </div>

      {/* Chakra Card (Free Preview) */}
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          borderLeft: `6px solid ${color}`,
          boxShadow: `0 0 60px ${color}12, 0 20px 40px rgba(0,0,0,0.08)`,
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-8 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
          }}
          aria-hidden="true"
        />

        {/* Chakra symbol watermark */}
        <div
          className="absolute top-1/2 right-8 transform -translate-y-1/2 text-9xl opacity-4 pointer-events-none select-none"
          style={{ color }}
          aria-hidden="true"
        >
          {getChakraSymbol(position)}
        </div>

        {/* Card Content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Chakra badge */}
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
                    ease: "easeInOut",
                  }}
                  aria-hidden="true"
                >
                  {position}
                </motion.div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                    {name}
                  </h3>
                  <p className="text-sm text-gray-500">{sanskritName}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-start sm:items-end">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor} border-2`}
              >
                <span aria-hidden="true">{currentStatus.icon}</span>
                <span>{status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Pontszám: {score}/16
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div
            className={`mb-6 p-5 rounded-2xl ${currentStatus.bgColor} border-2 ${currentStatus.borderColor}`}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span style={{ color }} aria-hidden="true">
                💫
              </span>
              <span>Mi történik most veled?</span>
            </h4>
            <p className={`${currentStatus.textColor} leading-relaxed text-base`}>
              {summary}
            </p>
          </div>

          {/* Quick Actionable Tip (First Aid Plan) */}
          {first_aid_plan && (
            <div
              className="p-5 rounded-2xl border-2"
              style={{
                backgroundColor: `${color}08`,
                borderColor: `${color}25`,
              }}
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span style={{ color }} aria-hidden="true">
                  💡
                </span>
                <span>Azonnali tennivaló</span>
              </h4>
              <p className="text-gray-800 leading-relaxed text-base mb-4">
                {first_aid_plan}
              </p>

              {/* Smooth scroll CTA link */}
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center gap-2 text-base font-semibold hover:underline transition-all duration-200 group"
                style={{ color }}
              >
                <span>Nézd meg a teljes tervet</span>
                <motion.span
                  className="text-xl"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  aria-hidden="true"
                >
                  →
                </motion.span>
              </button>
            </div>
          )}
        </div>
      </motion.article>

      {/* Bottom Encouragement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center text-sm text-gray-500 mt-6"
      >
        Ez csak a kezdet! A részletes terv további 6 csakrádat is elemzi.
      </motion.p>
    </motion.section>
  );
}

/**
 * Helper: Find the top priority chakra (lowest score)
 * Fallback to Gyökércsakra if tie or no clear worst
 */
function findTopPriorityChakra(
  chakraScores: ChakraScores,
  chakraInterpretations: ChakraScore[]
): ChakraScore | null {
  if (chakraInterpretations.length === 0) {
    return null;
  }

  // Find lowest score
  let lowestScore = 16;
  let lowestChakras: ChakraScore[] = [];

  chakraInterpretations.forEach((interpretation) => {
    if (interpretation.score < lowestScore) {
      lowestScore = interpretation.score;
      lowestChakras = [interpretation];
    } else if (interpretation.score === lowestScore) {
      lowestChakras.push(interpretation);
    }
  });

  // If tie, prefer Gyökércsakra (root chakra - foundational)
  if (lowestChakras.length > 1) {
    const rootChakra = lowestChakras.find(
      (c) => c.chakra === "Gyökércsakra"
    );
    if (rootChakra) {
      return rootChakra;
    }
    // Otherwise return first in tie
    return lowestChakras[0];
  }

  return lowestChakras[0];
}

/**
 * Helper: Get chakra symbol emoji by position
 */
function getChakraSymbol(position: number): string {
  const symbols: Record<number, string> = {
    1: "🔴",
    2: "🟠",
    3: "🟡",
    4: "💚",
    5: "🔵",
    6: "🟣",
    7: "⚪",
  };
  return symbols[position] || "✨";
}
