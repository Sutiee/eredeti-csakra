import { NextRequest, NextResponse } from 'next/server';
import type { BulkSenderApiResponse } from '@/types';

// POST: Verify password
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ authenticated: boolean }>>> {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    const { password } = body;

    const correctPassword = process.env.BULK_SENDER_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { success: false, error: 'BULK_SENDER_PASSWORD not configured' },
        { status: 500 }
      );
    }

    const authenticated = password === correctPassword;

    if (authenticated) {
      // Create a simple session token (valid for 24 hours)
      const token = Buffer.from(
        JSON.stringify({
          authenticated: true,
          expires: Date.now() + 24 * 60 * 60 * 1000,
        })
      ).toString('base64');

      const response = NextResponse.json({
        success: true,
        data: { authenticated: true },
      });

      // Set HTTP-only cookie
      response.cookies.set('bulk_sender_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in auth:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET: Check if authenticated
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ authenticated: boolean }>>> {
  try {
    const token = request.cookies.get('bulk_sender_auth')?.value;

    if (!token) {
      return NextResponse.json({
        success: true,
        data: { authenticated: false },
      });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

      if (decoded.authenticated && decoded.expires > Date.now()) {
        return NextResponse.json({
          success: true,
          data: { authenticated: true },
        });
      }
    } catch {
      // Invalid token
    }

    return NextResponse.json({
      success: true,
      data: { authenticated: false },
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json(
      { success: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}

// DELETE: Logout
export async function DELETE(): Promise<NextResponse<BulkSenderApiResponse>> {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out',
  });

  response.cookies.delete('bulk_sender_auth');

  return response;
}
