/**
 * GPT-5 Report Generator - Main Orchestrator
 * Coordinates 3-phase report generation with parallel processing
 *
 * Architecture:
 * - Phase 1: Master Analysis (1 API call)
 * - Phase 2: Chakra Deep Dives (7 parallel API calls)
 * - Phase 3: Forecasts (1 API call)
 * Total: 9 API calls, ~30 seconds execution time
 */

import { openaiClient, GPT5_CONFIG } from './client-gpt5';
import { buildCompleteReportPrompt } from './prompts-gpt5';
import {
  MasterAnalysisSchema,
  ChakraAnalysisSchema,
  ForecastSchema,
  CompleteReportSchema,
  type CompleteReport,
  type MasterAnalysis,
  type ChakraAnalysis,
  type Forecast,
} from './schemas-gpt5';
import type { ChakraScores, QuizAnswers, ChakraName } from '@/types';
import { getChakraNames } from '@/lib/quiz/chakras';
import { logger } from '@/lib/utils/logger';

/**
 * Main orchestrator function
 * Generates complete GPT-5 report with all 3 phases
 *
 * @param chakraScores - Calculated chakra scores (4-16 range)
 * @param answers - Raw quiz answers (28 answers, 1-4 scale)
 * @param userName - User's name for personalization
 * @returns Complete validated report
 */
export async function generateGPT5Report(
  chakraScores: ChakraScores,
  answers: QuizAnswers,
  userName: string
): Promise<CompleteReport> {
  logger.info('[GPT5_REPORT] Starting report generation', {
    userName,
    chakraScores,
  });

  try {
    // ====================================================================
    // SINGLE API CALL - ALL CONTENT AT ONCE (Responses API)
    // ====================================================================
    logger.info('[GPT5_REPORT] Generating complete report (1 API call with gpt-5-mini)');

    const completePrompt = buildCompleteReportPrompt(chakraScores, answers, userName);

    const response = await openaiClient.responses.create({
      ...GPT5_CONFIG,
      input: completePrompt,
    });

    const content = response.output_text;

    if (!content) {
      throw new Error('No content received from GPT-5-mini');
    }

    // Parse and validate entire report with Zod
    const reportData = JSON.parse(content);

    const master: MasterAnalysis = MasterAnalysisSchema.parse(reportData.master);
    const chakras: ChakraAnalysis[] = reportData.chakras.map((data: any) =>
      ChakraAnalysisSchema.parse(data)
    );
    const forecasts: Forecast = ForecastSchema.parse(reportData.forecasts);

    logger.info('[GPT5_REPORT] Report generation completed', {
      usage: response.usage,
      totalChakras: chakras.length,
    });

    // ====================================================================
    // FINAL VALIDATION
    // ====================================================================
    const completeReport: CompleteReport = {
      master,
      chakras,
      forecasts,
    };

    // Final validation with complete schema
    const validatedReport = CompleteReportSchema.parse(completeReport);

    logger.info('[GPT5_REPORT] Report generation completed successfully', {
      totalChakras: validatedReport.chakras.length,
      hasMaster: !!validatedReport.master,
      hasForecasts: !!validatedReport.forecasts,
    });

    return validatedReport;
  } catch (error) {
    logger.error('[GPT5_REPORT] Report generation failed', {
      error: error instanceof Error ? error.message : String(error),
      errorDetails: error,
    });

    throw new Error(
      `GPT-5 report generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Helper function to get total word count estimate
 * Useful for monitoring API usage and costs
 */
export function estimateReportWordCount(report: CompleteReport): number {
  let totalChars = 0;

  // Master analysis
  totalChars += report.master.osszefoglalo.length;
  totalChars += report.master.kialakulasi_okok.length;

  // Chakra analyses
  report.chakras.forEach((chakra) => {
    totalChars += chakra.reszletes_elemzes.length;
    totalChars += chakra.gyokerok.length;
  });

  // Forecasts
  totalChars += report.forecasts.hat_honap.length;
  totalChars += report.forecasts.egy_ev.length;
  totalChars += report.forecasts.ket_ev.length;
  totalChars += report.forecasts.pozitiv_forgatokonyvv.length;

  // Rough estimate: 1 word = 5 characters in Hungarian
  return Math.round(totalChars / 5);
}

/**
 * Helper function to extract blocked chakras for exercises
 * Returns chakras with score <= 12
 */
export function getBlockedChakras(chakraScores: ChakraScores): ChakraName[] {
  return (Object.entries(chakraScores) as [ChakraName, number][])
    .filter(([_, score]) => score <= 12)
    .map(([name, _]) => name);
}
