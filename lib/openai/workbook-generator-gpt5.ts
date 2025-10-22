/**
 * GPT-5-mini Workbook Content Generator
 *
 * Orchestrates the generation of personalized 30-day chakra workbook content.
 * Uses two sequential GPT-5 API calls (Days 1-15 and Days 16-30) to stay within token limits.
 *
 * Phase: v2.5 - 30 Napos Csakra Munkafüzet
 *
 * @module lib/openai/workbook-generator-gpt5
 */

import type { ChakraScores } from '@/types';
import {
  validateWorkbookDaysResponse,
  type WorkbookDay,
  type WorkbookDaysResponse,
  type ChakraDayDistribution,
} from './workbook-schemas-gpt5';
import {
  buildWorkbookPrompt,
  calculateDaysPerChakra,
  buildWorkbookIntroduction,
} from './workbook-prompts-gpt5';
import { openaiClient, GPT5_CONFIG } from './client-gpt5';

// ============================================================================
// OPENAI CLIENT INITIALIZATION (Responses API)
// ============================================================================

// Uses gpt-5-mini with Responses API (same as personalized report)
// Config imported from client-gpt5.ts:
// - model: 'gpt-5-mini'
// - reasoning: { effort: 'minimal' }
// - text: { verbosity: 'medium' }
// - max_output_tokens: 8000

// ============================================================================
// WORKBOOK GENERATION RESULT
// ============================================================================

export interface WorkbookGenerationResult {
  success: boolean;
  days?: WorkbookDay[];
  distribution?: ChakraDayDistribution;
  introduction?: string;
  error?: string;
  tokenUsage?: {
    call1: { input: number; output: number };
    call2: { input: number; output: number };
    total: { input: number; output: number };
  };
}

// ============================================================================
// CORE GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generates Days 1-15 of workbook content
 *
 * @param chakraScores - User's chakra scores
 * @param userName - User's first name
 * @param distribution - Chakra day distribution
 * @returns Validated workbook days response
 */
async function generateWorkbookDays1to15(
  chakraScores: ChakraScores,
  userName: string,
  distribution: ChakraDayDistribution
): Promise<{ response: WorkbookDaysResponse; usage: { input: number; output: number } }> {
  const prompt = buildWorkbookPrompt(chakraScores, userName, '1-15', distribution);

  console.log('[WorkbookGenerator] Generating Days 1-15 with gpt-5-mini Responses API...');

  // Use Responses API (same as personalized report)
  const response = await openaiClient.responses.create({
    ...GPT5_CONFIG,
    input: prompt,  // Single string input (not messages array)
  });

  const rawResponse = response.output_text;
  if (!rawResponse) {
    throw new Error('GPT-5 response is empty');
  }

  // Parse and validate
  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch (error) {
    console.error('[WorkbookGenerator] JSON parse error:', error);
    throw new Error('Invalid JSON response from GPT-5');
  }

  const validatedResponse = validateWorkbookDaysResponse(parsedResponse);

  const usage = {
    input: response.usage?.input_tokens || 0,
    output: response.usage?.output_tokens || 0,
  };

  console.log('[WorkbookGenerator] Days 1-15 generated successfully');
  console.log('[WorkbookGenerator] Token usage:', usage);

  return { response: validatedResponse, usage };
}

/**
 * Generates Days 16-30 of workbook content
 *
 * @param chakraScores - User's chakra scores
 * @param userName - User's first name
 * @param distribution - Chakra day distribution
 * @returns Validated workbook days response
 */
async function generateWorkbookDays16to30(
  chakraScores: ChakraScores,
  userName: string,
  distribution: ChakraDayDistribution
): Promise<{ response: WorkbookDaysResponse; usage: { input: number; output: number } }> {
  const prompt = buildWorkbookPrompt(chakraScores, userName, '16-30', distribution);

  console.log('[WorkbookGenerator] Generating Days 16-30 with gpt-5-mini Responses API...');

  // Use Responses API (same as personalized report)
  const response = await openaiClient.responses.create({
    ...GPT5_CONFIG,
    input: prompt,  // Single string input (not messages array)
  });

  const rawResponse = response.output_text;
  if (!rawResponse) {
    throw new Error('GPT-5 response is empty');
  }

  // Parse and validate
  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch (error) {
    console.error('[WorkbookGenerator] JSON parse error:', error);
    throw new Error('Invalid JSON response from GPT-5');
  }

  const validatedResponse = validateWorkbookDaysResponse(parsedResponse);

  const usage = {
    input: response.usage?.input_tokens || 0,
    output: response.usage?.output_tokens || 0,
  };

  console.log('[WorkbookGenerator] Days 16-30 generated successfully');
  console.log('[WorkbookGenerator] Token usage:', usage);

  return { response: validatedResponse, usage };
}

