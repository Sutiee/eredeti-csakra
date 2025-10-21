/**
 * GPT-5 PDF Report Template Generator
 * v2.2 - 18-20 Page Detailed Chakra Analysis
 *
 * CRITICAL REQUIREMENTS:
 * - NO weekly plan page (reserved for upsell)
 * - NO elsősegély terv page (user removed this)
 * - Fixed exercises ONLY for blocked chakras (score ≤ 12)
 * - Professional typography with Hungarian language support
 * - Chakra-colored section headers
 */

import jsPDF from 'jspdf';
import type { CompleteReport, MasterAnalysis, ChakraAnalysis, Forecast } from '@/lib/openai/schemas-gpt5';
import type { ChakraScores, ChakraName } from '@/types';
import { CHAKRA_EXERCISES, getExercisesForBlockedChakras } from '@/data/chakra-exercises';
import { getChakraByName, getChakraColor } from '@/lib/quiz/chakras';
import { logger } from '@/lib/utils/logger';

/**
 * PDF Configuration Constants
 */
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 25, // 25mm margins
  contentWidth: 135, // DRASTIC reduction: 135mm (was 150mm, 160mm, 170mm)
  lineHeight: 5,
  fontSize: {
    title: 20, // Further reduced from 22
    heading1: 15, // Further reduced from 16
    heading2: 12, // Further reduced from 13
    heading3: 10, // Further reduced from 11
    body: 9, // Reduced from 10 for safety
    small: 8,
  },
} as const;

/**
 * Main function to generate PDF report
 *
 * @param report - Complete GPT-5 generated report
 * @param chakraScores - Chakra scores (4-16 for each chakra)
 * @param userName - User's name
 * @param userEmail - User's email
 * @returns PDF document as Buffer
 */
export async function generateReportPDF(
  report: CompleteReport,
  chakraScores: ChakraScores,
  userName: string,
  userEmail: string
): Promise<Buffer> {
  logger.info('Generating GPT-5 PDF report', {
    userName,
    userEmail,
    totalChakras: report.chakras.length,
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Use Helvetica font
  doc.setFont('helvetica', 'normal');

  try {
    // Page 1: Cover page
    addCoverPage(doc, userName);

    // Page 2: Summary (Master Analysis)
    doc.addPage();
    addSummaryPage(doc, report.master);

    // Page 3: Chakra Basics
    doc.addPage();
    addChakraBasicsPage(doc);

    // Pages 4-10: Chakra Detail Pages (7 chakras)
    // CRITICAL: NO elsősegély terv section
    report.chakras.forEach((chakraAnalysis) => {
      doc.addPage();
      const score = chakraScores[chakraAnalysis.nev as ChakraName];
      addChakraDetailPage(doc, chakraAnalysis, score);
    });

    // Page 11: Root Causes (Overall)
    doc.addPage();
    addRootCausesPage(doc, report.master.kialakulasi_okok);

    // Pages 12-13: Forecasts (3 time horizons)
    doc.addPage();
    addForecastsPage(doc, report.forecasts);

    // Pages 14-15: Positive Scenario
    doc.addPage();
    addPositiveScenarioPage(doc, report.forecasts.pozitiv_forgatokonyvv);

    // Pages 16-17: Fixed Exercises (only blocked chakras)
    const blockedChakras = Object.entries(chakraScores)
      .filter(([_, score]) => score <= 12)
      .map(([name, _]) => name);

    if (blockedChakras.length > 0) {
      doc.addPage();
      addExercisesPage(doc, blockedChakras);
    }

    // Page 18: Tracking Journal Template
    doc.addPage();
    addTrackingJournalPage(doc);

    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    logger.info('GPT-5 PDF generated successfully', {
      pages: doc.getNumberOfPages(),
      size: pdfBuffer.length,
    });

    return pdfBuffer;
  } catch (error) {
    logger.error('Failed to generate GPT-5 PDF', { error });
    throw new Error(`GPT-5 PDF generation failed: ${error}`);
  }
}

/**
 * Page 1: Cover Page
 */
function addCoverPage(doc: jsPDF, userName: string): void {
  const { pageWidth, pageHeight } = PDF_CONFIG;

  // Gradient background (spiritual purple to rose)
  doc.setFillColor(102, 126, 234); // #667eea
  doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');

  doc.setFillColor(118, 75, 162); // #764ba2
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  const title = 'Személyre Szabott';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 80);

  doc.setFontSize(28);
  const subtitle = 'Csakra Elemzésed';
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 95);

  // Subtitle line 2
  doc.setFontSize(18);
  const subtitle2 = 'Személyre Szabott Elemzés';
  const subtitle2Width = doc.getTextWidth(subtitle2);
  doc.text(subtitle2, (pageWidth - subtitle2Width) / 2, 110);

  // Name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  const nameText = userName;
  const nameWidth = doc.getTextWidth(nameText);
  doc.text(nameText, (pageWidth - nameWidth) / 2, 140);

  // Date
  doc.setFontSize(14);
  const dateText = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateWidth) / 2, 155);

  // Footer
  doc.setFontSize(12);
  const footer = 'Eredeti Csakra';
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, 270);
}

