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

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Te egy tapasztalt spirituális csakra elemző vagy, aki gyönyörűen formázott, színes Markdown+HTML jelentéseket készít. VÁLASZOLJ MINDIG VALID JSON FORMÁTUMBAN!',
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
