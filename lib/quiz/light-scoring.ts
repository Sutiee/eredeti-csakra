/**
 * Light Quiz Scoring Functions
 * Calculate scores from 7-question light quiz (one question per chakra)
 */

import type { ChakraName, InterpretationData } from '@/types';
import { getChakraNames, getChakraByName } from './chakras';
import { getInterpretationForScore } from './interpretations';

/**
 * Light quiz scores type - maps chakra name to score (1-4)
 */
export type LightChakraScores = Record<ChakraName, number>;

/**
 * Light quiz interpretation for teaser result
 */
export type LightInterpretation = {
  chakraName: ChakraName;
  title: string;
  description: string;
  symptoms: string[];
  element: string;
  location: string;
};

/**
 * Calculate light quiz scores from 7 answers (one per chakra)
 *
 * Each answer is 1-4 (1 = most blocked, 4 = healthy)
 * Questions are in chakra order: Gyokercsakra -> Korona csakra
 *
 * @param answers - Array of 7 answers (1-4 scale)
 * @returns Object mapping chakra names to their scores (1-4)
 * @throws Error if answers array is invalid
 */
export function calculateLightScores(answers: number[]): LightChakraScores {
  // Validate answers length
  if (answers.length !== 7) {
    throw new Error(`Expected 7 answers, got ${answers.length}`);
  }

  // Validate each answer is in range 1-4
  answers.forEach((answer, index) => {
    if (answer < 1 || answer > 4) {
      throw new Error(`Answer at index ${index} is out of range: ${answer}. Expected 1-4.`);
    }
  });

  const chakraNames = getChakraNames();
  const scores: Partial<LightChakraScores> = {};

  // Map each answer to its corresponding chakra
  chakraNames.forEach((chakraName, index) => {
    scores[chakraName] = answers[index];
  });

  return scores as LightChakraScores;
}

/**
 * Find the primary (most) blocked chakra
 * Returns the chakra name with the lowest score
 * If multiple chakras have the same lowest score, returns the first one (root to crown order)
 *
 * @param scores - Light chakra scores object (1-4 per chakra)
 * @returns Chakra name with the lowest score
 */
export function findPrimaryBlockedChakra(scores: LightChakraScores): ChakraName {
  const chakraNames = getChakraNames();
  let lowestScore = 5; // Higher than max possible
  let primaryBlockedChakra: ChakraName = chakraNames[0];

  // Iterate in chakra order (root to crown) to get first one in case of ties
  chakraNames.forEach((chakraName) => {
    const score = scores[chakraName];
    if (score < lowestScore) {
      lowestScore = score;
      primaryBlockedChakra = chakraName;
    }
  });

  return primaryBlockedChakra;
}

/**
 * Get interpretation teaser content for a specific chakra
 * Uses the "blocked" (4-7) interpretation as the teaser since light quiz
 * shows the most blocked chakra for user engagement
 *
 * @param chakraName - Name of the chakra to get interpretation for
 * @returns Teaser content object with symptoms, description, and chakra info
 */
export function getLightInterpretation(chakraName: ChakraName): LightInterpretation {
  // Get the blocked level interpretation (score 4 maps to 4-7 range)
  // We use the blocked interpretation as the teaser content
  const interpretation: InterpretationData = getInterpretationForScore(chakraName, 4);

  // Get chakra metadata for additional context
  const chakraMetadata = getChakraByName(chakraName);

  return {
    chakraName,
    title: chakraMetadata?.nameEn || chakraName,
    description: interpretation.summary,
    symptoms: interpretation.manifestations,
    element: chakraMetadata?.element || '',
    location: chakraMetadata?.location || '',
  };
}

/**
 * Get all blocked chakras from light quiz scores
 * A chakra is considered blocked if score is 1 or 2
 *
 * @param scores - Light chakra scores object
 * @returns Array of chakra names that are blocked
 */
export function getLightBlockedChakras(scores: LightChakraScores): ChakraName[] {
  const chakraNames = getChakraNames();
  return chakraNames.filter((chakraName) => scores[chakraName] <= 2);
}

/**
 * Get all balanced chakras from light quiz scores
 * A chakra is considered balanced if score is 3 or 4
 *
 * @param scores - Light chakra scores object
 * @returns Array of chakra names that are balanced
 */
export function getLightBalancedChakras(scores: LightChakraScores): ChakraName[] {
  const chakraNames = getChakraNames();
  return chakraNames.filter((chakraName) => scores[chakraName] >= 3);
}

/**
 * Calculate overall wellness percentage for light quiz
 *
 * Min possible: 7 (7 chakras x 1 point)
 * Max possible: 28 (7 chakras x 4 points)
 *
 * @param scores - Light chakra scores object
 * @returns Percentage (0-100)
 */
export function calculateLightOverallWellness(scores: LightChakraScores): number {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const minPossible = 7;
  const maxPossible = 28;

  const percentage = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;
  return Math.round(percentage);
}

/**
 * Validate light quiz answers array
 *
 * @param answers - Array to validate
 * @returns True if valid, throws error otherwise
 */
export function validateLightQuizAnswers(answers: unknown): answers is number[] {
  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }

  if (answers.length !== 7) {
    throw new Error(`Expected 7 answers, got ${answers.length}`);
  }

  const invalidAnswers = answers.filter(
    (answer) => typeof answer !== 'number' || answer < 1 || answer > 4
  );

  if (invalidAnswers.length > 0) {
    throw new Error('All answers must be numbers between 1 and 4');
  }

  return true;
}
