/**
 * GPT-5 Report Generation - Zod Schemas
 * Type-safe validation for all GPT-5 API responses
 *
 * CRITICAL: ChakraAnalysisSchema does NOT include elsosegely_terv field
 * User explicitly requested removal: "CSAK elemzés, NINCS megoldás"
 */

import { z } from 'zod';

/**
 * Phase 1: Master Analysis Schema
 * Overall energy pattern and priorities
 */
export const MasterAnalysisSchema = z.object({
  osszefoglalo: z.string()
    .min(200, "Summary must be at least 200 characters")
    .max(1000, "Summary must not exceed 1000 characters"),
  fo_prioritasok: z.array(z.string())
    .length(3, "Must have exactly 3 priorities"),
  kialakulasi_okok: z.string()
    .min(200, "Root causes must be at least 200 characters")
    .max(1000, "Root causes must not exceed 1000 characters"),
});

export type MasterAnalysis = z.infer<typeof MasterAnalysisSchema>;

/**
 * Phase 2: Per-Chakra Analysis Schema
 *
 * CRITICAL: NO elsosegely_terv field
 * This is analysis only - no solution keys
 */
export const ChakraAnalysisSchema = z.object({
  nev: z.string()
    .min(1, "Chakra name is required"),
  reszletes_elemzes: z.string()
    .min(100, "Detailed analysis must be at least 100 characters")
    .max(1000, "Detailed analysis must not exceed 1000 characters"),
  megnyilvánulasok: z.object({
    fizikai: z.array(z.string())
      .min(1, "Must have at least 1 physical manifestation")
      .max(6, "Must not exceed 6 physical manifestations")
      .default(['Nincs megadva']),
    erzelmi: z.array(z.string())
      .min(1, "Must have at least 1 emotional manifestation")
      .max(6, "Must not exceed 6 emotional manifestations")
      .default(['Nincs megadva']),
    mentalis: z.array(z.string())
      .min(1, "Must have at least 1 mental manifestation")
      .max(6, "Must not exceed 6 mental manifestations")
      .default(['Nincs megadva']),
  }).optional().default({ fizikai: ['Nincs megadva'], erzelmi: ['Nincs megadva'], mentalis: ['Nincs megadva'] }),
  gyokerok: z.string()
    .min(50, "Root causes must be at least 50 characters")
    .max(600, "Root causes must not exceed 600 characters"),
  megerosito_mondatok: z.array(z.string())
    .min(3, "Must have at least 3 affirmations")
    .max(7, "Must not exceed 7 affirmations"),
});

export type ChakraAnalysis = z.infer<typeof ChakraAnalysisSchema>;

/**
 * Phase 3: Forecasts Schema
 * 3 time horizons + positive scenario
 */
export const ForecastSchema = z.object({
  hat_honap: z.string()
    .min(200, "6-month forecast must be at least 200 characters")
    .max(1000, "6-month forecast must not exceed 1000 characters"),
  egy_ev: z.string()
    .min(200, "1-year forecast must be at least 200 characters")
    .max(1000, "1-year forecast must not exceed 1000 characters"),
  ket_ev: z.string()
    .min(200, "2-year forecast must be at least 200 characters")
    .max(1000, "2-year forecast must not exceed 1000 characters"),
  pozitiv_forgatokonyvv: z.string()
    .min(300, "Positive scenario must be at least 300 characters")
    .max(1200, "Positive scenario must not exceed 1200 characters"),
});

export type Forecast = z.infer<typeof ForecastSchema>;

/**
 * Complete Report Schema
 * Combines all 3 phases into single validated report
 */
export const CompleteReportSchema = z.object({
  master: MasterAnalysisSchema,
  chakras: z.array(ChakraAnalysisSchema)
    .length(7, "Must have exactly 7 chakra analyses"),
  forecasts: ForecastSchema,
});

export type CompleteReport = z.infer<typeof CompleteReportSchema>;
