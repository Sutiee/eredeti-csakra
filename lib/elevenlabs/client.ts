/**
 * ElevenLabs Client - TEMPORARILY DISABLED
 * TODO: Re-enable when needed for meditation audio generation
 */

export async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  throw new Error('ElevenLabs disabled temporarily');
}

export async function getVoices(): Promise<any[]> {
  return [];
}
