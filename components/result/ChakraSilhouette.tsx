"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import type { ChakraScore } from "@/types";
import { getChakraByName } from "@/lib/quiz/chakras";

interface ChakraSilhouetteProps {
  chakraScores: ChakraScore[];
  onChakraClick?: (chakraKey: string) => void;
}

interface ChakraPoint {
  x: number; // Percentage of SVG width
  y: number; // Percentage of SVG height
  chakraScore: ChakraScore;
}

// Define chakra positions on the body (y-axis from top, x-axis centered)
const CHAKRA_POSITIONS: Record<number, { x: number; y: number }> = {
  7: { x: 50, y: 8 },   // Crown - top of head
  6: { x: 50, y: 18 },  // Third Eye - forehead
  5: { x: 50, y: 28 },  // Throat - throat area
  4: { x: 50, y: 42 },  // Heart - center of chest
  3: { x: 50, y: 56 },  // Solar Plexus - upper abdomen
  2: { x: 50, y: 68 },  // Sacral - lower abdomen
  1: { x: 50, y: 82 },  // Root - base of spine
};

// Visual characteristics based on score level
// Minimum touch target size: 44x44px (22 radius at 200px viewBox width)
const getChakraVisuals = (level: string) => {
  switch (level) {
    case "balanced":
      return {
        radius: 26, // Increased from 24 for better touch target
        hitRadius: 28, // Extra hitbox for better accessibility
        opacity: 1,
        blur: 16,
        pulseScale: [1, 1.2, 1],
        pulseDuration: 2,
      };
    case "imbalanced":
      return {
        radius: 22, // Increased from 18 for better touch target
        hitRadius: 28,
        opacity: 0.7,
        blur: 12,
        pulseScale: [1, 1.1, 1],
        pulseDuration: 3,
      };
    case "blocked":
      return {
        radius: 22, // Increased from 12 for better touch target
        hitRadius: 28,
        opacity: 0.4,
        blur: 8,
        pulseScale: [1, 1.05, 1],
        pulseDuration: 4,
      };
    default:
      return {
        radius: 22,
        hitRadius: 28,
        opacity: 0.7,
        blur: 12,
        pulseScale: [1, 1.1, 1],
        pulseDuration: 3,
      };
  }
};

