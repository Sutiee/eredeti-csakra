/**
 * Styled Markdown to PDF Converter
 * Beautiful chakra-colored PDF with page breaks and visual styling
 * Uses @sparticuz/chromium + Puppeteer directly for Vercel serverless compatibility
 */

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { marked } from 'marked';
import type { ChakraScores } from '@/types';

/**
 * Convert styled Markdown report to beautifully formatted PDF
 * Uses Puppeteer directly with @sparticuz/chromium for Vercel compatibility
 */
export async function convertStyledMarkdownToPDF(
  markdown: string,
  chakraScores: ChakraScores,
  userName: string,
  userEmail: string
): Promise<Buffer> {
  console.log('[STYLED_MARKDOWN_TO_PDF] Starting PDF conversion');
  console.log('[STYLED_MARKDOWN_TO_PDF] User:', userName, userEmail);

  let browser = null;

  try {
    // Detect environment for Chromium selection
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('[STYLED_MARKDOWN_TO_PDF] Environment:', isProduction ? 'production (Vercel)' : 'development (local)');

    // Convert Markdown to HTML
    const htmlBody = await marked(markdown);

    // Full HTML document with inline CSS
    const styledHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
</head>
<body>
  ${htmlBody}
</body>
</html>
`;

    console.log('[STYLED_MARKDOWN_TO_PDF] HTML generated, length:', styledHTML.length);

    // Launch Puppeteer with appropriate Chromium binary
    if (isProduction) {
      console.log('[STYLED_MARKDOWN_TO_PDF] Launching Puppeteer with @sparticuz/chromium');

      // Set font config for Vercel (prevents font errors)
      chromium.setGraphicsMode = false;

      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      console.log('[STYLED_MARKDOWN_TO_PDF] Launching Puppeteer with local Chrome');
      browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
      });
    }

    console.log('[STYLED_MARKDOWN_TO_PDF] Browser launched successfully');

    // Create a new page
    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(styledHTML, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    console.log('[STYLED_MARKDOWN_TO_PDF] Page content set, generating PDF');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();
    browser = null;

    console.log('[STYLED_MARKDOWN_TO_PDF] PDF generated successfully');
    console.log('[STYLED_MARKDOWN_TO_PDF] PDF size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');

    return Buffer.from(pdfBuffer);
  } catch (error) {
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[STYLED_MARKDOWN_TO_PDF] Error closing browser:', closeError);
      }
    }

    console.error('[STYLED_MARKDOWN_TO_PDF] Error:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to convert styled Markdown to PDF: ${error.message}`);
    }

    throw new Error('Failed to convert styled Markdown to PDF: Unknown error');
  }
}
