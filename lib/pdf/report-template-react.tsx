/**
 * React-PDF Template for Chakra Analysis Reports
 * v2.3 - Beautiful, professional PDF generation with @react-pdf/renderer
 *
 * Features:
 * - CSS-like styling with automatic text wrapping
 * - Full Hungarian language support (UTF-8)
 * - Chakra-colored gradients and headers
 * - Google Fonts (Roboto) for better typography
 * - 18-20 pages of detailed analysis
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
import type { CompleteReport } from '@/lib/openai/schemas-gpt5';
import type { ChakraScores } from '@/types';
import { CHAKRAS } from '@/lib/quiz/chakras';
import { getExercisesForBlockedChakras } from '@/data/chakra-exercises';

// Register Google Fonts for Hungarian character support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff',
      fontWeight: 700,
    },
  ],
});

// Define comprehensive styles
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
  },

  // Cover Page Styles
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
    padding: 40,
  },
  coverTitle: {
    fontSize: 40,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 40,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  coverUserName: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
  },

  // Header Styles
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#667eea',
    marginBottom: 10,
    borderBottom: '2pt solid #667eea',
    paddingBottom: 5,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'justify',
  },

  // Chakra Page Styles
  chakraHeader: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  chakraTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
  },
  chakraSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },

  // List Styles
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  listBullet: {
    width: 15,
    fontSize: 11,
    color: '#667eea',
  },
  listText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },

  // Box Styles
  infoBox: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 15,
    borderLeft: '3pt solid #667eea',
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#667eea',
    marginBottom: 6,
  },
  infoBoxText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#555555',
  },

  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
  },
});

// Cover Page Component
const CoverPage: React.FC<{ userName: string }> = ({ userName }) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTitle}>Személyre Szabott</Text>
    <Text style={styles.coverSubtitle}>Csakra Elemzésed</Text>
    <View style={{ marginTop: 40 }}>
      <Text style={styles.coverUserName}>{userName}</Text>
    </View>
    <Text style={styles.coverFooter}>
      Eredeticsakra.hu • Részletes GPT-5 elemzés
    </Text>
  </Page>
);

// Master Summary Page Component
const MasterSummaryPage: React.FC<{ master: CompleteReport['master'] }> = ({ master }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Összegzés</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Energetikai Mintázatod</Text>
      <Text style={styles.sectionContent}>{master.osszefoglalo}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fő Prioritások</Text>
      {master.fo_prioritasok.map((prioritas, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listBullet}>{index + 1}.</Text>
          <Text style={styles.listText}>{prioritas}</Text>
        </View>
      ))}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kialakulás Okai</Text>
      <Text style={styles.sectionContent}>{master.kialakulasi_okok}</Text>
    </View>

    <Text style={styles.footer}>1</Text>
  </Page>
);

// Chakra Detail Page Component
const ChakraDetailPage: React.FC<{
  chakra: CompleteReport['chakras'][0];
  pageNumber: number;
}> = ({ chakra, pageNumber }) => {
  // Find chakra metadata for color
  const chakraMetadata = CHAKRAS.find(c => c.name === chakra.nev);
  const chakraColor = chakraMetadata?.color || '#667eea';

  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.chakraHeader, { backgroundColor: chakraColor }]}>
        <Text style={styles.chakraTitle}>{chakra.nev}</Text>
        {chakraMetadata && (
          <Text style={styles.chakraSubtitle}>{chakraMetadata.sanskritName}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Részletes Elemzés</Text>
        <Text style={styles.sectionContent}>{chakra.reszletes_elemzes}</Text>
      </View>

      {chakra.megnyilvánulasok && (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Fizikai Megnyilvánulások</Text>
            {chakra.megnyilvánulasok.fizikai.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Érzelmi Megnyilvánulások</Text>
            {chakra.megnyilvánulasok.erzelmi.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Mentális Megnyilvánulások</Text>
            {chakra.megnyilvánulasok.mentalis.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gyökerek</Text>
        <Text style={styles.sectionContent}>{chakra.gyokerok}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Megerősítő Mondatok</Text>
        {chakra.megerosito_mondatok.map((mondat, idx) => (
          <View key={idx} style={styles.listItem}>
            <Text style={styles.listBullet}>✨</Text>
            <Text style={styles.listText}>{mondat}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>{pageNumber}</Text>
    </Page>
  );
};

// Forecasts Page Component
const ForecastsPage: React.FC<{
  forecasts: CompleteReport['forecasts'];
  pageNumber: number;
}> = ({ forecasts, pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Jövőkép</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>6 Hónapon Belül</Text>
      <Text style={styles.sectionContent}>{forecasts.hat_honap}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1 Éven Belül</Text>
      <Text style={styles.sectionContent}>{forecasts.egy_ev}</Text>
    </View>

    <Text style={styles.footer}>{pageNumber}</Text>
  </Page>
);

// Long-term Forecasts Page Component
const LongTermForecastsPage: React.FC<{
  forecasts: CompleteReport['forecasts'];
  pageNumber: number;
}> = ({ forecasts, pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Hosszú Távú Jövőkép</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2 Éven Belül</Text>
      <Text style={styles.sectionContent}>{forecasts.ket_ev}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pozitív Forgatókönyv</Text>
      <Text style={styles.sectionContent}>{forecasts.pozitiv_forgatokonyvv}</Text>
    </View>

    <Text style={styles.footer}>{pageNumber}</Text>
  </Page>
);

// Exercises Page Component (for blocked chakras only)
const ExercisesPage: React.FC<{
  chakraScores: ChakraScores;
  pageNumber: number;
}> = ({ chakraScores, pageNumber }) => {
  const exercisesRecord = getExercisesForBlockedChakras(chakraScores);
  const exerciseEntries = Object.entries(exercisesRecord);

  if (exerciseEntries.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gyakorlatok</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionContent}>
          Az alábbi gyakorlatokat ajánljuk a blokkolt csakráid harmonizálására:
        </Text>
      </View>

      {exerciseEntries.map(([chakraName, exercises], idx) => {
        const chakraMetadata = CHAKRAS.find(c => c.name === chakraName);
        return (
          <View key={idx} style={styles.infoBox}>
            <Text style={[styles.infoBoxTitle, { color: chakraMetadata?.color || '#667eea' }]}>
              {chakraName}
            </Text>
            {exercises.map((exercise: string, exerciseIdx: number) => (
              <View key={exerciseIdx} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{exercise}</Text>
              </View>
            ))}
          </View>
        );
      })}

      <Text style={styles.footer}>{pageNumber}</Text>
    </Page>
  );
};

// Main Document Component
export const ChakraReportDocument: React.FC<{
  report: CompleteReport;
  chakraScores: ChakraScores;
  userName: string;
}> = ({ report, chakraScores, userName }) => {
  let pageNumber = 2; // Start from 2 (cover is unnumbered)

  return (
    <Document>
      <CoverPage userName={userName} />
      <MasterSummaryPage master={report.master} />

      {report.chakras.map((chakra, index) => {
        const page = <ChakraDetailPage key={index} chakra={chakra} pageNumber={pageNumber} />;
        pageNumber++;
        return page;
      })}

      <ForecastsPage forecasts={report.forecasts} pageNumber={pageNumber} />
      <LongTermForecastsPage forecasts={report.forecasts} pageNumber={pageNumber + 1} />
      <ExercisesPage chakraScores={chakraScores} pageNumber={pageNumber + 2} />
    </Document>
  );
};

/**
 * Generate PDF Buffer from React-PDF Document
 * @param report - Complete GPT-5 generated report
 * @param chakraScores - Chakra scores (4-16 range)
 * @param userName - User's name for personalization
 * @returns PDF as Buffer
 */
export async function generateReactPDF(
  report: CompleteReport,
  chakraScores: ChakraScores,
  userName: string
): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');

  const pdfBuffer = await renderToBuffer(
    <ChakraReportDocument report={report} chakraScores={chakraScores} userName={userName} />
  );

  return pdfBuffer;
}
