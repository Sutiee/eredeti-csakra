/**
 * Styled Markdown Report Generator using GPT-5
 * Generates beautifully formatted chakra report with CSS classes
 */

import OpenAI from 'openai';
import { buildStyledMarkdownReportPrompt } from './prompts-markdown-styled';
import { MarkdownReportSchema } from './schemas-markdown';
import type { ChakraScores } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-5-mini'; // Use GPT-5-mini for styled Markdown reports

export interface StyledMarkdownReportResult {
  markdown: string;
}

/**
 * Generate styled chakra report in Markdown+HTML format
 */
export async function generateStyledMarkdownReport(
  chakraScores: ChakraScores,
  userName: string
): Promise<StyledMarkdownReportResult> {
  console.log('[STYLED_MARKDOWN_GENERATOR] Starting styled report generation for:', userName);
  console.log('[STYLED_MARKDOWN_GENERATOR] Chakra scores:', chakraScores);

  const prompt = buildStyledMarkdownReportPrompt(chakraScores, userName);

  try {
    // GPT-5-mini uses the new Responses API (not Chat Completions API)
    // Responses API uses 'input' instead of 'messages'
    // Note: TypeScript types not yet updated, using type assertion
    const systemPrompt = 'Te egy tapasztalt spirituális csakra elemző vagy, aki gyönyörűen formázott, színes Markdown+HTML jelentéseket készít. VÁLASZOLJ MINDIG VALID JSON FORMÁTUMBAN!';
    const fullInput = `${systemPrompt}\n\n${prompt}`;

    const response = await (openai as any).responses.create({
      model: MODEL,
      input: fullInput,
      max_output_tokens: 16000,
      // GPT-5 Responses API doesn't support text.format like Chat Completions
      // We'll parse JSON from the response manually
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('[STYLED_MARKDOWN_GENERATOR] Received response, length:', responseText.length);

    // Parse and validate JSON response
    const parsedResponse = JSON.parse(responseText);
    const validatedReport = MarkdownReportSchema.parse(parsedResponse);

    console.log('[STYLED_MARKDOWN_GENERATOR] Styled report generated successfully');
    console.log('[STYLED_MARKDOWN_GENERATOR] Markdown length:', validatedReport.markdown.length);

    return validatedReport;
  } catch (error) {
    console.error('[STYLED_MARKDOWN_GENERATOR] Error:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to generate styled markdown report: ${error.message}`);
    }

    throw new Error('Failed to generate styled markdown report: Unknown error');
  }
}
