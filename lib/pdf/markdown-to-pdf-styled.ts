/**
 * Styled Markdown to PDF Converter
 * Beautiful chakra-colored PDF with page breaks and visual styling
 * Uses @sparticuz/chromium for Vercel serverless compatibility
 */

import mdToPdf from 'md-to-pdf';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { ChakraScores } from '@/types';

/**
 * Convert styled Markdown report to beautifully formatted PDF
 */
export async function convertStyledMarkdownToPDF(
  markdown: string,
  chakraScores: ChakraScores,
  userName: string,
  userEmail: string
): Promise<Buffer> {
  console.log('[STYLED_MARKDOWN_TO_PDF] Starting PDF conversion');
  console.log('[STYLED_MARKDOWN_TO_PDF] User:', userName, userEmail);

  try {
    // Detect environment for Chromium selection
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('[STYLED_MARKDOWN_TO_PDF] Environment:', isProduction ? 'production (Vercel)' : 'development (local)');

    // Inline CSS with full chakra color palette
    const styledMarkdown = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap');

/* Base Styles */
body {
  font-family: 'Montserrat', sans-serif;
  font-size: 11pt;
  line-height: 1.7;
  color: #1F2937;
  max-width: 800px;
  margin: 0 auto;
  padding: 15mm;
}

/* Headings */
h1 {
  font-family: 'Playfair Display', serif;
  font-size: 28pt;
  font-weight: 700;
  color: #7C3AED;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 30px;
  page-break-before: avoid;
}

h2 {
  font-family: 'Playfair Display', serif;
  font-size: 20pt;
  font-weight: 700;
  color: #6D28D9;
  margin-top: 30px;
  margin-bottom: 20px;
  border-bottom: 3px solid #E9D5FF;
  padding-bottom: 10px;
}

h3 {
  font-size: 15pt;
  font-weight: 600;
  color: #8B5CF6;
  margin-top: 25px;
  margin-bottom: 15px;
}

/* Paragraphs */
p {
  margin-bottom: 14px;
  text-align: justify;
}

strong {
  font-weight: 600;
  color: #581C87;
}

em {
  font-style: italic;
  color: #7C3AED;
}

/* Lists */
ul, ol {
  margin-bottom: 16px;
  padding-left: 30px;
  line-height: 1.8;
}

li {
  margin-bottom: 10px;
}

/* Horizontal Rules */
hr {
  border: none;
  border-top: 2px solid #E9D5FF;
  margin: 35px 0;
  page-break-after: always;
}

/* Cover Page */
.cover-page {
  background: linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%);
  padding: 30px;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(124, 58, 237, 0.1);
}

/* Priority Box */
.priority-box {
  background: linear-gradient(to right, #FEF3C7, #FEF9E7);
  border-left: 5px solid #F59E0B;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15);
}

/* Intro Section */
.intro-section {
  background: #F9FAFB;
  padding: 25px;
  border-radius: 10px;
  margin: 25px 0;
  border: 2px solid #E5E7EB;
}

/* Chakra Sections - Each with unique color */
.chakra-section {
  padding: 25px;
  margin: 30px 0;
  border-radius: 12px;
  page-break-before: always;
  page-break-inside: avoid;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

/* Gyökércsakra - Red */
.chakra-root {
  background: linear-gradient(135deg, #FEE2E2 0%, #FFFFFF 50%);
  border-left: 8px solid #DC2626;
}

.chakra-root h2 {
  color: #991B1B;
  border-bottom-color: #FCA5A5;
}

/* Szakrális csakra - Orange */
.chakra-sacral {
  background: linear-gradient(135deg, #FFEDD5 0%, #FFFFFF 50%);
  border-left: 8px solid #EA580C;
}

.chakra-sacral h2 {
  color: #C2410C;
  border-bottom-color: #FDBA74;
}

/* Napfonat csakra - Yellow */
.chakra-solar {
  background: linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 50%);
  border-left: 8px solid #F59E0B;
}

.chakra-solar h2 {
  color: #D97706;
  border-bottom-color: #FCD34D;
}

/* Szív csakra - Green */
.chakra-heart {
  background: linear-gradient(135deg, #D1FAE5 0%, #FFFFFF 50%);
  border-left: 8px solid #10B981;
}

.chakra-heart h2 {
  color: #047857;
  border-bottom-color: #6EE7B7;
}

/* Torok csakra - Blue */
.chakra-throat {
  background: linear-gradient(135deg, #DBEAFE 0%, #FFFFFF 50%);
  border-left: 8px solid #3B82F6;
}

.chakra-throat h2 {
  color: #1E40AF;
  border-bottom-color: #93C5FD;
}

/* Harmadik szem - Indigo */
.chakra-third-eye {
  background: linear-gradient(135deg, #E0E7FF 0%, #FFFFFF 50%);
  border-left: 8px solid #6366F1;
}

.chakra-third-eye h2 {
  color: #4338CA;
  border-bottom-color: #A5B4FC;
}

/* Korona csakra - Purple */
.chakra-crown {
  background: linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 50%);
  border-left: 8px solid #9333EA;
}

.chakra-crown h2 {
  color: #6B21A8;
  border-bottom-color: #D8B4FE;
}

/* Affirmation Box */
.affirmation-box {
  background: linear-gradient(to right, #F3E8FF, #FAF5FF);
  border: 2px solid #9333EA;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 3px 6px rgba(147, 51, 234, 0.15);
}

.affirmation-box h3 {
  color: #7C3AED;
  margin-top: 0;
}

/* Exercise Card */
.exercise-card {
  background: linear-gradient(to bottom, #DBEAFE, #F0F9FF);
  border-left: 4px solid #3B82F6;
  border-radius: 8px;
  padding: 16px;
  margin: 15px 0;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.12);
}

.exercise-card strong {
  color: #1E40AF;
}

/* Overview Section */
.overview-section {
  background: #FFFBEB;
  padding: 25px;
  border-radius: 10px;
  margin: 25px 0;
  border: 2px solid #FCD34D;
}

/* Forecast Section */
.forecast-section {
  background: #F0FDF4;
  padding: 25px;
  border-radius: 10px;
  margin: 25px 0;
  border: 2px solid #86EFAC;
}

.positive-scenario {
  background: linear-gradient(135deg, #D1FAE5, #ECFDF5);
  border: 2px solid #10B981;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 3px 6px rgba(16, 185, 129, 0.15);
}

.positive-scenario h3 {
  color: #047857;
}

/* Exercises Section */
.exercises-section {
  background: #FFF7ED;
  padding: 25px;
  border-radius: 10px;
  margin: 25px 0;
  page-break-before: always;
}

/* Tracking Section */
.tracking-section {
  background: #F5F3FF;
  padding: 25px;
  border-radius: 10px;
  margin: 25px 0;
}

/* Closing Section */
.closing-section {
  background: linear-gradient(135deg, #FCEEF5 0%, #FFFFFF 100%);
  padding: 30px;
  border-radius: 15px;
  margin: 30px 0;
  text-align: center;
  box-shadow: 0 4px 8px rgba(219, 39, 119, 0.1);
  page-break-inside: avoid;
}

/* Page Settings */
@page {
  margin: 20mm;
  size: A4;
}

@media print {
  body {
    padding: 0;
  }

  .chakra-section {
    page-break-before: always;
    page-break-inside: avoid;
  }

  h2 {
    page-break-after: avoid;
  }
}
</style>

${markdown}
`;

    const pdf = await mdToPdf(
      { content: styledMarkdown },
      {
        dest: undefined,
        launch_options: {
          args: isProduction ? chromium.args : [],
          executablePath: isProduction
            ? await chromium.executablePath()
            : (process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
          headless: true,
        },
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          printBackground: true,
          preferCSSPageSize: true,
        },
        body_class: ['chakra-report'],
      }
    );

    if (!pdf || !pdf.content) {
      throw new Error('PDF conversion failed: No content returned');
    }

    console.log('[STYLED_MARKDOWN_TO_PDF] PDF generated successfully');
    console.log('[STYLED_MARKDOWN_TO_PDF] PDF size:', (pdf.content.length / 1024).toFixed(2), 'KB');

    return pdf.content;
  } catch (error) {
    console.error('[STYLED_MARKDOWN_TO_PDF] Error:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to convert styled Markdown to PDF: ${error.message}`);
    }

    throw new Error('Failed to convert styled Markdown to PDF: Unknown error');
  }
}
