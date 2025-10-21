"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChakraScore } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

/**
 * MobileChakraAccordion Component
 * Mobile-optimized accordion pattern for chakra interpretation cards
 *
 * Features:
 * - Multiple cards can be open simultaneously (comparison UX)
 * - Default state: All cards closed (clean overview)
 * - Smooth expand/collapse animations
 * - 70% scroll depth reduction (10k px -> 3k px)
 * - Analytics tracking via onCardToggle callback
 */

interface MobileChakraAccordionProps {
  chakraInterpretations: ChakraScore[];
  defaultOpenIndex?: number | null; // For A/B testing: null (default) vs 0
  onCardToggle?: (chakra: string, position: number, isOpen: boolean) => void;
}

export default function MobileChakraAccordion({
  chakraInterpretations,
  defaultOpenIndex = null,
  onCardToggle,
}: MobileChakraAccordionProps): JSX.Element {
  // State: Array of expanded chakra names (multiple can be open)
  const [expandedCards, setExpandedCards] = useState<string[]>(() => {
    if (defaultOpenIndex !== null && defaultOpenIndex >= 0 && defaultOpenIndex < chakraInterpretations.length) {
      return [chakraInterpretations[defaultOpenIndex].chakra];
    }
    return [];
  });

  /**
   * Toggle card open/close state
   */
  const toggleCard = (chakraName: string, position: number): void => {
    setExpandedCards((prev) => {
      const isCurrentlyOpen = prev.includes(chakraName);
      const newState = isCurrentlyOpen
        ? prev.filter((name) => name !== chakraName)
        : [...prev, chakraName];

      // Analytics callback
      if (onCardToggle) {
        onCardToggle(chakraName, position, !isCurrentlyOpen);
      }

      return newState;
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-4 py-6">
      {chakraInterpretations.map((score, index) => (
        <AccordionCard
          key={score.chakra}
          score={score}
          index={index}
          isExpanded={expandedCards.includes(score.chakra)}
          onToggle={toggleCard}
        />
      ))}
    </div>
  );
}

/**
 * Individual Accordion Card Props
 */
interface AccordionCardProps {
  score: ChakraScore;
  index: number;
  isExpanded: boolean;
  onToggle: (chakraName: string, position: number) => void;
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
 * ChevronDown Icon Component (SVG)
 * Rotates 180deg when expanded
 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }): JSX.Element {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

/**
 * Individual Accordion Card
 * Header always visible, content expands on tap
 */
function AccordionCard({ score, index, isExpanded, onToggle }: AccordionCardProps): JSX.Element | null {
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
      icon: "✓",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-300"
    },
    imbalanced: {
      icon: "⚠",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-300"
    },
    blocked: {
      icon: "✕",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      borderColor: "border-rose-300"
    }
  };

  const currentStatus = statusStyles[level];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300"
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: isExpanded
          ? `0 0 40px ${color}18, 0 12px 24px rgba(0,0,0,0.1)`
          : `0 0 20px ${color}10, 0 4px 12px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Card Header (Always Visible) */}
      <button
        onClick={() => onToggle(score.chakra, position)}
        className="w-full p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors duration-200 active:bg-gray-50"
        aria-expanded={isExpanded}
        aria-controls={`chakra-content-${position}`}
      >
        {/* Left Side: Badge + Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Chakra Badge */}
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}50`,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {position}
          </motion.div>

          {/* Chakra Name */}
          <div className="text-left flex-1 min-w-0">
            <h3 className="text-base font-serif font-bold text-gray-900 truncate">
              {name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{sanskritName}</p>
          </div>
        </div>

        {/* Right Side: Score + Status + Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Score Badge */}
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}40`,
            }}
          >
            {points}/16
          </div>

          {/* Status Badge */}
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
            style={{
              backgroundColor: getStatusColor(level),
              boxShadow: `0 0 8px ${getStatusColor(level)}40`,
            }}
          >
            <span className="mr-1" aria-hidden="true">{currentStatus.icon}</span>
            <span className="hidden sm:inline">{status}</span>
          </div>

          {/* Chevron Icon */}
          <div
            className="transition-colors duration-200"
            style={{ color: isExpanded ? color : '#9ca3af' }}
          >
            <ChevronIcon isExpanded={isExpanded} />
          </div>
        </div>
      </button>

      {/* Card Content (Expandable) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`chakra-content-${position}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-4">
              {/* Summary Section */}
              <div
                className={`p-4 rounded-xl ${currentStatus.bgColor} border-2 ${currentStatus.borderColor}`}
              >
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span style={{ color }} aria-hidden="true">💫</span>
                  <span>Összegzés</span>
                </h4>
                <p className={`${currentStatus.textColor} leading-relaxed text-sm`}>
                  {summary}
                </p>
              </div>

              {/* Manifestations Section */}
              {manifestations && manifestations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span style={{ color }} aria-hidden="true">🌟</span>
                    <span>Megnyilvánulások</span>
                  </h4>
                  <ul className="space-y-2">
                    {manifestations.map((manifestation, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-start gap-2 text-gray-700 text-sm"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
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
                  className="p-4 rounded-xl border-2"
                  style={{
                    backgroundColor: `${color}08`,
                    borderColor: `${color}25`,
                  }}
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span style={{ color }} aria-hidden="true">🛠️</span>
                    <span>Első Segély Terv</span>
                  </h4>
                  <p className="text-gray-800 leading-relaxed text-sm">
                    {first_aid_plan}
                  </p>
                </div>
              )}

              {/* Chakra Symbol Watermark (Bottom Right) */}
              <div
                className="flex justify-end opacity-20 pointer-events-none select-none"
                aria-hidden="true"
              >
                <span
                  className="text-5xl"
                  style={{ color }}
                >
                  {getChakraSymbol(position)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Glow Effect for Balanced Chakras */}
      {level === 'balanced' && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}12, transparent 70%)`,
          }}
          animate={{
            opacity: isExpanded ? [0, 0.5, 0] : 0,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
      )}
    </motion.article>
  );
}
