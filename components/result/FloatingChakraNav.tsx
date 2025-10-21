"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { ChakraScore, ChakraName } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

type FloatingChakraNavProps = {
  chakras: ChakraScore[];
  activeChakra: ChakraName;
  onTabChange: (chakra: ChakraName) => void;
};

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
 * Helper: Get status color and icon
 */
function getStatusInfo(score: number): { color: string; icon: string; bgColor: string } {
  if (score >= 4 && score <= 7) {
    return { color: '#DC2626', icon: '⚠️', bgColor: '#FEE2E2' }; // red
  }
  if (score >= 8 && score <= 12) {
    return { color: '#F59E0B', icon: '⚠️', bgColor: '#FEF3C7' }; // amber
  }
  return { color: '#10B981', icon: '✅', bgColor: '#D1FAE5' }; // green
}

/**
 * FloatingChakraNav Component
 * Floating navigation button that expands to show all chakras
 * - Collapsed: Shows current chakra emoji + progress
 * - Expanded: Shows all 7 chakras with names, scores, status
 * - Clear affordance: Shadow, pulse, "Kattints ide" text
 */
export default function FloatingChakraNav({
  chakras,
  activeChakra,
  onTabChange,
}: FloatingChakraNavProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Find active chakra data
  const activeChakraData = chakras.find((c) => c.chakra === activeChakra);
  const activeMetadata = activeChakraData ? getChakraByName(activeChakraData.chakra) : null;
  const activePosition = activeMetadata?.position || 1;
  const activeEmoji = getChakraSymbol(activePosition);

  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleChakraSelect = (chakra: ChakraName): void => {
    onTabChange(chakra);
    setIsExpanded(false); // Close after selection
  };

  return (
    <div className="fixed left-4 bottom-6 sm:left-6 sm:top-[20vh] sm:bottom-auto z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // EXPANDED STATE: Show all chakras
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-spiritual-purple-200 overflow-hidden w-72 sm:w-80 absolute bottom-0 sm:static"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 16px 64px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-spiritual-purple-500 to-spiritual-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🧘‍♀️</span>
                <h3 className="text-white font-semibold text-base">Csakráid</h3>
              </div>
              <button
                onClick={handleToggle}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Bezárás"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chakra List */}
            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
              {chakras.map((chakra) => {
                const metadata = getChakraByName(chakra.chakra);
                if (!metadata) return null;

                const emoji = getChakraSymbol(metadata.position);
                const status = getStatusInfo(chakra.score);
                const isActive = chakra.chakra === activeChakra;

                return (
                  <motion.button
                    key={chakra.chakra}
                    onClick={() => handleChakraSelect(chakra.chakra)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-spiritual-purple-50 border-2 border-spiritual-purple-300 shadow-md'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-spiritual-purple-200'
                      }
                    `}
                  >
                    {/* Emoji + Number Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="text-3xl" aria-hidden="true">{emoji}</div>
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: metadata.color }}
                      >
                        {metadata.position}
                      </div>
                    </div>

                    {/* Name + Score */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {metadata.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {chakra.score}/16 pont
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className="flex-shrink-0 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold"
                      style={{
                        backgroundColor: status.bgColor,
                        color: status.color
                      }}
                    >
                      <span>{status.icon}</span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-2 h-2 rounded-full bg-spiritual-purple-500"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // COLLAPSED STATE: Floating button with clear affordance
          <motion.button
            key="collapsed"
            onClick={handleToggle}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
            aria-label="Csakra navigáció megnyitása"
          >
            {/* Main Button */}
            <div
              className="
                bg-gradient-to-br from-spiritual-purple-500 to-spiritual-purple-600
                rounded-full p-4 shadow-2xl
                border-4 border-white
                flex flex-col items-center justify-center
                transition-all duration-300
                group-hover:shadow-[0_8px_32px_rgba(139,92,246,0.4)]
              "
              style={{
                width: '80px',
                height: '80px',
              }}
            >
              {/* Active Chakra Emoji */}
              <div className="text-3xl mb-1" aria-hidden="true">
                {activeEmoji}
              </div>

              {/* Progress Indicator */}
              <div className="text-white text-xs font-semibold">
                {activePosition}/7
              </div>
            </div>

            {/* Pulsing Ring Animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-spiritual-purple-400"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />

            {/* "Többi csakrád elemzése" Label - Always visible */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="
                absolute left-full ml-3 top-1/2 -translate-y-1/2
                bg-spiritual-purple-900 text-white
                px-3 py-2 rounded-lg
                text-xs sm:text-sm font-semibold whitespace-nowrap
                shadow-lg
                pointer-events-none
              "
            >
              Többi csakrád elemzése
              {/* Arrow */}
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 -mr-1"
                aria-hidden="true"
              >
                <div className="w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-spiritual-purple-900 sm:border-t-8 sm:border-b-8 sm:border-r-8" />
              </div>
            </motion.div>

            {/* Notification Badge (if any blocked chakras) */}
            {chakras.filter((c) => c.score <= 7).length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="
                  absolute -top-1 -right-1
                  bg-red-500 text-white
                  w-7 h-7 rounded-full
                  flex items-center justify-center
                  text-xs font-bold
                  shadow-lg
                  border-2 border-white
                "
              >
                {chakras.filter((c) => c.score <= 7).length}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