/**
 * Page 2: Summary Page (Master Analysis)
 */
function addSummaryPage(doc: jsPDF, master: MasterAnalysis): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Összefoglaló', margin, 30);

  // Summary content
  let yPos = 45;
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  const summaryLines = safeTextWrap(doc, master.osszefoglalo, contentWidth);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * PDF_CONFIG.lineHeight + 10;

  // Main priorities
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Fő Prioritások', margin, yPos);
  yPos += 10;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  master.fo_prioritasok.forEach((priority: string, index: number) => {
    const priorityLines = safeTextWrap(doc, `${index + 1}. ${priority}`, contentWidth - 10);
    doc.text(priorityLines, margin + 5, yPos);
    yPos += priorityLines.length * PDF_CONFIG.lineHeight + 3;
  });

  addPageFooter(doc);
}

/**
 * Page 3: Chakra Basics
 */
function addChakraBasicsPage(doc: jsPDF): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Mit Jelentenek a Csakrák?', margin, 30);

  let yPos = 45;
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');

  const intro = 'A hét fő csakra az energiaközpontjaid, amelyek a fizikai tested különböző részein helyezkednek el. Minden csakra más-más területért felel az életedben:';
  const introLines = safeTextWrap(doc, intro, contentWidth);
  doc.text(introLines, margin, yPos);
  yPos += introLines.length * PDF_CONFIG.lineHeight + 10;

  // List all 7 chakras with brief description
  const chakraNames: ChakraName[] = [
    'Gyökércsakra',
    'Szakrális csakra',
    'Napfonat csakra',
    'Szív csakra',
    'Torok csakra',
    'Harmadik szem',
    'Korona csakra',
  ];

  chakraNames.forEach((chakraName) => {
    const chakraMeta = getChakraByName(chakraName);
    if (!chakraMeta) return;

    // Chakra name with color
    const color = hexToRgb(chakraMeta.color);
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(margin + 2, yPos - 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize.heading3);
    doc.text(chakraMeta.name, margin + 6, yPos);
    yPos += 5;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize.body);
    const descLines = safeTextWrap(doc, chakraMeta.description, contentWidth - 10);
    doc.text(descLines, margin + 6, yPos);
    yPos += descLines.length * PDF_CONFIG.lineHeight + 5;
  });

  addPageFooter(doc);
}

/**
 * Pages 4-10: Chakra Detail Pages (7 pages)
 * CRITICAL: NO elsősegély terv section
 */
