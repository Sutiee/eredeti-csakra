/**
 * Quiz Scoring Algorithm
 * Calculates chakra scores from user answers
 */

import type {
  QuizAnswers,
  ChakraScores,
  ChakraName,
  InterpretationLevel,
  ChakraScore
} from "@/types";
import { getChakraNames } from "./chakras";
import { getInterpretationForScore } from "./interpretations";

/**
 * Calculate individual chakra scores from 28 answers
 *
 * Each chakra has 4 questions, each scored 1-4
 * Total score per chakra: 4-16 points
 *
 * @param answers - Array of 28 answers (1-4 scale)
 * @returns Object with scores for each chakra
 */
export function calculateChakraScores(answers: QuizAnswers | number[]): ChakraScores {
  // Validate answers length
  if (answers.length !== 28) {
    throw new Error(`Expected 28 answers, got ${answers.length}`);
  }

  // Validate each answer is in range 1-4
  answers.forEach((answer, index) => {
    if (answer < 1 || answer > 4) {
      throw new Error(`Answer at index ${index} is out of range: ${answer}. Expected 1-4.`);
    }
  });

  const chakraNames = getChakraNames();
  const scores: Partial<ChakraScores> = {};

  // Calculate score for each chakra (4 questions each)
  chakraNames.forEach((chakraName, chakraIndex) => {
    const startIndex = chakraIndex * 4;
    const endIndex = startIndex + 4;
    const chakraAnswers = answers.slice(startIndex, endIndex);

    // Sum the 4 answers for this chakra
    const score = chakraAnswers.reduce((sum, answer) => sum + answer, 0);

    scores[chakraName] = score;
  });

  return scores as ChakraScores;
}

/**
 * Map score to interpretation level
 *
 * 4-7:   blocked (Erősen blokkolt)
 * 8-12:  imbalanced (Kiegyensúlyozatlan)
 * 13-16: balanced (Egészséges és kiegyensúlyozott)
 *
 * @param score - Chakra score (4-16)
 * @returns Interpretation level
 */
export function getInterpretationLevel(score: number): InterpretationLevel {
  if (score >= 4 && score <= 7) {
    return "blocked";
  } else if (score >= 8 && score <= 12) {
    return "imbalanced";
  } else if (score >= 13 && score <= 16) {
    return "balanced";
  } else {
    throw new Error(`Invalid chakra score: ${score}. Expected 4-16.`);
  }
}

/**
 * Get score range key for interpretation lookup
 *
 * @param score - Chakra score (4-16)
 * @returns Score range key ('4-7', '8-12', or '13-16')
 */
export function getScoreRangeKey(score: number): '4-7' | '8-12' | '13-16' {
  if (score >= 4 && score <= 7) {
    return '4-7';
  } else if (score >= 8 && score <= 12) {
    return '8-12';
  } else if (score >= 13 && score <= 16) {
    return '13-16';
  } else {
    throw new Error(`Invalid chakra score: ${score}. Must be between 4 and 16.`);
  }
}

/**
 * Get chakra scores with full interpretation data
 *
 * @param answers - Array of 28 answers
 * @returns Array of ChakraScore objects with interpretations
 */
export function getChakraScoresWithInterpretations(answers: QuizAnswers | number[]): ChakraScore[] {
  const scores = calculateChakraScores(answers);

  return Object.entries(scores).map(([chakraName, score]) => {
    const level = getInterpretationLevel(score);
    const interpretation = getInterpretationForScore(chakraName as ChakraName, score);

    return {
      chakra: chakraName as ChakraName,
      score,
      level,
      interpretation
    };
  });
}

/**
 * Find the primary blocked chakra(s)
 * Returns the chakra(s) with the lowest score
 *
 * @param scores - ChakraScores object
 * @returns Array of chakra names with the lowest score
 */
export function findPrimaryBlocks(scores: ChakraScores): ChakraName[] {
  const entries = Object.entries(scores) as [ChakraName, number][];
  const minScore = Math.min(...entries.map(([_, score]) => score));

  return entries
    .filter(([_, score]) => score === minScore)
    .map(([chakra, _]) => chakra);
}

/**
 * Find primary blocked chakra (lowest score)
 * Returns first chakra if multiple have same lowest score
 *
 * @param scores - Chakra scores object
 * @returns Chakra name with the lowest score
 */
export function findPrimaryBlockedChakra(scores: ChakraScores): ChakraName {
  const primaryBlocks = findPrimaryBlocks(scores);
  return primaryBlocks[0];
}

/**
 * Calculate overall wellness percentage
 * Based on total score across all chakras
 *
 * Min possible: 28 (7 chakras × 4 points)
 * Max possible: 112 (7 chakras × 16 points)
 *
 * @param scores - ChakraScores object
 * @returns Percentage (0-100)
 */
export function calculateOverallWellness(scores: ChakraScores): number {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const minPossible = 28;
  const maxPossible = 112;

  const percentage = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;
  return Math.round(percentage);
}

/**
 * Get balanced chakras count
 *
 * @param scores - ChakraScores object
 * @returns Number of balanced chakras (score 13-16)
 */
export function getBalancedChakrasCount(scores: ChakraScores): number {
  return Object.values(scores).filter(score => score >= 13 && score <= 16).length;
}

/**
 * Get imbalanced chakras count
 *
 * @param scores - ChakraScores object
 * @returns Number of imbalanced chakras (score 8-12)
 */
export function getImbalancedChakrasCount(scores: ChakraScores): number {
  return Object.values(scores).filter(score => score >= 8 && score <= 12).length;
}

/**
 * Get blocked chakras count
 *
 * @param scores - ChakraScores object
 * @returns Number of blocked chakras (score 4-7)
 */
export function getBlockedChakrasCount(scores: ChakraScores): number {
  return Object.values(scores).filter(score => score >= 4 && score <= 7).length;
}

/**
 * Validate quiz answers array
 *
 * @param answers - Array to validate
 * @returns True if valid, throws error otherwise
 */
export function validateQuizAnswers(answers: unknown): answers is QuizAnswers {
  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }

  if (answers.length !== 28) {
    throw new Error(`Expected 28 answers, got ${answers.length}`);
  }

  const invalidAnswers = answers.filter(
    (answer) => typeof answer !== 'number' || answer < 1 || answer > 4
  );

  if (invalidAnswers.length > 0) {
    throw new Error('All answers must be numbers between 1 and 4');
  }

  return true;
}
