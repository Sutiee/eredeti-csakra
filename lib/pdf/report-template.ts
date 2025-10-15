/**
 * PDF Report Template Generator
 * Creates detailed chakra analysis PDF using jsPDF
 */

import jsPDF from "jspdf";
import type { ChakraName, ChakraScores, QuizResult } from "@/types";
import { CHAKRAS, getChakraByName } from "@/lib/quiz/chakras";
import { getInterpretationForScore } from "@/lib/quiz/interpretations";
import type { GeneratedReportData } from "@/lib/openai/report-generator";
import { logger } from "@/lib/utils/logger";

/**
 * PDF Report Input Data
 */
export type PDFReportData = {
  result: QuizResult;
  generatedReport: GeneratedReportData;
};

/**
 * PDF Configuration
 */
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 20,
  headerHeight: 30,
  footerHeight: 15,
};

/**
 * Generate PDF report
 *
 * @param data - Quiz result and generated report data
 * @returns PDF document as Buffer
 */
export async function generatePDFReport(
  data: PDFReportData
): Promise<Buffer> {
  logger.info("Generating PDF report", { resultId: data.result.id });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    // Cover page (page 1)
    addCoverPage(doc, data.result);

    // Summary page (page 2)
    doc.addPage();
    addSummaryPage(doc, data.result);

    // Chakra detail pages (pages 3-9)
    const chakraNames = Object.keys(data.result.chakra_scores) as ChakraName[];
    chakraNames.forEach((chakraName, index) => {
      doc.addPage();
      addChakraDetailPage(
        doc,
        chakraName,
        data.result.chakra_scores[chakraName],
        data.generatedReport,
        data.result
      );
    });

    // Weekly action plan page (page 10)
    doc.addPage();
    addWeeklyActionPlanPage(doc, data.generatedReport);

    // Meditation recommendations page (page 11)
    doc.addPage();
    addMeditationRecommendationsPage(doc, data.generatedReport);

    // Convert to buffer
    const pdfArrayBuffer = doc.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    logger.info("PDF generated successfully", {
      pages: doc.getNumberOfPages(),
      size: pdfBuffer.length,
    });

    return pdfBuffer;
  } catch (error) {
    logger.error("Failed to generate PDF", { error });
    throw new Error(`PDF generation failed: ${error}`);
  }
}

/**
 * Add cover page
 */
function addCoverPage(doc: jsPDF, result: QuizResult): void {
  const { pageWidth, pageHeight, margin } = PDF_CONFIG;

  // Gradient background (purple to pink)
  doc.setFillColor(102, 126, 234); // #667eea
  doc.rect(0, 0, pageWidth, pageHeight / 2, "F");

  doc.setFillColor(118, 75, 162); // #764ba2
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const title = "Személyre Szabott";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 80);

  doc.setFontSize(28);
  const subtitle = "Csakra Elemzésed";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 95);

  // Name
  doc.setFontSize(20);
  doc.setFont("helvetica", "normal");
  const nameText = result.name;
  const nameWidth = doc.getTextWidth(nameText);
  doc.text(nameText, (pageWidth - nameWidth) / 2, 120);

  // Date
  doc.setFontSize(14);
  const dateText = new Date(result.created_at).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateWidth) / 2, 135);

  // Footer
  doc.setFontSize(12);
  const footer = "Eredeti Csakra";
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, 270);
}

/**
 * Add summary page
 */
