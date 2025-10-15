import type { Metadata } from 'next';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import TrustSection from '@/components/landing/TrustSection';
import CTASection from '@/components/landing/CTASection';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

export const metadata: Metadata = {
  title: 'Ingyenes Csakra Teszt | Fedezd fel energiáid állapotát',
  description: 'Fedezd fel csakráid valódi állapotát ingyenes, tudományosan megalapozott tesztünkkel. 28 kérdés, amely feltárja energiáid blokkjait és kiegyensúlyozatlanságait. Személyre szabott elemzés 3 perc alatt, azonnal.',
  keywords: [
    'csakra teszt',
    'ingyenes csakra teszt',
    'csakra elemzés',
    'csakra gyógyítás',
    'spirituális teszt',
    'energetikai elemzés',
    'önismeret teszt',
    '7 csakra teszt',
    'csakra harmonizálás',
    'belső egyensúly'
  ],
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: siteUrl,
    siteName: 'Eredeti Csakra',
    title: 'Ingyenes Csakra Teszt | Eredeti Csakra',
    description: 'Fedezd fel csakráid valódi állapotát ingyenes tesztünkkel. 28 kérdés, amely feltárja energiáid blokkjait. Személyre szabott elemzés 3 perc alatt.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Eredeti Csakra - Ingyenes Csakra Teszt',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ingyenes Csakra Teszt | Eredeti Csakra',
    description: 'Fedezd fel csakráid valódi állapotát ingyenes tesztünkkel. 28 kérdés, 3 perc alatt.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
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
