/**
 * GPT-5 Markdown Report Schema
 * Simple string-based Markdown output for PDF conversion
 */

import { z } from 'zod';

/**
 * Complete Markdown Report Schema
 * GPT-5 returns a single Markdown-formatted string
 */
export const MarkdownReportSchema = z.object({
  markdown: z.string()
    .min(5000, "Report must be at least 5000 characters")
    .max(50000, "Report must not exceed 50000 characters"),
});

export type MarkdownReport = z.infer<typeof MarkdownReportSchema>;
