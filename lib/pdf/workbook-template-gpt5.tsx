/**
 * 30-Day Workbook PDF Template (GPT-5-generated content)
 *
 * Generates complete workbook PDF using @react-pdf/renderer.
 * Structure: Cover → Introduction → 30 Day Pages → 7 Meditation Scripts → Closing
 *
 * Phase: v2.5 - 30 Napos Csakra Munkafüzet
 *
 * @module lib/pdf/workbook-template-gpt5
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { ChakraScores } from '@/types';
import type { WorkbookDay } from '@/lib/openai/workbook-schemas-gpt5';
import { MEDITATION_SCRIPTS } from '@/data/meditation-scripts';

// ============================================================================
// FONT REGISTRATION (Hungarian character support)
// ============================================================================

// Use Roboto font (TTF format) from GitHub - same as personalized report
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

// ============================================================================
// CHAKRA COLOR MAPPING
// ============================================================================

const CHAKRA_COLORS: Record<string, string> = {
  'Gyökércsakra': '#DC143C',
  'Szakrális csakra': '#FF8C00',
  'Napfonat csakra': '#FFD700',
  'Szív csakra': '#32CD32',
  'Torok csakra': '#4169E1',
  'Harmadik szem': '#9370DB',
  'Korona csakra': '#9400D3',
};

// ============================================================================
// PDF STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Page layout
  page: {
    fontFamily: 'Roboto',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },

  // Cover page
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#6A1B9A',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    fontWeight: 400,
    color: '#6A1B9A',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverUserName: {
    fontSize: 24,
    fontWeight: 600,
    color: '#4A148C',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 14,
    fontWeight: 400,
    color: '#7B1FA2',
    textAlign: 'center',
  },

  // Introduction page
  introContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#6A1B9A',
    marginBottom: 20,
  },
  introText: {
    fontSize: 12,
    lineHeight: 1.8,
    color: '#333333',
    marginBottom: 12,
  },

  // Day page
  dayPageHeader: {
    marginBottom: 20,
  },
  chakraColorStrip: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: '#333333',
    marginBottom: 4,
  },
  chakraName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#666666',
  },

  // Day content sections
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6A1B9A',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
  },

  // Journaling questions
  journalingList: {
    marginTop: 6,
  },
  journalingItem: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
    marginBottom: 4,
    paddingLeft: 10,
  },

  // Checkboxes
  checkboxContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  checkboxItem: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 6,
  },

  // Meditation script page
  meditationTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#6A1B9A',
    marginBottom: 16,
  },
  meditationScriptText: {
    fontSize: 10,
    lineHeight: 1.8,
    color: '#333333',
  },

  // Closing page
  closingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closingTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#6A1B9A',
    marginBottom: 20,
    textAlign: 'center',
  },
  closingText: {
    fontSize: 12,
    lineHeight: 1.8,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
});

// ============================================================================
// HELPER: TEXT WRAPPING (Hungarian character safety)
// ============================================================================

function safeTextWrap(text: string, maxLength: number = 2000): string {
  if (!text) return '';

  // Preserve newlines and Hungarian characters
  const cleaned = text
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.substring(0, maxLength);
}

// ============================================================================
// PDF COMPONENTS
// ============================================================================

interface WorkbookPDFProps {
  days: WorkbookDay[];
  chakraScores: ChakraScores;
  userName: string;
  introduction: string;
}

/**
 * Cover Page
 */
const CoverPage: React.FC<{ userName: string }> = ({ userName }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.coverContainer}>
      <Text style={styles.coverTitle}>
        30 Napos Csakra Munkafüzet
      </Text>
      <Text style={styles.coverSubtitle}>
        Személyre Szabott Útmutató a Csakráid Harmonizálásához
      </Text>
      <Text style={styles.coverUserName}>
        {userName} számára
      </Text>
      <Text style={styles.coverDate}>
        Létrehozva: {new Date().toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
    </View>
  </Page>
);

/**
 * Introduction Page
 */
const IntroductionPage: React.FC<{ introduction: string }> = ({ introduction }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.introContainer}>
      <Text style={styles.introTitle}>
        Bevezető
      </Text>
      {introduction.split('\n\n').map((paragraph, index) => (
        <Text key={index} style={styles.introText}>
          {safeTextWrap(paragraph, 1000)}
        </Text>
      ))}
    </View>
  </Page>
);

/**
 * Single Day Page
 */
