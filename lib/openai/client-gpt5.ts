/**
 * GPT-5 Client Configuration
 * OpenAI client for generating detailed chakra reports with GPT-5
 */

import OpenAI from "openai";
import { logger } from "@/lib/utils/logger";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

/**
 * OpenAI client instance for GPT-5 (singleton)
 */
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT-5-mini Configuration - Responses API
 * Single combined API call for all content
 * Uses the new Responses API endpoint: /v1/responses
 */
export const GPT5_CONFIG = {
  model: 'gpt-5-mini' as const,
  reasoning: { effort: 'minimal' as const },
  text: { verbosity: 'medium' as const },
  max_output_tokens: 8000,
};

/**
 * Test GPT-5 connection
 * Verifies API key and model access using Responses API
 */
export async function testGPT5Connection(): Promise<boolean> {
  try {
    // Note: TypeScript types not yet updated for Responses API
    const response = await (openaiClient as any).responses.create({
      model: 'gpt-5-mini',
      input: 'Test magyar nyelv',
      reasoning: { effort: 'minimal' },
      max_output_tokens: 50,
    });

    logger.info("GPT-5-mini connection test successful", {
      model: response.model,
      usage: response.usage,
    });

    return true;
  } catch (error) {
    logger.error("GPT-5-mini connection test failed", { error });
    return false;
  }
}
