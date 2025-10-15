'use client';

import { useEffect } from 'react';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import TrustSection from '@/components/landing/TrustSection';
import CTASection from '@/components/landing/CTASection';
import { useAnalytics } from '@/lib/admin/tracking/client';

export default function Home() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('page_view', { page_path: '/', page_name: 'landing' });
  }, [trackEvent]);

  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <TrustSection />
      <CTASection />
    </main>
  );
}
