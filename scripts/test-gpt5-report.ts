/**
 * Test GPT-5 Report Generation
 * Direct test of the generateGPT5Report function
 */

import { generateGPT5Report } from '../lib/openai/report-generator-gpt5';
import type { ChakraScores, QuizAnswers } from '../types';

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

async function testGPT5Report() {
  console.log('🧪 Testing GPT-5 Report Generation...\n');
  console.log('📊 Sample Data:');
  console.log('  User: Teszt Mária');
  console.log('  Chakra Scores:', sampleChakraScores);
  console.log('\n⏳ Calling generateGPT5Report...\n');

  try {
    const startTime = Date.now();

    const report = await generateGPT5Report(
      sampleChakraScores,
      sampleAnswers,
      'Teszt Mária'
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('✅ SUCCESS!\n');
    console.log(`⏱️  Duration: ${duration}s\n`);
    console.log('📄 Report Structure:');
    console.log('  - Master Analysis:', !!report.master);
    console.log('  - Chakras:', report.chakras.length);
    console.log('  - Forecasts:', !!report.forecasts);
    console.log('\n📝 Sample Content:');
    console.log('  Master Summary:', report.master.osszefoglalo.substring(0, 100) + '...');
    console.log('  First Chakra:', report.chakras[0].nev);
    console.log('  First Chakra Analysis:', report.chakras[0].reszletes_elemzes.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ ERROR:\n');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('\nStack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

testGPT5Report();
