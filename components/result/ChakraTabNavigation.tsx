"use client";

import { motion } from "framer-motion";
import type { ChakraScore, ChakraName } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

type ChakraTabNavigationProps = {
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
 * Helper: Get warning icon and color based on score
 */
function getWarningIndicator(score: number): { show: boolean; color: string; icon: string } {
  if (score >= 4 && score <= 7) {
    return { show: true, color: '#DC2626', icon: '⚠️' }; // red-600
  }
  if (score >= 8 && score <= 12) {
    return { show: true, color: '#F59E0B', icon: '⚠️' }; // amber-500
  }
  if (score >= 13 && score <= 16) {
    return { show: true, color: '#10B981', icon: '✅' }; // green-500
  }
  return { show: false, color: '', icon: '' };
}

/**
 * ChakraTabNavigation Component
 * Horizontal row of 7 chakra emoji circles with warning indicators
 * - 4-7 points: Red warning (⚠️)
 * - 8-12 points: Orange warning (⚠️)
 * - 13-16 points: Green checkmark (✅)
 * - Active tab: enlarged, full opacity, purple ring
 * - Inactive tabs: smaller, reduced opacity, grayscale
 */
export default function ChakraTabNavigation({
  chakras,
  activeChakra,
  onTabChange,
}: ChakraTabNavigationProps) {
  return (
    <nav
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-md py-4 px-4"
      aria-label="Chakra Navigation"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-2">
          {chakras.map((chakra) => {
            const metadata = getChakraByName(chakra.chakra);
            if (!metadata) return null;

            const isActive = chakra.chakra === activeChakra;
            const warning = getWarningIndicator(chakra.score);
            const emoji = getChakraSymbol(metadata.position);

            return (
              <motion.button
                key={chakra.chakra}
                onClick={() => onTabChange(chakra.chakra)}
                className="relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-300 rounded-full"
                whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${metadata.name} - ${chakra.score} pont`}
                aria-current={isActive ? "true" : "false"}
                title={`${metadata.name}: ${chakra.score}/16 pont`}
              >
                {/* Chakra Emoji Circle */}
                <motion.div
                  className={`
                    w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full
                    flex items-center justify-center text-2xl sm:text-3xl md:text-4xl
                    transition-all duration-300
                    ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}
                  `}
                  style={{
                    backgroundColor: isActive ? `${metadata.color}15` : 'transparent',
                  }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Active Ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full ring-2 sm:ring-3 md:ring-4 ring-spiritual-purple-500"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    />
                  )}

                  <span className="relative z-10">{emoji}</span>
                </motion.div>

                {/* Warning/Status Icon Overlay */}
                {warning.show && (
                  <motion.div
                    className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-lg"
                    style={{
                      backgroundColor: warning.color,
                      boxShadow: `0 0 12px ${warning.color}60`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    aria-hidden="true"
                  >
                    {warning.icon}
                  </motion.div>
                )}

                {/* Active Indicator Pulse */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-spiritual-purple-500 opacity-20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    aria-hidden="true"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom styles for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