const DayPage: React.FC<{ day: WorkbookDay }> = ({ day }) => {
  const chakraColor = CHAKRA_COLORS[day.csakra] || '#6A1B9A';

  return (
    <Page size="A4" style={styles.page}>
      {/* Header with chakra color strip */}
      <View style={styles.dayPageHeader}>
        <View style={[styles.chakraColorStrip, { backgroundColor: chakraColor }]} />
        <Text style={styles.dayNumber}>
          {day.day_number}. NAP
        </Text>
        <Text style={styles.chakraName}>
          {day.csakra.toUpperCase()}
        </Text>
      </View>

      {/* Napi Szándék */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🎯 Napi Szándék:</Text>
        <Text style={styles.sectionText}>
          {safeTextWrap(day.napi_szandek, 200)}
        </Text>
      </View>

      {/* Miért Fontos? */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>💡 Miért fontos?</Text>
        <Text style={styles.sectionText}>
          {safeTextWrap(day.elmelet, 500)}
        </Text>
      </View>

      {/* Mai Gyakorlat */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>✨ Mai Gyakorlat:</Text>
        <Text style={styles.sectionText}>
          {safeTextWrap(day.gyakorlat_leiras, 1000)}
        </Text>
      </View>

      {/* Journaling Kérdések */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📝 Journaling Kérdések:</Text>
        <View style={styles.journalingList}>
          {day.journaling_kerdesek.map((question, index) => (
            <Text key={index} style={styles.journalingItem}>
              • {safeTextWrap(question, 300)}
            </Text>
          ))}
        </View>
      </View>

      {/* Napi Affirmáció */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>💬 Napi Affirmáció:</Text>
        <Text style={styles.sectionText}>
          {safeTextWrap(day.affirmacio, 200)}
        </Text>
      </View>

      {/* Checkboxes */}
      <View style={styles.checkboxContainer}>
        <Text style={styles.checkboxItem}>☐ Reggeli gyakorlat elvégezve</Text>
        <Text style={styles.checkboxItem}>☐ Journaling befejezve</Text>
        <Text style={styles.checkboxItem}>☐ Affirmáció 3× elmondva</Text>
      </View>

      {/* Motiváció */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionText, { fontWeight: 600, color: chakraColor }]}>
          🌟 {safeTextWrap(day.motivacio, 250)}
        </Text>
      </View>
    </Page>
  );
};

/**
 * Meditation Script Page
 */
const MeditationPage: React.FC<{ chakra: string }> = ({ chakra }) => {
  const meditation = MEDITATION_SCRIPTS.find((m) => m.chakra === chakra);

  if (!meditation) return null;

  // Clean up meditation script (remove pause markers for PDF)
  const cleanScript = meditation.script
    .replace(/\(pause \d+s\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.meditationTitle}>
        {meditation.chakra} - Meditációs Script
      </Text>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        {meditation.title} ({meditation.duration} perc)
      </Text>
      <Text style={styles.meditationScriptText}>
        {safeTextWrap(cleanScript, 10000)}
      </Text>
    </Page>
  );
};

/**
 * Closing Page
 */
const ClosingPage: React.FC = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.closingContainer}>
      <Text style={styles.closingTitle}>
        Gratulálunk! 🎉
      </Text>
      <Text style={styles.closingText}>
        Ezzel a 30 napos munkafüzettel egy csodálatos utazást kezdtél el a csakráid
        harmonizálása felé.
      </Text>
      <Text style={styles.closingText}>
        Emlékezz: a csakra munka nem egyszer végezhető el. Ez egy folyamatos gyakorlás,
        amit újra és újra elvégezhetsz.
      </Text>
      <Text style={styles.closingText}>
        Ha végigcsináltad mind a 30 napot, büszke lehetsz magadra! De ha néhány nap
        kimaradt, ne bántsd magad – folytasd ott, ahol abbahagytad.
      </Text>
      <Text style={[styles.closingText, { fontWeight: 700, color: '#6A1B9A', marginTop: 20 }]}>
        Következő lépések:
      </Text>
      <Text style={styles.closingText}>
        • Ismételd meg ezt a 30 napos programot 3 hónap múlva
      </Text>
      <Text style={styles.closingText}>
        • Folytasd a napi meditációkat
      </Text>
      <Text style={styles.closingText}>
        • Figyelj a tested jelzéseire
      </Text>
      <Text style={[styles.closingText, { marginTop: 30, fontWeight: 600 }]}>
        Sok szeretettel,
      </Text>
      <Text style={styles.closingText}>
        Az Eredeti Csakra Csapata
      </Text>
    </View>
  </Page>
);

/**
 * Complete Workbook PDF Document
 */
const WorkbookPDFDocument: React.FC<WorkbookPDFProps> = ({
  days,
  chakraScores,
  userName,
  introduction,
}) => (
  <Document>
    {/* Cover Page */}
    <CoverPage userName={userName} />

    {/* Introduction Page */}
    <IntroductionPage introduction={introduction} />

    {/* 30 Day Pages */}
    {days.map((day) => (
      <DayPage key={day.day_number} day={day} />
    ))}

    {/* 7 Meditation Script Pages */}
    <MeditationPage chakra="Gyökércsakra" />
    <MeditationPage chakra="Szakrális csakra" />
    <MeditationPage chakra="Napfonat csakra" />
    <MeditationPage chakra="Szív csakra" />
    <MeditationPage chakra="Torok csakra" />
    <MeditationPage chakra="Harmadik szem" />
    <MeditationPage chakra="Korona csakra" />

    {/* Closing Page */}
    <ClosingPage />
  </Document>
);

// ============================================================================
// MAIN PDF GENERATION FUNCTION
// ============================================================================

/**
 * Generates 30-day workbook PDF buffer
 *
 * @param props - Workbook data (days, scores, user info, introduction)
 * @returns PDF buffer
 */
export async function generateWorkbookPDF(
  props: WorkbookPDFProps
): Promise<Buffer> {
  console.log('[WorkbookPDF] Starting PDF generation...');
  console.log('[WorkbookPDF] Days count:', props.days.length);

  const { renderToBuffer } = await import('@react-pdf/renderer');

  const pdfBuffer = await renderToBuffer(
    <WorkbookPDFDocument {...props} />
  );

  console.log('[WorkbookPDF] PDF generated, size:', pdfBuffer.length, 'bytes');

  return pdfBuffer;
}
