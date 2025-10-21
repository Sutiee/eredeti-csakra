/**
 * Markdown to PDF Converter
 * Uses md-to-pdf for clean Hungarian character support and automatic text wrapping
 */

import mdToPdf from 'md-to-pdf';
import type { ChakraScores } from '@/types';

/**
 * Convert Markdown report to PDF buffer
 */
export async function convertMarkdownToPDF(
  markdown: string,
  chakraScores: ChakraScores,
  userName: string,
  userEmail: string
): Promise<Buffer> {
  console.log('[MARKDOWN_TO_PDF] Starting PDF conversion');
  console.log('[MARKDOWN_TO_PDF] User:', userName, userEmail);

  try {
    // Inline CSS directly in markdown using <style> tag
    const styledMarkdown = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20mm;
}

h1 {
  font-size: 24pt;
  font-weight: 700;
  color: #7C3AED;
  margin-top: 30px;
  margin-bottom: 20px;
  page-break-before: always;
}

h1:first-of-type {
  page-break-before: auto;
}

h2 {
  font-size: 18pt;
  font-weight: 600;
  color: #8B5CF6;
  margin-top: 25px;
  margin-bottom: 15px;
}

h3 {
  font-size: 14pt;
  font-weight: 600;
  color: #A78BFA;
  margin-top: 20px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 12px;
  text-align: justify;
}

strong {
  font-weight: 600;
  color: #6D28D9;
}

em {
  font-style: italic;
  color: #7C3AED;
}

ul, ol {
  margin-bottom: 15px;
  padding-left: 30px;
}

li {
  margin-bottom: 8px;
}

hr {
  border: none;
  border-top: 2px solid #E9D5FF;
  margin: 30px 0;
}

@page {
  margin: 20mm;
  size: A4;
}

@media print {
  body {
    padding: 0;
  }
}
</style>

${markdown}
`;

    const pdf = await mdToPdf(
      { content: styledMarkdown },
      {
        dest: undefined, // Return buffer instead of writing to file
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          printBackground: true,
        },
        body_class: ['markdown-body'],
      }
    );

    if (!pdf || !pdf.content) {
      throw new Error('PDF conversion failed: No content returned');
    }

    console.log('[MARKDOWN_TO_PDF] PDF generated successfully');
    console.log('[MARKDOWN_TO_PDF] PDF size:', (pdf.content.length / 1024).toFixed(2), 'KB');

    return pdf.content;
  } catch (error) {
    console.error('[MARKDOWN_TO_PDF] Error:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to convert Markdown to PDF: ${error.message}`);
    }

    throw new Error('Failed to convert Markdown to PDF: Unknown error');
  }
}
