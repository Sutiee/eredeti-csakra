import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

export const metadata: Metadata = {
  title: 'Csakra Teszt Kitöltése',
  description: '28 kérdéses csakra teszt, amely feltárja energiáid állapotát. Töltsd ki őszintén a kérdéseket és kapj személyre szabott elemzést csakráid egyensúlyáról és harmonizálásuk módjáról.',
  keywords: [
    'csakra kvíz',
    'csakra kérdőív',
    'spirituális teszt',
    'energetikai felmérés',
    'csakra értékelés'
  ],
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: `${siteUrl}/kviz`,
    siteName: 'Eredeti Csakra',
    title: 'Csakra Teszt Kitöltése | Eredeti Csakra',
    description: '28 kérdéses csakra teszt, amely feltárja energiáid állapotát. Töltsd ki őszintén és kapj személyre szabott elemzést.',
  },
  twitter: {
    card: 'summary',
    title: 'Csakra Teszt Kitöltése | Eredeti Csakra',
    description: '28 kérdéses csakra teszt, amely feltárja energiáid állapotát.',
  },
  alternates: {
    canonical: `${siteUrl}/kviz`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
