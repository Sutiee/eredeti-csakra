/**
 * API Route: Generate Meditation Audio
 * POST /api/generate-meditation-audio
 *
 * Generates meditation audio using ElevenLabs TTS and uploads to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMeditationAudio } from '@/lib/elevenlabs/client';
import { supabase } from '@/lib/supabase/client';
import { MEDITATION_SCRIPTS, getMeditationByChakra } from '@/data/meditation-scripts';

/**
 * POST handler - Generate meditation audio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chakraKey } = body;

    // Validate input
    if (!chakraKey || typeof chakraKey !== 'string') {
      return NextResponse.json(
        { error: 'chakraKey is required and must be a string' },
        { status: 400 }
      );
    }

    // Find meditation script
    const meditation = getMeditationByChakra(chakraKey);
    if (!meditation) {
      return NextResponse.json(
        { error: `Meditation not found for chakra: ${chakraKey}` },
        { status: 404 }
      );
    }

    // Check if ELEVENLABS_VOICE_ID is configured
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!voiceId) {
      return NextResponse.json(
        {
          error: 'ELEVENLABS_VOICE_ID not configured',
          message: 'Please set ELEVENLABS_VOICE_ID in your environment variables'
        },
        { status: 500 }
      );
    }

    console.log(`Generating audio for ${meditation.chakra} (${meditation.duration} minutes)...`);
    console.log(`Script length: ${meditation.script.length} characters`);

    // Generate audio with ElevenLabs
    const audioBuffer = await generateMeditationAudio(meditation.script, voiceId);

    console.log(`Audio generated successfully. Size: ${audioBuffer.length} bytes`);

    // Upload to Supabase Storage
    const fileName = `${chakraKey}_meditation_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meditations')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload audio to storage: ${uploadError.message}`);
    }

    console.log(`Audio uploaded to Supabase: ${fileName}`);

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('meditations')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError);
      throw new Error('Failed to generate signed URL for audio file');
    }

    console.log(`Signed URL created successfully`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        chakra: meditation.chakra,
        chakraKey: meditation.chakraKey,
        title: meditation.title,
        duration: meditation.duration,
        audioUrl: signedUrlData.signedUrl,
        fileName: fileName,
        fileSize: audioBuffer.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Meditation audio generation error:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate meditation audio',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Get meditation info without generating audio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chakraKey = searchParams.get('chakraKey');

    if (!chakraKey) {
      return NextResponse.json(
        { error: 'chakraKey query parameter is required' },
        { status: 400 }
      );
    }

    const meditation = getMeditationByChakra(chakraKey);
    if (!meditation) {
      return NextResponse.json(
        { error: `Meditation not found for chakra: ${chakraKey}` },
        { status: 404 }
      );
    }

    // Return meditation info (without generating audio)
    return NextResponse.json({
      success: true,
      data: {
        id: meditation.id,
        chakra: meditation.chakra,
        chakraKey: meditation.chakraKey,
        title: meditation.title,
        duration: meditation.duration,
        color: meditation.color,
        scriptLength: meditation.script.length,
        voiceNotes: meditation.voiceNotes
      }
    });

  } catch (error) {
    console.error('Error fetching meditation info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meditation info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