function addSummaryPage(doc: jsPDF, result: QuizResult): void {
  const { pageWidth, margin } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Összefoglaló", margin, 30);

  // Calculate overall wellness score
  const scores = Object.values(result.chakra_scores);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxScore = 7 * 16; // 7 chakras * 16 max score
  const wellnessPercentage = Math.round((totalScore / maxScore) * 100);

  // Wellness score box
  doc.setFillColor(240, 240, 255);
  doc.roundedRect(margin, 45, pageWidth - 2 * margin, 30, 3, 3, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(102, 126, 234);
  doc.text("Általános Wellness Pontszám", margin + 10, 58);

  doc.setFontSize(32);
  doc.text(`${wellnessPercentage}%`, margin + 10, 68);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`${totalScore} / ${maxScore} pont`, margin + 50, 68);

  // Balanced chakras count
  const balancedCount = scores.filter((score) => score >= 13).length;
  const imbalancedCount = scores.filter(
    (score) => score >= 8 && score <= 12
  ).length;
  const blockedCount = scores.filter((score) => score <= 7).length;

  let yPos = 90;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Csakra Állapotok", margin, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Balanced
  doc.setTextColor(50, 205, 50);
  doc.text(`✓ Kiegyensúlyozott: ${balancedCount} / 7`, margin + 10, yPos);

  // Imbalanced
  yPos += 8;
  doc.setTextColor(255, 165, 0);
  doc.text(
    `⚠ Kiegyensúlyozatlan: ${imbalancedCount} / 7`,
    margin + 10,
    yPos
  );

  // Blocked
  yPos += 8;
  doc.setTextColor(220, 20, 60);
  doc.text(`✗ Erősen blokkolt: ${blockedCount} / 7`, margin + 10, yPos);

  // Primary blocked chakra
  if (blockedCount > 0) {
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Leginkább Blokolt Csakra", margin, yPos);

    const lowestScore = Math.min(...scores);
    const primaryChakra = (
      Object.keys(result.chakra_scores) as ChakraName[]
    ).find((name) => result.chakra_scores[name] === lowestScore);

    if (primaryChakra) {
      const chakraMeta = getChakraByName(primaryChakra);
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`${primaryChakra} (${lowestScore} / 16 pont)`, margin + 10, yPos);

      if (chakraMeta) {
        yPos += 6;
        doc.setFontSize(10);
        doc.text(chakraMeta.location, margin + 10, yPos);
      }
    }
  }

  // Chakra scores visualization (simple bar chart)
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Csakra Pontszámok", margin, yPos);

  yPos += 10;
  (Object.keys(result.chakra_scores) as ChakraName[]).forEach((chakraName) => {
    const score = result.chakra_scores[chakraName];
    const chakraMeta = getChakraByName(chakraName);
    const barWidth = (score / 16) * 100; // Scale to 100mm max

    // Chakra name
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(chakraName, margin, yPos);

    // Bar
    if (chakraMeta) {
      const color = hexToRgb(chakraMeta.color);
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(margin + 45, yPos - 3, barWidth, 4, "F");
    }

    // Score
    doc.setTextColor(100, 100, 100);
    doc.text(`${score}/16`, margin + 150, yPos);

    yPos += 8;
  });
}

/**
 * Add chakra detail page
 */
