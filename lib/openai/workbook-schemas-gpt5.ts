/**
 * Zod Validation Schemas for 30-Day Workbook Generation
 *
 * Validates GPT-5-mini API responses for workbook content.
 * Ensures strict structure and character limits for PDF generation.
 *
 * Phase: v2.5 - 30 Napos Csakra Munkafüzet
 *
 * @module lib/openai/workbook-schemas-gpt5
 */

import { z } from 'zod';

// ============================================================================
// WORKBOOK DAY SCHEMA
// ============================================================================

/**
 * Schema for a single day's content in the 30-day workbook
 *
 * Each day contains:
 * - day_number: 1-30
 * - csakra: Hungarian chakra name
 * - napi_szandek: Daily intention (50-150 chars)
 * - elmelet: Theoretical background - WHY (200-400 chars)
 * - gyakorlat_leiras: Detailed practice - HOW (400-800 chars)
 * - journaling_kerdesek: Self-reflection questions (3-5 items)
 * - affirmacio: Daily affirmation (60-150 chars)
 * - motivacio: Closing motivation (80-200 chars)
 */
export const WorkbookDaySchema = z.object({
  day_number: z.number()
    .int()
    .min(1, "Day number must be at least 1")
    .max(30, "Day number cannot exceed 30"),

  csakra: z.string()
    .min(1, "Chakra name is required"),

  napi_szandek: z.string()
    .min(20, "Daily intention must be at least 20 characters")
    .max(200, "Daily intention must not exceed 200 characters"),

  elmelet: z.string()
    .min(100, "Theoretical background must be at least 100 characters")
    .max(500, "Theoretical background must not exceed 500 characters"),

  gyakorlat_leiras: z.string()
    .min(200, "Practice description must be at least 200 characters")
    .max(1000, "Practice description must not exceed 1000 characters"),

  journaling_kerdesek: z.array(z.string())
    .min(3, "Must have at least 3 journaling questions")
    .max(5, "Must not exceed 5 journaling questions"),

  affirmacio: z.string()
    .min(30, "Affirmation must be at least 30 characters")
    .max(200, "Affirmation must not exceed 200 characters"),

  motivacio: z.string()
    .min(40, "Motivation must be at least 40 characters")
    .max(300, "Motivation must not exceed 300 characters"),
});

/**
 * Exported type for a single workbook day
 */
export type WorkbookDay = z.infer<typeof WorkbookDaySchema>;

// ============================================================================
// WORKBOOK DAYS RESPONSE SCHEMA (15 days per API call)
// ============================================================================

/**
 * Schema for GPT-5 response containing exactly 15 days
 *
 * Used for both API calls:
 * - Call #1: Days 1-15
 * - Call #2: Days 16-30
 */
export const WorkbookDaysResponseSchema = z.object({
  days: z.array(WorkbookDaySchema)
    .length(15, "Must contain exactly 15 days"),
});

/**
 * Exported type for GPT-5 response (15 days)
 */
export type WorkbookDaysResponse = z.infer<typeof WorkbookDaysResponseSchema>;

// ============================================================================
// CHAKRA DAY DISTRIBUTION SCHEMA
// ============================================================================

/**
 * Schema for chakra day distribution (personalization based on scores)
 *
 * Example:
 * {
 *   "Gyökércsakra": 6,      // 6 days (blocked, score 4-7)
 *   "Szakrális csakra": 4,  // 4 days (imbalanced, score 8-12)
 *   "Szív csakra": 3,       // 3 days (healthy, score 13-16)
 *   ...
 * }
 *
 * Total must equal 30 days
 */
export const ChakraDayDistributionSchema = z.record(
  z.string(), // Chakra name
  z.number().int().min(1).max(10) // Days per chakra (1-10 range)
).refine(
  (distribution) => {
    const total = Object.values(distribution).reduce((sum, days) => sum + days, 0);
    return total === 30;
  },
  {
    message: "Total days across all chakras must equal exactly 30",
  }
);

/**
 * Exported type for chakra day distribution
 */
export type ChakraDayDistribution = z.infer<typeof ChakraDayDistributionSchema>;

// ============================================================================
// COMPLETE WORKBOOK SCHEMA (30 days)
// ============================================================================

/**
 * Schema for complete 30-day workbook content
 *
 * Combines both GPT-5 responses (Days 1-15 + Days 16-30)
 */
