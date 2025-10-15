/**
 * OpenAI Client Configuration
 * GPT-4o-mini for generating detailed chakra reports
 */

import OpenAI from "openai";
import { logger } from "@/lib/utils/logger";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

if (!process.env.OPENAI_MODEL) {
  throw new Error("Missing OPENAI_MODEL environment variable");
}

/**
 * OpenAI client instance (singleton)
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * OpenAI model to use (gpt-4o-mini)
 */
export const OPENAI_MODEL = process.env.OPENAI_MODEL;

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: "Test" }],
      max_tokens: 5,
    });

    logger.info("OpenAI connection test successful", {
      model: response.model,
      usage: response.usage,
    });

    return true;
  } catch (error) {
    logger.error("OpenAI connection test failed", { error });
    return false;
  }
}
