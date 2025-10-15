/**
 * Generate Meditation Audio Files
 *
 * Converts meditation scripts to audio files using ElevenLabs TTS.
 * Uploads generated audio files to Supabase Storage.
 *
 * Usage:
 *   npm run generate-meditation-audio [chakra-key]
 *
 *   Examples:
 *     npm run generate-meditation-audio          # Generate all 7
 *     npm run generate-meditation-audio root     # Generate only root chakra
 *
 * Requirements:
 *   - Meditation scripts must exist in public/meditations/scripts/
 *   - ELEVENLABS_API_KEY in .env.local
 *   - ELEVENLABS_VOICE_ID in .env.local
 *   - Supabase credentials in .env.local
 */

import { ElevenLabsClient } from 'elevenlabs';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
import { Readable } from 'stream';

// Load environment variables
dotenv.config({ path: '.env.local' });

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHAKRAS = [
  { key: 'root', name: 'Gyökércsakra' },
  { key: 'sacral', name: 'Szakrális csakra' },
  { key: 'solar', name: 'Napfonat csakra' },
  { key: 'heart', name: 'Szív csakra' },
  { key: 'throat', name: 'Torok csakra' },
  { key: 'third_eye', name: 'Harmadik szem' },
  { key: 'crown', name: 'Korona csakra' },
];

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * Generate audio for a single chakra meditation
 */
async function generateChakraAudio(chakraKey: string, chakraName: string): Promise<void> {
  console.log(`\n🎙️  Generating audio for ${chakraName} (${chakraKey})...`);

  // Read script
  const scriptPath = join(process.cwd(), 'public', 'meditations', 'scripts', `${chakraKey}.txt`);
  let scriptText: string;

  try {
    scriptText = await readFile(scriptPath, 'utf-8');
    console.log(`   ✓ Script loaded (${scriptText.length} characters)`);
  } catch (error) {
    console.error(`   ❌ Error reading script: ${scriptPath}`);
    throw error;
  }

  // Validate voice ID
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    throw new Error('ELEVENLABS_VOICE_ID not set in .env.local');
  }

  // Generate audio with ElevenLabs
  console.log('   🔊 Generating audio with ElevenLabs...');

  try {
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: scriptText,
      model_id: 'eleven_multilingual_v2', // Best for Hungarian
      voice_settings: {
        stability: 0.6,        // Slightly varied for natural speech
        similarity_boost: 0.8, // High similarity to selected voice
        style: 0.4,            // Moderate style (calm, meditative)
        use_speaker_boost: true,
      },
    });

    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(audioStream as ReadableStream<Uint8Array>);
    console.log(`   ✓ Audio generated (${(audioBuffer.length / 1024).toFixed(2)} KB)`);

    // Upload to Supabase Storage
    console.log('   ☁️  Uploading to Supabase Storage...');
    const filename = `${chakraKey}_meditation.mp3`;
    const { data, error } = await supabase.storage
      .from('meditations')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`   ❌ Upload error:`, error);
      throw error;
    }

    console.log(`   ✅ Uploaded: ${filename}`);

    // Get public URL (for verification)
    const { data: urlData } = supabase.storage
      .from('meditations')
      .getPublicUrl(filename);

    console.log(`   🔗 URL: ${urlData.publicUrl}`);

  } catch (error: any) {
    if (error?.statusCode === 401) {
      console.error('   ❌ ElevenLabs authentication failed. Check ELEVENLABS_API_KEY.');
    } else if (error?.statusCode === 429) {
      console.error('   ❌ ElevenLabs quota exceeded. Wait or upgrade your plan.');
    } else {
      console.error('   ❌ Error:', error.message || error);
    }
    throw error;
  }
}

async function main() {
  console.log('🎵 Meditation Audio Generator');
  console.log('==============================\n');

  // Validate environment variables
  const requiredEnvVars = [
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_VOICE_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nAdd these to your .env.local file.');
    process.exit(1);
  }

  // Check if specific chakra was requested
  const requestedChakra = process.argv[2];
  let chakrasToGenerate = CHAKRAS;

  if (requestedChakra) {
    const chakra = CHAKRAS.find(c => c.key === requestedChakra);
    if (!chakra) {
      console.error(`❌ Unknown chakra key: ${requestedChakra}`);
      console.error('\nAvailable chakra keys:');
      CHAKRAS.forEach(c => console.error(`   - ${c.key} (${c.name})`));
      process.exit(1);
    }
    chakrasToGenerate = [chakra];
    console.log(`🎯 Generating audio for: ${chakra.name}\n`);
  } else {
    console.log('🎯 Generating audio for all 7 chakras\n');
  }

  // Generate audio files
  let successCount = 0;
  let errorCount = 0;

  for (const chakra of chakrasToGenerate) {
    try {
      await generateChakraAudio(chakra.key, chakra.name);
      successCount++;

      // Rate limiting (ElevenLabs API throttling)
      if (chakrasToGenerate.length > 1) {
        console.log('   ⏳ Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      errorCount++;
      console.error(`\n❌ Failed to generate ${chakra.name}\n`);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════');
  console.log(`✨ Generation complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);
  console.log('═══════════════════════════════\n');

  if (successCount > 0) {
    console.log('📋 Next steps:');
    console.log('1. Test audio files in Supabase Storage → meditations bucket');
    console.log('2. Verify quality and adjust voice settings if needed');
    console.log('3. Deploy to production');
  }

  if (errorCount > 0) {
    console.log('\n⚠️  Some generations failed. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
