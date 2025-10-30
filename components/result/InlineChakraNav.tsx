'use client';

import { motion } from 'framer-motion';
import type { ChakraScore, ChakraName } from '@/types';
import { getChakraByName } from '@/lib/quiz/chakras';

type InlineChakraNavProps = {
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
 * Helper: Get short name for mobile display
 */
function getShortName(name: ChakraName): string {
  const shortNames: Record<ChakraName, string> = {
    'Gyökércsakra': 'Gyökér',
    'Szakrális csakra': 'Szakrális',
    'Napfonat csakra': 'Napfonat',
    'Szív csakra': 'Szív',
    'Torok csakra': 'Torok',
    'Harmadik szem': '3. szem',
    'Korona csakra': 'Korona',
  };
  return shortNames[name] || name;
}

/**
 * InlineChakraNav Component
 * Compact inline navigation showing all chakras with status indicators
 * - Shows chakra emoji, short name, and score
 * - Color-coded status bar below each chakra
 * - Highlighted active selection
 * - Warning count at the top
 */
export default function InlineChakraNav({
  chakras,
  activeChakra,
  onTabChange,
}: InlineChakraNavProps): JSX.Element {
  // Count problematic chakras
  const blockedCount = chakras.filter(c => c.score <= 7).length;
  const imbalancedCount = chakras.filter(c => c.score >= 8 && c.score <= 12).length;

  // Find most problematic chakra
  const mostProblematic = [...chakras].sort((a, b) => a.score - b.score)[0];
  const mostProblematicMeta = getChakraByName(mostProblematic.chakra);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-6">
      {/* Warning header - only if there are problems */}
      {(blockedCount > 0 || imbalancedCount > 0) && (
        <div className="flex items-center gap-2 text-sm mb-3 px-1">
          <span className="animate-pulse text-lg">⚠️</span>
          <p className="font-semibold text-gray-900">
            {blockedCount > 0 && (
              <span className="text-red-600">{blockedCount} blokkolt</span>
            )}
            {blockedCount > 0 && imbalancedCount > 0 && <span className="text-gray-600 mx-1">és</span>}
            {imbalancedCount > 0 && (
              <span className="text-amber-600">{imbalancedCount} kiegyensúlyozatlan</span>
            )}
            <span className="text-gray-600"> csakra</span>
          </p>
          {mostProblematicMeta && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              • Legsürgősebb: {getChakraSymbol(mostProblematicMeta.position)} {getShortName(mostProblematic.chakra)}
            </span>
          )}
        </div>
      )}

      {/* Chakra navigation buttons */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {chakras.map((chakra) => {
          const metadata = getChakraByName(chakra.chakra);
          if (!metadata) return null;

          const emoji = getChakraSymbol(metadata.position);
          const shortName = getShortName(chakra.chakra);
          const isActive = chakra.chakra === activeChakra;
          const isBlocked = chakra.score <= 7;
          const isImbalanced = chakra.score >= 8 && chakra.score <= 12;

          return (
            <motion.button
              key={chakra.chakra}
              onClick={() => onTabChange(chakra.chakra)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex-shrink-0 flex flex-col items-center p-2 rounded-lg
                transition-all duration-200 relative group
                ${isActive
                  ? 'bg-purple-100 shadow-md scale-105'
                  : 'hover:bg-gray-50'
                }
              `}
              style={{ minWidth: '70px' }}
              aria-label={`${metadata.name}: ${chakra.score}/16 pont`}
              title={`${metadata.name}: ${chakra.score}/16 pont`}
            >
              {/* Emoji */}
              <span className="text-2xl mb-1">{emoji}</span>

              {/* Name */}
              <span className={`
                text-xs font-medium mb-1
                ${isActive ? 'text-purple-700' : 'text-gray-700'}
              `}>
                {shortName}
              </span>

              {/* Score */}
              <span className={`
                text-xs font-bold
                ${isBlocked ? 'text-red-600' :
                  isImbalanced ? 'text-amber-600' : 'text-green-600'}
              `}>
                {chakra.score}/16
              </span>

              {/* Status indicator bar */}
              <div className={`
                absolute bottom-0 left-1 right-1 h-1 rounded-full
                ${isBlocked ? 'bg-red-500' :
                  isImbalanced ? 'bg-amber-500' : 'bg-green-500'}
                ${isActive ? 'h-1.5' : ''}
              `} />

              {/* Pulse indicator for blocked chakras */}
              {isBlocked && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}