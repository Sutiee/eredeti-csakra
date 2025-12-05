import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { encrypt, decrypt, isEncrypted } from '@/lib/bulk-sender/encryption';
import type { BulkSenderApiResponse, BulkSenderSettings } from '@/types';

/**
 * Verify authentication by checking the bulk_sender_auth cookie
 */
function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get('bulk_sender_auth')?.value;

  if (!token) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.authenticated && decoded.expires > Date.now();
  } catch {
    return false;
  }
}

/**
 * Mask API key for safe display (show first 7 and last 4 characters)
 */
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 15) {
    return '***';
  }
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}

// GET: Retrieve settings (with masked API key)
export async function GET(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<Partial<BulkSenderSettings>>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient();

    // Fetch settings from database
    const { data: settings, error } = await supabase
      .from('bulk_sender_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - not an error
      console.error('[BULK_SENDER_SETTINGS_GET] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // If no settings exist yet, return empty data
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          id: '',
          resend_api_key: null,
          from_email: null,
          from_name: null,
          created_at: '',
          updated_at: '',
        },
      });
    }

    // Decrypt and mask the API key for display
    let maskedApiKey = null;
    if (settings.resend_api_key) {
      try {
        const decryptedKey = decrypt(settings.resend_api_key);
        maskedApiKey = maskApiKey(decryptedKey);
      } catch (error) {
        console.error('[BULK_SENDER_SETTINGS_GET] Failed to decrypt API key:', error);
        maskedApiKey = '***';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        resend_api_key: maskedApiKey,
        from_email: settings.from_email,
        from_name: settings.from_name,
        created_at: settings.created_at,
        updated_at: settings.updated_at,
      },
    });
  } catch (error) {
    console.error('[BULK_SENDER_SETTINGS_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

// POST: Save/update settings (encrypt API key)
export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkSenderApiResponse<{ id: string }>>> {
  try {
    // Check authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resend_api_key, from_email, from_name } = body;

    // Validation
    if (!resend_api_key || !from_email || !from_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: resend_api_key, from_email, from_name' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate API key format (Resend keys start with "re_")
    if (!resend_api_key.startsWith('re_')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Resend API key format (must start with "re_")' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Check if we're updating an existing key (if it's already encrypted, don't re-encrypt)
    let encryptedApiKey: string;
    if (isEncrypted(resend_api_key)) {
      // Already encrypted (from a previous save), don't re-encrypt
      encryptedApiKey = resend_api_key;
    } else {
      // New API key, encrypt it
      try {
        encryptedApiKey = encrypt(resend_api_key);
      } catch (error) {
        console.error('[BULK_SENDER_SETTINGS_POST] Encryption error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to encrypt API key' },
          { status: 500 }
        );
      }
    }

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('bulk_sender_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let result;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('bulk_sender_settings')
        .update({
          resend_api_key: encryptedApiKey,
          from_email,
          from_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) {
        console.error('[BULK_SENDER_SETTINGS_POST] Update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update settings' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('bulk_sender_settings')
        .insert({
          resend_api_key: encryptedApiKey,
          from_email,
          from_name,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[BULK_SENDER_SETTINGS_POST] Insert error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to save settings' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      data: { id: result.id },
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('[BULK_SENDER_SETTINGS_POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
