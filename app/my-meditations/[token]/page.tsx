/**
 * Meditation Access Page
 * Token-based meditation audio player
 * URL: /my-meditations/[token]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { MEDITATION_SCRIPTS } from '@/data/meditation-scripts';
import { MeditationAccess } from '@/types';
import MeditationPlayer from './MeditationPlayer';

interface PageProps {
  params: {
    token: string;
  };
}

/**
 * Generate page metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Csakra Meditációk | Eredeti Csakra',
    description: '7 irányított meditáció a csakráid harmonizálásához. Aktivizáld belső energiádat.',
    robots: 'noindex, nofollow', // Private content - don't index
  };
}

/**
 * Meditation Access Page
 */
export default async function MeditationAccessPage({ params }: PageProps) {
  const { token } = params;

  // Validate token format (must be valid UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    notFound();
  }

  // Check token validity in database
  const { data: accessData, error } = await supabase
    .from('meditation_access')
    .select('*')
    .eq('access_token', token)
    .eq('is_active', true)
    .single<MeditationAccess>();

  if (error || !accessData) {
    notFound();
  }

  // Check if access has expired
  if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="text-6xl mb-6">⏰</div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Hozzáférés lejárt
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              A meditációkhoz való hozzáférésed lejárt. Kérlek, vedd fel velünk a kapcsolatot további információkért.
            </p>
            <a
              href="mailto:info@eredeticsakra.hu"
              className="inline-block px-8 py-4 bg-gradient-spiritual text-white rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Kapcsolatfelvétel
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Track access (update last_accessed_at and increment counter)
  // Note: This updates meditation access tracking
  try {
    const updatePayload = {
      last_accessed_at: new Date().toISOString(),
      access_count: (accessData.access_count || 0) + 1,
    };
    await supabase.from('meditation_access').update(updatePayload).eq('access_token', token);
  } catch (trackError) {
    // Log but don't block meditation access
    console.error('Failed to track meditation access:', trackError);
  }

  // Render meditation player with client component
  return (
    <MeditationPlayer
      email={accessData.email}
      productType={accessData.product_type}
      accessGrantedAt={accessData.access_granted_at}
    />
  );
}
