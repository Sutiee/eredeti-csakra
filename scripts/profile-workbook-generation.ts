/**
 * Workbook Generation Performance Profiler
 *
 * Purpose: Measure exact timings for each step of workbook generation
 *          to identify bottlenecks and optimization opportunities.
 *
 * Usage:
 *   npx tsx scripts/profile-workbook-generation.ts <result_id>
 *
 * Example:
 *   npx tsx scripts/profile-workbook-generation.ts 5411da8f-6f70-422d-a482-bf2494b000e6
 *
 * Output:
 *   - Detailed timing breakdown for each step
 *   - Identifies slowest operations
 *   - Suggests optimizations
 */

import { createClient } from '@supabase/supabase-js';
import { generateWorkbookContent } from '@/lib/openai/workbook-generator-gpt5';
import { generateWorkbookPDF } from '@/lib/pdf/workbook-template-gpt5';
import type { ChakraScores } from '@/types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TimingResult {
  step: string;
  duration: number; // milliseconds
  percentage: number;
}

/**
 * Measures execution time of an async function
 */
async function measureTime<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`⏱️  ${label}: ${(duration / 1000).toFixed(2)}s`);
  return { result, duration };
}

/**
 * Main profiling function
 */
async function profileWorkbookGeneration(resultId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     WORKBOOK GENERATION PERFORMANCE PROFILER              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const timings: TimingResult[] = [];
  const overallStart = performance.now();

  try {
    // Step 1: Fetch quiz result
    console.log('📊 Step 1: Fetching quiz result...');
    const { result: quizResult, duration: fetchDuration } = await measureTime(
      'Supabase fetch',
      async () => {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId)
          .single();

        if (error || !data) {
          throw new Error(`Quiz result not found: ${error?.message}`);
        }

        return data;
      }
    );

    timings.push({ step: '1. Supabase Fetch', duration: fetchDuration, percentage: 0 });

    const chakraScores = quizResult.chakra_scores as ChakraScores;
    const userName = quizResult.name?.split(' ')[0] || 'Kedves';

    console.log(`   User: ${userName}`);
    console.log(`   Chakra Scores:`, chakraScores);
    console.log('');

    // Step 2: Generate workbook content (2 GPT-5 calls)
    console.log('🤖 Step 2: Generating workbook content (2 GPT-5 API calls)...');
    const contentStart = performance.now();

    const { result: generationResult, duration: contentDuration } = await measureTime(
      'Total content generation',
      async () => {
        return await generateWorkbookContent(chakraScores, userName);
      }
    );

    if (!generationResult.success || !generationResult.days) {
      throw new Error(`Generation failed: ${generationResult.error}`);
    }

    timings.push({ step: '2. OpenAI Content Generation', duration: contentDuration, percentage: 0 });

    console.log(`   Days generated: ${generationResult.days.length}`);
    console.log(`   Token usage:`, generationResult.tokenUsage);
    console.log('');

    // Step 3: Generate PDF
    console.log('📄 Step 3: Generating PDF...');
    const { result: pdfBuffer, duration: pdfDuration } = await measureTime(
      'PDF rendering',
      async () => {
        return await generateWorkbookPDF({
          days: generationResult.days!,
          chakraScores,
          userName,
          introduction: generationResult.introduction || '',
        });
      }
    );

    timings.push({ step: '3. PDF Rendering', duration: pdfDuration, percentage: 0 });

    console.log(`   PDF size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    // Step 4: Upload to Supabase Storage
    console.log('☁️  Step 4: Uploading to Supabase Storage...');
    const { duration: uploadDuration } = await measureTime(
      'Supabase upload',
      async () => {
        const fileName = `workbook_profile_${resultId}_${Date.now()}.pdf`;
        const filePath = `workbooks/${fileName}`;

        const { error } = await supabase.storage
          .from('workbooks')
          .upload(filePath, pdfBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        return filePath;
      }
    );

    timings.push({ step: '4. Supabase Upload', duration: uploadDuration, percentage: 0 });
    console.log('');

    // Calculate total and percentages
    const overallDuration = performance.now() - overallStart;
    timings.forEach(timing => {
      timing.percentage = (timing.duration / overallDuration) * 100;
    });

    // Print summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TIMING BREAKDOWN                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    timings.forEach(timing => {
      const seconds = (timing.duration / 1000).toFixed(2);
      const percentage = timing.percentage.toFixed(1);
      const bar = '█'.repeat(Math.floor(timing.percentage / 2));

      console.log(`${timing.step}`);
      console.log(`  ⏱️  ${seconds}s (${percentage}%) ${bar}`);
      console.log('');
    });

    console.log('─────────────────────────────────────────────────────────────');
    console.log(`🏁 TOTAL TIME: ${(overallDuration / 1000).toFixed(2)}s`);
    console.log('─────────────────────────────────────────────────────────────\n');

    // Identify bottleneck
    const slowest = timings.reduce((prev, current) =>
      current.duration > prev.duration ? current : prev
    );

    console.log('🔍 BOTTLENECK ANALYSIS:\n');
    console.log(`   Slowest step: ${slowest.step}`);
    console.log(`   Time: ${(slowest.duration / 1000).toFixed(2)}s (${slowest.percentage.toFixed(1)}%)`);
    console.log('');

    // Provide optimization suggestions
    console.log('💡 OPTIMIZATION SUGGESTIONS:\n');

    if (slowest.step.includes('OpenAI')) {
      console.log('   1. ⚡ OpenAI API is the bottleneck (~60-120s)');
      console.log('      - Use GPT-4o-mini instead of GPT-5-mini (3x faster, similar quality)');
      console.log('      - Reduce max_output_tokens to 6000 (currently 8000)');
      console.log('      - Combine both calls into ONE with streaming (advanced)');
      console.log('');
    }

    if (slowest.step.includes('PDF')) {
      console.log('   2. 📄 PDF rendering is slow');
      console.log('      - Cache font files locally (avoid GitHub fetch)');
      console.log('      - Reduce meditation scripts (currently 7 × 2-3 pages each)');
      console.log('      - Simplify PDF styling (fewer gradients/colors)');
      console.log('');
    }

    if (slowest.step.includes('Upload')) {
      console.log('   3. ☁️  Supabase upload is slow');
      console.log('      - Check network latency to Supabase region');
      console.log('      - Consider compressing PDF before upload');
      console.log('');
    }

    console.log('✅ Profiling complete!\n');

  } catch (error) {
    console.error('\n❌ Profiling failed:', error);
    process.exit(1);
  }
}

// Main execution
const resultId = process.argv[2];

if (!resultId) {
  console.error('❌ Usage: npx tsx scripts/profile-workbook-generation.ts <result_id>');
  console.error('');
  console.error('Example:');
  console.error('  npx tsx scripts/profile-workbook-generation.ts 5411da8f-6f70-422d-a482-bf2494b000e6');
  process.exit(1);
}

profileWorkbookGeneration(resultId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