// ============================================================================
// MAIN WORKBOOK GENERATOR
// ============================================================================

/**
 * Generates complete 30-day personalized workbook content
 *
 * Process:
 * 1. Calculate personalized day distribution based on chakra scores
 * 2. Generate Days 1-15 (GPT-5 Call #1)
 * 3. Generate Days 16-30 (GPT-5 Call #2)
 * 4. Combine results
 * 5. Generate personalized introduction text
 * 6. Return complete workbook data
 *
 * @param chakraScores - User's chakra scores from quiz
 * @param userName - User's first name
 * @returns Complete workbook generation result
 */
export async function generateWorkbookContent(
  chakraScores: ChakraScores,
  userName: string
): Promise<WorkbookGenerationResult> {
  console.log('[WorkbookGenerator] Starting workbook generation for:', userName);
  console.log('[WorkbookGenerator] Chakra scores:', chakraScores);

  try {
    // Step 1: Calculate personalized day distribution
    console.log('[WorkbookGenerator] Calculating day distribution...');
    const distribution = calculateDaysPerChakra(chakraScores);
    console.log('[WorkbookGenerator] Distribution:', distribution);

    // Validate distribution totals 30 days
    const totalDays = Object.values(distribution).reduce(
      (sum, days) => sum + days,
      0
    );
    if (totalDays !== 30) {
      throw new Error(
        `Distribution must total 30 days, got ${totalDays}`
      );
    }

    // Step 2: Generate Days 1-15
    const { response: response1, usage: usage1 } =
      await generateWorkbookDays1to15(chakraScores, userName, distribution);

    // Wait 2 seconds between API calls to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Generate Days 16-30
    const { response: response2, usage: usage2 } =
      await generateWorkbookDays16to30(chakraScores, userName, distribution);

    // Step 4: Combine results
    const allDays = [...response1.days, ...response2.days];

    // Validate we have exactly 30 days
    if (allDays.length !== 30) {
      throw new Error(
        `Expected 30 days, got ${allDays.length}`
      );
    }

    // Step 5: Generate introduction text
    const introduction = buildWorkbookIntroduction(
      chakraScores,
      userName,
      distribution
    );

    // Step 6: Calculate total token usage
    const tokenUsage = {
      call1: usage1,
      call2: usage2,
      total: {
        input: usage1.input + usage2.input,
        output: usage1.output + usage2.output,
      },
    };

    console.log('[WorkbookGenerator] Generation complete!');
    console.log('[WorkbookGenerator] Total tokens:', tokenUsage.total);
    console.log(
      '[WorkbookGenerator] Estimated cost: $',
      (
        tokenUsage.total.input * 0.00000015 +
        tokenUsage.total.output * 0.0000006
      ).toFixed(4)
    );

    return {
      success: true,
      days: allDays,
      distribution,
      introduction,
      tokenUsage,
    };
  } catch (error) {
    console.error('[WorkbookGenerator] Generation failed:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error during workbook generation',
    };
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that workbook content meets quality standards
 *
 * Checks:
 * - All 30 days present
 * - Day numbers sequential (1-30)
 * - All required fields populated
 * - Character limits respected
 *
 * @param days - Generated workbook days
 * @returns Validation result
 */
export function validateWorkbookContent(
  days: WorkbookDay[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check count
  if (days.length !== 30) {
    errors.push(`Expected 30 days, got ${days.length}`);
  }

  // Check sequential day numbers
  const dayNumbers = days.map((day) => day.day_number).sort((a, b) => a - b);
  for (let i = 0; i < 30; i++) {
    if (dayNumbers[i] !== i + 1) {
      errors.push(`Missing day number ${i + 1}`);
    }
  }

  // Check individual days
  days.forEach((day, index) => {
    // Check required fields
    if (!day.csakra) {
      errors.push(`Day ${day.day_number}: Missing csakra`);
    }
    if (!day.napi_szandek) {
      errors.push(`Day ${day.day_number}: Missing napi_szandek`);
    }
    if (!day.elmelet) {
      errors.push(`Day ${day.day_number}: Missing elmelet`);
    }
    if (!day.gyakorlat_leiras) {
      errors.push(`Day ${day.day_number}: Missing gyakorlat_leiras`);
    }
    if (!day.affirmacio) {
      errors.push(`Day ${day.day_number}: Missing affirmacio`);
    }
    if (!day.motivacio) {
      errors.push(`Day ${day.day_number}: Missing motivacio`);
    }
    if (!day.journaling_kerdesek || day.journaling_kerdesek.length < 3) {
      errors.push(
        `Day ${day.day_number}: Need at least 3 journaling questions`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