function addChakraDetailPage(
  doc: jsPDF,
  chakraAnalysis: ChakraAnalysis,
  score: number
): void {
  const { pageWidth, margin, contentWidth, fontSize } = PDF_CONFIG;
  const chakraMeta = getChakraByName(chakraAnalysis.nev as ChakraName);

  if (!chakraMeta) return;

  // Header with chakra color
  const color = hexToRgb(chakraMeta.color);
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(fontSize.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text(chakraMeta.name, margin, 15);

  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'normal');
  // Wrap subtitle text to prevent overflow
  const subtitle = `${chakraMeta.sanskritName} | ${chakraMeta.element}`;
  const subtitleLines = safeTextWrap(doc, subtitle, contentWidth);
  doc.text(subtitleLines, margin, 23);

  // Score
  let yPos = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pontszám: ${score} / 16`, margin, yPos);
  yPos += 10;

  // Detailed Analysis
  doc.setFontSize(fontSize.heading2);
  doc.setTextColor(102, 126, 234);
  doc.text('Részletes Elemzés', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const analysisLines = safeTextWrap(doc, chakraAnalysis.reszletes_elemzes, contentWidth);
  doc.text(analysisLines, margin, yPos);
  yPos += analysisLines.length * PDF_CONFIG.lineHeight + 10;

  // Manifestations
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Megnyilvánulások', margin, yPos);
  yPos += 8;

  // Physical
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Fizikai:', margin + 5, yPos);
  yPos += 5;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  chakraAnalysis.megnyilvánulasok.fizikai.forEach((item: string) => {
    const itemLines = safeTextWrap(doc, `• ${item}`, contentWidth - 10);
    doc.text(itemLines, margin + 7, yPos);
    yPos += itemLines.length * PDF_CONFIG.lineHeight + 2;
  });
  yPos += 3;

  // Emotional
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('Érzelmi:', margin + 5, yPos);
  yPos += 5;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  chakraAnalysis.megnyilvánulasok.erzelmi.forEach((item: string) => {
    const itemLines = safeTextWrap(doc, `• ${item}`, contentWidth - 10);
    doc.text(itemLines, margin + 7, yPos);
    yPos += itemLines.length * PDF_CONFIG.lineHeight + 2;
  });
  yPos += 3;

  // Mental
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('Mentális:', margin + 5, yPos);
  yPos += 5;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  chakraAnalysis.megnyilvánulasok.mentalis.forEach((item: string) => {
    const itemLines = safeTextWrap(doc, `• ${item}`, contentWidth - 10);
    doc.text(itemLines, margin + 7, yPos);
    yPos += itemLines.length * PDF_CONFIG.lineHeight + 2;
  });
  yPos += 5;

  // Check if we need a new page for the rest
  if (yPos > 200) {
    doc.addPage();
    yPos = 30;
  }

  // Root Causes
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Gyökerok', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const rootCausesLines = safeTextWrap(doc, chakraAnalysis.gyokerok, contentWidth);
  doc.text(rootCausesLines, margin, yPos);
  yPos += rootCausesLines.length * PDF_CONFIG.lineHeight + 10;

  // Affirmations
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Megerősítő Mondatok', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  chakraAnalysis.megerosito_mondatok.forEach((affirmation: string, index: number) => {
    const affirmationLines = safeTextWrap(doc, `${index + 1}. ${affirmation}`, contentWidth - 10);
    doc.text(affirmationLines, margin + 5, yPos);
    yPos += affirmationLines.length * PDF_CONFIG.lineHeight + 3;
  });

  addPageFooter(doc);
}

/**
 * Page 11: Root Causes (Overall)
 */
function addRootCausesPage(doc: jsPDF, kialakulasi_okok: string): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Kialakulás Okai', margin, 30);

  // Subtitle
  let yPos = 45;
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const subtitle = 'Hogyan alakult ki jelenlegi csakra állapotod?';
  doc.text(subtitle, margin, yPos);
  yPos += 10;

  // Content
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const rootCausesLines = safeTextWrap(doc, kialakulasi_okok, contentWidth);
  doc.text(rootCausesLines, margin, yPos);

  addPageFooter(doc);
}

/**
 * Pages 12-13: Forecasts (3 time horizons)
 */
function addForecastsPage(doc: jsPDF, forecasts: Forecast): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Előrejelzések', margin, 30);

  let yPos = 45;

  // 6 months
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('6 Hónap', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const sixMonthsLines = safeTextWrap(doc, forecasts.hat_honap, contentWidth);
  doc.text(sixMonthsLines, margin, yPos);
  yPos += sixMonthsLines.length * PDF_CONFIG.lineHeight + 10;

  // 1 year
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('1 Év', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const oneYearLines = safeTextWrap(doc, forecasts.egy_ev, contentWidth);
  doc.text(oneYearLines, margin, yPos);
  yPos += oneYearLines.length * PDF_CONFIG.lineHeight + 10;

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 30;
  }

  // 2 years
  doc.setFontSize(fontSize.heading2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('2 Év', margin, yPos);
  yPos += 8;

  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const twoYearsLines = safeTextWrap(doc, forecasts.ket_ev, contentWidth);
  doc.text(twoYearsLines, margin, yPos);

  addPageFooter(doc);
}

/**
 * Pages 14-15: Positive Scenario
 */
function addPositiveScenarioPage(doc: jsPDF, pozitiv_forgatokonyvv: string): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Pozitív Forgatókönyv', margin, 30);

  // Subtitle
  let yPos = 45;
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const subtitle = 'Mi történhet, ha odafigyelsz a csakráidra?';
  doc.text(subtitle, margin, yPos);
  yPos += 10;

  // Content
  doc.setFontSize(fontSize.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const scenarioLines = safeTextWrap(doc, pozitiv_forgatokonyvv, contentWidth);
  doc.text(scenarioLines, margin, yPos);

  addPageFooter(doc);
}

/**
 * Pages 16-17: Fixed Exercises (only blocked chakras)
 */
function addExercisesPage(doc: jsPDF, blockedChakras: string[]): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Gyakorlatok', margin, 30);

  // Subtitle
  let yPos = 45;
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const subtitle = 'Ezek a gyakorlatok segítenek a blokkolt csakráid aktivizálásában:';
  doc.text(subtitle, margin, yPos);
  yPos += 10;

  blockedChakras.forEach((chakraName) => {
    const exercises = CHAKRA_EXERCISES[chakraName];
    if (!exercises) return;

    const chakraMeta = getChakraByName(chakraName as ChakraName);
    if (!chakraMeta) return;

    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 30;
    }

    // Chakra name with color
    const color = hexToRgb(chakraMeta.color);
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(margin, yPos - 5, contentWidth, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(fontSize.heading2);
    doc.setFont('helvetica', 'bold');
    doc.text(chakraName, margin + 3, yPos);
    yPos += 10;

    // Exercises
    doc.setFontSize(fontSize.body);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    exercises.forEach((exercise, index) => {
      const exerciseLines = safeTextWrap(doc, `${index + 1}. ${exercise}`, contentWidth - 10);
      doc.text(exerciseLines, margin + 5, yPos);
      yPos += exerciseLines.length * PDF_CONFIG.lineHeight + 4;
    });
    yPos += 5;
  });

  addPageFooter(doc);
}

/**
 * Page 18: Tracking Journal Template
 */
function addTrackingJournalPage(doc: jsPDF): void {
  const { margin, contentWidth, fontSize } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Követési Napló', margin, 30);

  // Subtitle
  let yPos = 45;
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const subtitle = 'Kövesd nyomon a fejlődésedet ezzel az egyszerű naplóval:';
  doc.text(subtitle, margin, yPos);
  yPos += 10;

  // Instructions
  doc.setFontSize(fontSize.body);
  const instructions = [
    '1. Minden reggel válaszolj meg 1-1 kérdést minden csakrára (1-10 skálán)',
    '2. Este írd le a legfontosabb megfigyeléseidet',
    '3. Hetente nézd át a változásokat',
    '4. 4 hét után ismételd meg a kvízt és hasonlítsd össze az eredményeket',
  ];

  instructions.forEach((instruction) => {
    const instructionLines = safeTextWrap(doc, instruction, contentWidth);
    doc.text(instructionLines, margin, yPos);
    yPos += instructionLines.length * PDF_CONFIG.lineHeight + 3;
  });
  yPos += 10;

  // Sample tracking template
  doc.setFontSize(fontSize.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('Napi Kérdések (1-10 skála):', margin, yPos);
  yPos += 8;

  const trackingQuestions = [
    'Gyökércsakra: Mennyire érzem magam biztonságban ma?',
    'Szakrális csakra: Mennyire vagyok kapcsolatban az érzéseimmel?',
    'Napfonat csakra: Mennyire érzem magam erősnek és magabiztosnak?',
    'Szív csakra: Mennyire vagyok nyitott a szeretetre?',
    'Torok csakra: Mennyire tudtam hiteles lenni ma?',
    'Harmadik szem: Mennyire hallgattam az intuíciómra?',
    'Korona csakra: Mennyire éreztem a spirituális kapcsolódást?',
  ];

  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'normal');
  trackingQuestions.forEach((question) => {
    const questionLines = safeTextWrap(doc, `• ${question}`, contentWidth - 5);
    doc.text(questionLines, margin + 3, yPos);
    yPos += questionLines.length * PDF_CONFIG.lineHeight + 2;
  });

  addPageFooter(doc);
}

/**
 * Add page footer
 */
function addPageFooter(doc: jsPDF): void {
  const { pageWidth } = PDF_CONFIG;
  const pageNumber = doc.getCurrentPageInfo().pageNumber;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);

  const footer = `Eredeti Csakra - GPT-5 Powered Analysis | Oldal ${pageNumber}`;
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, 285);
}

/**
 * ULTRA-SAFE text wrapping for Hungarian text with ő, ű character compensation
 * jsPDF's Helvetica font INCORRECTLY calculates Hungarian extended character widths
 */
function safeTextWrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  // CRITICAL: Apply EXTREME safety margin
  // - 20mm base safety margin
  // - Additional compensation for Hungarian characters
  const safeWidth = maxWidth - 20;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    // Get width and add 15% compensation for Hungarian extended chars (ő, ű, ő, ú, etc.)
    const hungarianChars = (testLine.match(/[őűŐŰáéíóöúüÁÉÍÓÖÚÜ]/g) || []).length;
    let testWidth = doc.getTextWidth(testLine);

    // Add 15% extra width per Hungarian character (empirical measurement)
    testWidth += (hungarianChars * testWidth * 0.15);

    if (testWidth > safeWidth && currentLine !== '') {
      // Line is too long, save current line and start new one
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  // Push the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
