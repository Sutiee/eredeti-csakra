/**
 * Test Full PDF Generation
 * Generates a complete PDF report with GPT-5 content
 */

import { generateGPT5Report } from '../lib/openai/report-generator-gpt5';
import { generateReportPDF } from '../lib/pdf/report-template-gpt5';
import type { ChakraScores, QuizAnswers } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Sample quiz data
const sampleChakraScores: ChakraScores = {
  'Gyökércsakra': 8,
  'Szakrális csakra': 10,
  'Napfonat csakra': 7,
  'Szív csakra': 12,
  'Torok csakra': 9,
  'Harmadik szem': 11,
  'Korona csakra': 14,
};

const sampleAnswers: QuizAnswers = [
  // Gyökércsakra (4 questions)
  2, 2, 2, 2,
  // Szakrális csakra
  3, 2, 3, 2,
  // Napfonat csakra
  2, 2, 2, 1,
  // Szív csakra
  3, 3, 3, 3,
  // Torok csakra
  2, 3, 2, 2,
  // Harmadik szem
  3, 2, 3, 3,
  // Korona csakra
  4, 3, 4, 3,
];

async function testFullPDF() {
  console.log('🧪 Testing Full PDF Generation with GPT-5...\n');
  console.log('📊 Sample Data:');
  console.log('  User: Teszt Mária');
  console.log('  Email: maria@teszt.hu');
  console.log('  Chakra Scores:', sampleChakraScores);

  try {
    // Step 1: Generate GPT-5 Report
    console.log('\n⏳ Step 1/2: Generating GPT-5 report content...');
    const startTime1 = Date.now();

    const report = await generateGPT5Report(
      sampleChakraScores,
      sampleAnswers,
      'Teszt Mária'
    );

    const duration1 = ((Date.now() - startTime1) / 1000).toFixed(2);
    console.log(`✅ GPT-5 report generated in ${duration1}s`);

    // Step 2: Generate PDF
    console.log('\n⏳ Step 2/2: Generating PDF document...');
    const startTime2 = Date.now();

    const pdfBuffer = await generateReportPDF(
      report,
      sampleChakraScores,
      'Teszt Mária',
      'maria@teszt.hu'
    );

    const duration2 = ((Date.now() - startTime2) / 1000).toFixed(2);
    console.log(`✅ PDF generated in ${duration2}s`);

    // Step 3: Save PDF
    const outputPath = path.join(process.cwd(), 'test-report.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    const totalDuration = ((Date.now() - startTime1) / 1000).toFixed(2);

    console.log('\n✅ COMPLETE SUCCESS!\n');
    console.log(`📊 Statistics:`);
    console.log(`  Total Duration: ${totalDuration}s`);
    console.log(`  PDF Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`  Output File: ${outputPath}`);
    console.log(`\n📄 Report Content:`);
    console.log(`  - Chakras Analyzed: ${report.chakras.length}`);
    console.log(`  - Total Characters: ~${
      report.master.osszefoglalo.length +
      report.chakras.reduce((sum, c) => sum + c.reszletes_elemzes.length, 0) +
      report.forecasts.hat_honap.length
    }`);

    console.log(`\n🎉 Test PDF saved successfully!`);
    console.log(`Open it with: open ${outputPath}`);

  } catch (error) {
    console.error('\n❌ ERROR:\n');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('\nStack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

testFullPDF();
