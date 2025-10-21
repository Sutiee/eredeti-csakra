"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChakraScore } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

type ChakraDetailPanelProps = {
  chakra: ChakraScore;
  isTopBlocked: boolean; // Is this the most blocked chakra?
};

/**
 * Helper: Get chakra symbol emoji by position
 */
function getChakraSymbol(position: number): string {
  const symbols: Record<number, string> = {
    1: '🔴',
    2: '🟠',
    3: '🟡',
    4: '💚',
    5: '🔵',
    6: '🟣',
    7: '⚪'
  };
  return symbols[position] || '✨';
}

/**
 * Helper: Get warning styles by level
 */
function getWarningStyles(level: string): {
  color: string;
  bgColor: string;
  icon: string;
  text: string;
} {
  switch (level) {
    case 'balanced':
      return {
        color: '#10B981', // Green
        bgColor: 'bg-emerald-50',
        icon: '✓',
        text: 'Egészséges és kiegyensúlyozott'
      };
    case 'imbalanced':
      return {
        color: '#F59E0B', // Orange
        bgColor: 'bg-amber-50',
        icon: '⚠️',
        text: 'Kiegyensúlyozatlan'
      };
    case 'blocked':
      return {
        color: '#DC2626', // Red
        bgColor: 'bg-rose-50',
        icon: '⚠️',
        text: 'Erősen blokkolt'
      };
    default:
      return {
        color: '#6B7280',
        bgColor: 'bg-gray-50',
        icon: '●',
        text: 'Ismeretlen állapot'
      };
  }
}

/**
 * ChakraDetailPanel Component
 * Displays the selected chakra's detailed information in 3 sections
 */
export default function ChakraDetailPanel({
  chakra,
  isTopBlocked
}: ChakraDetailPanelProps): JSX.Element {
  const chakraMetadata = getChakraByName(chakra.chakra);

  if (!chakraMetadata) {
    return (
      <div className="text-center py-8 text-gray-500">
        Csakra információ nem található
      </div>
    );
  }

  const { name, sanskritName, color, position } = chakraMetadata;
  const { score, level, interpretation } = chakra;
  const { status, summary, manifestations, first_aid_plan } = interpretation;

  const warningStyles = getWarningStyles(level);
  const chakraSymbol = getChakraSymbol(position);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chakra.chakra}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Background gradient card */}
        <div
          className="relative bg-white rounded-3xl overflow-hidden border border-gray-200"
          style={{
            borderLeft: `6px solid ${color}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 12px 40px ${color}20, 0 20px 60px rgba(0,0,0,0.08)`
          }}
        >
          {/* Top gradient overlay */}
          <div
            className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`
            }}
            aria-hidden="true"
          />

          {/* Large chakra symbol watermark */}
          <div
            className="absolute top-1/2 right-8 transform -translate-y-1/2 text-9xl opacity-5 pointer-events-none select-none"
            style={{ color }}
            aria-hidden="true"
          >
            {chakraSymbol}
          </div>

          {/* Top blocked badge (optional) */}
          {isTopBlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20"
            >
              <div
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                }}
              >
                🔥 Leginkább blokkolt
              </div>
            </motion.div>
          )}

          {/* Content wrapper */}
          <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* ===== SECTION 1: Header with Warning ===== */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Chakra badge */}
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}60, 0 4px 12px ${color}40`
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 15px ${color}50, 0 4px 12px ${color}30`,
                      `0 0 30px ${color}80, 0 6px 16px ${color}50`,
                      `0 0 15px ${color}50, 0 4px 12px ${color}30`
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  aria-hidden="true"
                >
                  {position}
                </motion.div>

                {/* Title & Status */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">
                    {name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">{sanskritName}</p>

                  {/* Warning Badge */}
                  <div
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base shadow-md"
                    style={{
                      backgroundColor: warningStyles.color,
                      color: 'white',
                      boxShadow: `0 4px 12px ${warningStyles.color}40`
                    }}
                  >
                    <span className="text-base sm:text-lg" aria-hidden="true">
                      {warningStyles.icon}
                    </span>
                    <span className="truncate">{chakraSymbol} {name} - {warningStyles.text}</span>
                  </div>

                  {/* Score display */}
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Pontszám: <span className="font-semibold">{score}/16</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ===== SECTION 2: Összegzés ===== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 sm:p-5 rounded-2xl border-2 ${warningStyles.bgColor}`}
              style={{ borderColor: `${color}30` }}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                <span style={{ color }} className="text-xl sm:text-2xl" aria-hidden="true">
                  📝
                </span>
                <span>Összegzés</span>
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {summary}
              </p>
            </motion.div>

            {/* ===== SECTION 3: Megnyilvánulások ===== */}
            {manifestations && manifestations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 sm:p-5 rounded-2xl bg-gray-50 border-2 border-gray-200"
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span style={{ color }} className="text-xl sm:text-2xl" aria-hidden="true">
                    💫
                  </span>
                  <span>Megnyilvánulások</span>
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {manifestations.map((manifestation, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                      className="flex items-start gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
                    >
                      <span
                        className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span>{manifestation}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ===== SECTION 4: Azonnal Tennivaló ===== */}
            {first_aid_plan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 sm:p-5 rounded-2xl border-2"
                style={{
                  backgroundColor: `${color}08`,
                  borderColor: `${color}25`
                }}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span style={{ color }} className="text-xl sm:text-2xl" aria-hidden="true">
                    💡
                  </span>
                  <span>Azonnal Tennivaló</span>
                </h3>
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base font-medium">
                  {first_aid_plan}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