export default function ChakraSilhouette({
  chakraScores,
  onChakraClick,
}: ChakraSilhouetteProps) {
  const [hoveredChakra, setHoveredChakra] = useState<string | null>(null);

  // Map chakra scores to positions
  const chakraPoints: ChakraPoint[] = chakraScores.map((score) => {
    const metadata = getChakraByName(score.chakra);
    const position = metadata?.position || 1;
    const coords = CHAKRA_POSITIONS[position];

    return {
      x: coords.x,
      y: coords.y,
      chakraScore: score,
    };
  });

  // SVG viewBox: 0 0 200 400 (portrait orientation)
  const svgWidth = 200;
  const svgHeight = 400;

  // Animation variants for chakra points
  const chakraVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const handleChakraClick = (chakraScore: ChakraScore) => {
    const metadata = getChakraByName(chakraScore.chakra);
    if (metadata && onChakraClick) {
      onChakraClick(metadata.key);
    }
  };

  const handleChakraKeyPress = (
    e: React.KeyboardEvent,
    chakraScore: ChakraScore
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleChakraClick(chakraScore);
    }
  };

  return (
    <div className="relative w-full max-w-[280px] md:max-w-md mx-auto">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label="Chakra body silhouette visualization"
      >
        <defs>
          {/* Glow filters for each chakra */}
          {chakraPoints.map((point, index) => {
            const metadata = getChakraByName(point.chakraScore.chakra);
            const visuals = getChakraVisuals(point.chakraScore.level);
            return (
              <filter
                key={`glow-${index}`}
                id={`glow-${index}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation={visuals.blur}
                  result="coloredBlur"
                />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>

        {/* Body Silhouette */}
        <g className="body-outline" stroke="#9370DB" strokeWidth="1.5" fill="none">
          {/* Head */}
          <ellipse cx="100" cy="30" rx="24" ry="30" opacity="0.6" />

          {/* Neck */}
          <line x1="85" y1="58" x2="85" y2="72" opacity="0.6" />
          <line x1="115" y1="58" x2="115" y2="72" opacity="0.6" />

          {/* Shoulders */}
          <path
            d="M 85 72 Q 60 75, 45 85"
            opacity="0.6"
          />
          <path
            d="M 115 72 Q 140 75, 155 85"
            opacity="0.6"
          />

          {/* Arms */}
          <path
            d="M 45 85 L 35 150 L 30 220"
            opacity="0.5"
          />
          <path
            d="M 155 85 L 165 150 L 170 220"
            opacity="0.5"
          />

          {/* Torso */}
          <path
            d="M 85 72 L 80 140 Q 78 200, 82 260"
            opacity="0.6"
          />
          <path
            d="M 115 72 L 120 140 Q 122 200, 118 260"
            opacity="0.6"
          />

          {/* Hips */}
          <path
            d="M 82 260 Q 75 270, 72 290"
            opacity="0.6"
          />
          <path
            d="M 118 260 Q 125 270, 128 290"
            opacity="0.6"
          />

          {/* Legs */}
          <path
            d="M 72 290 L 68 350 L 65 390"
            opacity="0.5"
          />
          <path
            d="M 128 290 L 132 350 L 135 390"
            opacity="0.5"
          />
        </g>

        {/* Chakra Points */}
        {chakraPoints.map((point, index) => {
          const metadata = getChakraByName(point.chakraScore.chakra);
          const visuals = getChakraVisuals(point.chakraScore.level);
          const isHovered = hoveredChakra === metadata?.key;
          const x = (point.x / 100) * svgWidth;
          const y = (point.y / 100) * svgHeight;

          // Determine warning ring color based on level
          const warningRingColor =
            point.chakraScore.level === "blocked" ? "#DC2626" : // red-600
            point.chakraScore.level === "imbalanced" ? "#F59E0B" : // amber-500
            null;

          return (
            <g key={index}>
              {/* Invisible hit area for better touch targets (44x44px minimum) */}
              <circle
                cx={x}
                cy={y}
                r={visuals.hitRadius}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredChakra(metadata?.key || null)}
                onMouseLeave={() => setHoveredChakra(null)}
                onClick={() => handleChakraClick(point.chakraScore)}
                onKeyDown={(e: any) => handleChakraKeyPress(e, point.chakraScore)}
                tabIndex={0}
                role="button"
                aria-label={`${metadata?.name} csakra - Állapot: ${point.chakraScore.interpretation.status}. Kattints a részletekért.`}
              />

              {/* Warning ring for problematic chakras */}
              {warningRingColor && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={visuals.radius + 8}
                  fill="none"
                  stroke={warningRingColor}
                  strokeWidth="3"
                  opacity={0.8}
                  variants={chakraVariants}
                  initial="hidden"
                  custom={index}
                  style={{ pointerEvents: "none" }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    opacity: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: point.chakraScore.level === "blocked" ? 1.5 : 2.5,
                      ease: "easeInOut",
                    },
                    scale: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: point.chakraScore.level === "blocked" ? 1.5 : 2.5,
                      ease: "easeInOut",
                    },
                  }}
                />
              )}

              {/* Pulsing chakra circle */}
              <motion.circle
                cx={x}
                cy={y}
                r={visuals.radius}
                fill={metadata?.color || "#9370DB"}
                opacity={visuals.opacity}
                filter={`url(#glow-${index})`}
                variants={chakraVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                style={{ pointerEvents: "none" }}
                className="chakra-point"
                transition={{
                  scale: {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: visuals.pulseDuration,
                  },
                }}
              />

              {/* Inner glow */}
              <motion.circle
                cx={x}
                cy={y}
                r={visuals.radius * 0.5}
                fill="white"
                opacity={0.3}
                variants={chakraVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                style={{ pointerEvents: "none" }}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredChakra && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-purple-200 dark:border-purple-700 pointer-events-none z-10"
        >
          {(() => {
            const chakraScore = chakraScores.find((score) => {
              const metadata = getChakraByName(score.chakra);
              return metadata?.key === hoveredChakra;
            });
            const metadata = getChakraByName(chakraScore!.chakra);
            return (
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {metadata?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {chakraScore?.interpretation.status}
                </p>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
