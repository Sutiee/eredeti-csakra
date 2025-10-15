/**
 * ElevenLabs API Client
 * Handles text-to-speech audio generation for meditation scripts
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

/**
 * Initialize ElevenLabs client with API key
 * Note: API key validation happens at runtime, not build time
 */
export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || 'placeholder_for_build'
});

/**
 * Generate audio from text using ElevenLabs TTS
 * @param text - The meditation script text to convert to audio
 * @param voiceId - The ElevenLabs voice ID (Hungarian female voice)
 * @returns Audio buffer (MP3 format)
 */
export async function generateMeditationAudio(
  text: string,
  voiceId: string
): Promise<Buffer> {
  // Runtime validation
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY environment variable is required");
  }

  try {
    // Generate audio stream using ElevenLabs TTS
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2", // Supports Hungarian language
      voiceSettings: {
        stability: 0.8, // Higher stability for meditation (calm voice)
        similarityBoost: 0.75, // Balance between clarity and naturalness
        style: 0.3, // Lower style for more neutral, calming tone
        useSpeakerBoost: true // Enhance voice quality
      }
    });

    // Convert ReadableStream to buffer
    const chunks: Uint8Array[] = [];

    // Get reader from the ReadableStream
    const reader = audioStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine all chunks into single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = Buffer.alloc(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return buffer;
  } catch (error) {
    console.error("ElevenLabs audio generation error:", error);
    throw new Error(
      `Failed to generate meditation audio: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get available voices from ElevenLabs
 * Useful for selecting the appropriate Hungarian voice
 */
export async function getAvailableVoices() {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices;
  } catch (error) {
    console.error("Failed to fetch ElevenLabs voices:", error);
    throw new Error("Could not retrieve available voices");
  }
}

/**
 * Estimate audio generation cost
 * ElevenLabs charges per character
 * @param characterCount - Number of characters in the meditation script
 * @returns Estimated cost information
 */
export function estimateAudioCost(characterCount: number): {
  characters: number;
  estimatedCredits: number;
  estimatedDurationMinutes: number;
} {
  // Average speaking rate: ~150 words per minute
  // Average word length: ~5 characters + 1 space = 6 characters
  // So: ~900 characters per minute
  const estimatedDurationMinutes = characterCount / 900;

  // ElevenLabs pricing: varies by plan, estimate ~25-30 characters = 1 credit
  const estimatedCredits = Math.ceil(characterCount / 25);

  return {
    characters: characterCount,
    estimatedCredits,
    estimatedDurationMinutes: Math.round(estimatedDurationMinutes * 10) / 10
  };
}
