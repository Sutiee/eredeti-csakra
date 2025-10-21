/**
 * Create sample quiz result for testing GPT-5 PDF generation
 * Run with: npx tsx scripts/create-sample-quiz-result.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createSampleQuizResult() {
  const sampleResult = {
    id: '00000000-0000-0000-0000-000000000001', // Test UUID
    name: 'Teszt Kata',
    email: 'teszt@eredeticsakra.hu',
    age: 42,
    answers: [3, 2, 4, 3, 2, 3, 4, 2, 3, 2, 4, 3, 1, 2, 3, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3],
    chakra_scores: {
      'Gyökércsakra': 12,
      'Szakrális csakra': 10,
      'Napfonat csakra': 8,    // Blocked
      'Szív csakra': 14,
      'Torok csakra': 11,
      'Harmadik szem': 13,
      'Korona csakra': 11,
    },
  };

  console.log('Creating sample quiz result...');
  console.log('ID:', sampleResult.id);
  console.log('Name:', sampleResult.name);
  console.log('Email:', sampleResult.email);
  console.log('Chakra Scores:', sampleResult.chakra_scores);

  const { data, error } = await supabase
    .from('quiz_results')
    .upsert(sampleResult, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating sample quiz result:', error);
    process.exit(1);
  }

  console.log('✅ Sample quiz result created successfully!');
  console.log('');
  console.log('Test URLs:');
  console.log(`  Result page: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/eredmeny/${sampleResult.id}`);
  console.log('');
  console.log('Test PDF generation:');
  console.log(`  curl -X POST http://localhost:3000/api/generate-detailed-report-gpt5 \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"result_id": "${sampleResult.id}"}'`);
  console.log('');
  console.log('Chakra Analysis:');
  console.log('  - 1 blocked chakra (Napfonat: 8 points)');
  console.log('  - 5 imbalanced chakras');
  console.log('  - 1 balanced chakra (Szív: 14 points)');
}

createSampleQuizResult();
