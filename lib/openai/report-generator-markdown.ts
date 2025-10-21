/**
 * Markdown Report Generator using GPT-5
 * Generates complete chakra report in Markdown format
 */

import OpenAI from 'openai';
import { buildMarkdownReportPrompt } from './prompts-markdown';
import { MarkdownReportSchema } from './schemas-markdown';
import type { ChakraScores } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export interface MarkdownReportResult {
  markdown: string;
}

/**
 * Generate complete chakra report in Markdown format
 */
export async function generateMarkdownReport(
  chakraScores: ChakraScores,
  userName: string
): Promise<MarkdownReportResult> {
  console.log('[MARKDOWN_GENERATOR] Starting report generation for:', userName);
  console.log('[MARKDOWN_GENERATOR] Chakra scores:', chakraScores);

  const prompt = buildMarkdownReportPrompt(chakraScores, userName);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Te egy tapasztalt spirituális csakra elemző vagy, aki magyar nyelvű, részletes Markdown formátumú jelentéseket készít. VÁLASZOLJ MINDIG VALID JSON FORMÁTUMBAN!',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('[MARKDOWN_GENERATOR] Received response, length:', responseText.length);

    // Parse and validate JSON response
    const parsedResponse = JSON.parse(responseText);
    const validatedReport = MarkdownReportSchema.parse(parsedResponse);

    console.log('[MARKDOWN_GENERATOR] Report generated successfully');
    console.log('[MARKDOWN_GENERATOR] Markdown length:', validatedReport.markdown.length);

    return validatedReport;
  } catch (error) {
    console.error('[MARKDOWN_GENERATOR] Error:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to generate markdown report: ${error.message}`);
    }

    throw new Error('Failed to generate markdown report: Unknown error');
  }
}