function addChakraDetailPage(
  doc: jsPDF,
  chakraName: ChakraName,
  score: number,
  generatedReport: GeneratedReportData,
  result: QuizResult
): void {
  const { pageWidth, margin } = PDF_CONFIG;
  const chakraMeta = getChakraByName(chakraName);

  if (!chakraMeta) return;

  // Header with chakra color
  const color = hexToRgb(chakraMeta.color);
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(chakraMeta.name, margin, 15);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${chakraMeta.sanskritName} | ${chakraMeta.element}`, margin, 23);

  // Score and status
  let yPos = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Pontszám: ${score} / 16`, margin, yPos);

  // Status badge
  const interpretation = getInterpretationForScore(chakraName, score);
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  let statusColor: { r: number; g: number; b: number };
  if (score <= 7) {
    statusColor = { r: 220, g: 20, b: 60 }; // Red
  } else if (score <= 12) {
    statusColor = { r: 255, g: 165, b: 0 }; // Orange
  } else {
    statusColor = { r: 50, g: 205, b: 50 }; // Green
  }

  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  doc.roundedRect(margin, yPos - 5, 60, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(interpretation.status, margin + 2, yPos);

  // Connections (from GPT)
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Összefüggések Térképe", margin, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const connectionsText =
    generatedReport.chakra_connections[chakraName] || "N/A";
  const connectionLines = doc.splitTextToSize(
    connectionsText,
    pageWidth - 2 * margin
  );
  doc.text(connectionLines, margin, yPos);
  yPos += connectionLines.length * 5 + 5;

  // Manifestations (from interpretations.ts)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Megnyilvánulások", margin, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  interpretation.manifestations.forEach((manifestation) => {
    doc.text(`• ${manifestation}`, margin + 5, yPos);
    yPos += 5;
  });

  // First Aid Plan (from GPT)
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3 Lépéses Elsősegély Terv", margin, yPos);

  const firstAidPlan = generatedReport.first_aid_plans[chakraName];
  if (firstAidPlan) {
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("1. Azonnali gyakorlat", margin + 5, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const step1Lines = doc.splitTextToSize(
      firstAidPlan.step1,
      pageWidth - 2 * margin - 5
    );
    doc.text(step1Lines, margin + 5, yPos);
    yPos += step1Lines.length * 5 + 3;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("2. Napi rutin", margin + 5, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const step2Lines = doc.splitTextToSize(
      firstAidPlan.step2,
      pageWidth - 2 * margin - 5
    );
    doc.text(step2Lines, margin + 5, yPos);
    yPos += step2Lines.length * 5 + 3;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("3. Hosszú távú stratégia", margin + 5, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const step3Lines = doc.splitTextToSize(
      firstAidPlan.step3,
      pageWidth - 2 * margin - 5
    );
    doc.text(step3Lines, margin + 5, yPos);
  }

  // Footer
  addPageFooter(doc);
}

/**
 * Add weekly action plan page
 */
function addWeeklyActionPlanPage(
  doc: jsPDF,
  generatedReport: GeneratedReportData
): void {
  const { pageWidth, margin } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Heti Gyakorlati Cselekvési Terv", margin, 30);

  let yPos = 45;
  const days = [
    { key: "monday", label: "Hétfő" },
    { key: "tuesday", label: "Kedd" },
    { key: "wednesday", label: "Szerda" },
    { key: "thursday", label: "Csütörtök" },
    { key: "friday", label: "Péntek" },
    { key: "saturday", label: "Szombat" },
    { key: "sunday", label: "Vasárnap" },
  ];

  days.forEach((day) => {
    const text = generatedReport.weekly_plan[
      day.key as keyof typeof generatedReport.weekly_plan
    ] as string;

    // Day label
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 8, 2, 2, "F");

    doc.setTextColor(102, 126, 234);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(day.label, margin + 5, yPos);

    yPos += 10;

    // Day content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 10);
    doc.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 8;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
  });

  addPageFooter(doc);
}

/**
 * Add meditation recommendations page
 */
function addMeditationRecommendationsPage(
  doc: jsPDF,
  generatedReport: GeneratedReportData
): void {
  const { pageWidth, margin } = PDF_CONFIG;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Személyre Szabott Meditációs Ajánlások", margin, 30);

  let yPos = 45;

  // Morning meditations
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 140, 0); // Orange
  doc.text("Reggeli Meditációk", margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  generatedReport.meditation_recommendations.morning.forEach(
    (meditation) => {
      doc.text(`• ${meditation}`, margin + 5, yPos);
      yPos += 6;
    }
  );

  // Evening meditations
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 0, 130); // Indigo
  doc.text("Esti Meditációk", margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  generatedReport.meditation_recommendations.evening.forEach((meditation) => {
    doc.text(`• ${meditation}`, margin + 5, yPos);
    yPos += 6;
  });

  // Additional resources section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("További Erőforrások", margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "• Spotify: Keress rá 'csakra meditáció' kulcsszóra személyre szabott playlistekért",
    margin + 5,
    yPos
  );
  yPos += 6;
  doc.text(
    "• YouTube: Ingyenes geführt meditációk minden csakrára",
    margin + 5,
    yPos
  );
  yPos += 6;
  doc.text(
    "• Ajánlott időpontok: Reggel 5-10 perc, este 10-15 perc",
    margin + 5,
    yPos
  );

  addPageFooter(doc);
}

/**
 * Add page footer
 */
function addPageFooter(doc: jsPDF): void {
  const { pageWidth } = PDF_CONFIG;
  const pageNumber = doc.getCurrentPageInfo().pageNumber;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);

  const footer = `Eredeti Csakra - Személyre Szabott Elemzés | Oldal ${pageNumber}`;
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, 285);
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
