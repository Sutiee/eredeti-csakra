/**
 * API Route: Generate Meditation Audio - TEMPORARILY DISABLED
 * POST /api/generate-meditation-audio
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'Meditation audio generation temporarily disabled',
        code: 'FEATURE_DISABLED',
      },
    },
    { status: 503 }
  );
}