export const CompleteWorkbookSchema = z.object({
  days: z.array(WorkbookDaySchema)
    .length(30, "Complete workbook must contain exactly 30 days"),

  distribution: ChakraDayDistributionSchema,
});

/**
 * Exported type for complete workbook (30 days)
 */
export type CompleteWorkbook = z.infer<typeof CompleteWorkbookSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates and normalizes a single workbook day
 *
 * @param day - Raw day data from GPT-5
 * @returns Validated WorkbookDay or throws ZodError
 */
export function validateWorkbookDay(day: unknown): WorkbookDay {
  return WorkbookDaySchema.parse(day);
}

/**
 * Validates a 15-day GPT-5 response with automatic default injection for missing fields
 *
 * @param response - Raw GPT-5 response
 * @returns Validated WorkbookDaysResponse or throws ZodError
 */
export function validateWorkbookDaysResponse(response: unknown): WorkbookDaysResponse {
  // First, check if response has days array
  if (typeof response !== 'object' || response === null || !('days' in response)) {
    throw new Error('Response must have a "days" array');
  }

  const responseObj = response as { days: unknown[] };

  // Fill missing journaling_kerdesek with defaults
  const normalizedDays = responseObj.days.map((day: any) => {
    if (!day.journaling_kerdesek || !Array.isArray(day.journaling_kerdesek) || day.journaling_kerdesek.length === 0) {
      console.warn(`[Validation] Missing journaling_kerdesek for day ${day.day_number}, using defaults`);
      return {
        ...day,
        journaling_kerdesek: [
          "Mit tanultam ma a csakrámról?",
          "Hogyan éreztem magam a mai gyakorlat során?",
          "Mi változott bennem?"
        ]
      };
    }
    return day;
  });

  // Now validate with normalized data
  return WorkbookDaysResponseSchema.parse({ days: normalizedDays });
}

/**
 * Validates complete 30-day workbook
 *
 * @param workbook - Complete workbook data
 * @returns Validated CompleteWorkbook or throws ZodError
 */
export function validateCompleteWorkbook(workbook: unknown): CompleteWorkbook {
  return CompleteWorkbookSchema.parse(workbook);
}

/**
 * Validates chakra day distribution
 *
 * @param distribution - Chakra-to-days mapping
 * @returns Validated ChakraDayDistribution or throws ZodError
 */
export function validateChakraDayDistribution(distribution: unknown): ChakraDayDistribution {
  return ChakraDayDistributionSchema.parse(distribution);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if data is a valid WorkbookDay
 *
 * @param data - Data to check
 * @returns True if data matches WorkbookDay schema
 */
export function isWorkbookDay(data: unknown): data is WorkbookDay {
  return WorkbookDaySchema.safeParse(data).success;
}

/**
 * Type guard to check if data is a valid WorkbookDaysResponse
 *
 * @param data - Data to check
 * @returns True if data matches WorkbookDaysResponse schema
 */
export function isWorkbookDaysResponse(data: unknown): data is WorkbookDaysResponse {
  return WorkbookDaysResponseSchema.safeParse(data).success;
}

// ============================================================================
// EXAMPLE USAGE (for documentation)
// ============================================================================

/**
 * Example validated workbook day:
 *
 * const day: WorkbookDay = {
 *   day_number: 15,
 *   csakra: "Torok csakra",
 *   napi_szandek: "Ma megtanulom hitelesen kifejezni magam minden helyzetben.",
 *   elmelet: "A Torok csakra a hiteles kifejezés központja. Amikor blokkolt, " +
 *            "nehezen mondjuk ki az igazságunkat, vagy túl sokat beszélünk érdemtelenül.",
 *   gyakorlat_leiras: "1. Reggel felkelve állj a tükör elé és mondj el hangosan 3 dolgot...",
 *   journaling_kerdesek: [
 *     "Mikor hallgattam el ma magam?",
 *     "Mit szeretnék kimondani, de nem merek?",
 *     "Hogyan érezném magam, ha szabadon beszélnék?"
 *   ],
 *   affirmacio: "Szabadon és hitelesen kifejezem magam. A hangom fontos és értékes.",
 *   motivacio: "Emlékezz: minden szavad számít. A te igazságod egyedi és fontos."
 * };
 */
