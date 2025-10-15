import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

export const metadata: Metadata = {
  title: 'Készülj fel a tesztre | Eredeti Csakra',
  description: 'Vegyél egy mély levegőt, és engedd ki lassan. A következő percek csak rólad szólnak. Légy őszinte magadhoz.',
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: `${siteUrl}/kviz/bevezeto`,
    siteName: 'Eredeti Csakra',
    title: 'Készülj fel a tesztre | Eredeti Csakra',
    description: 'Vegyél egy mély levegőt, és engedd ki lassan. A következő percek csak rólad szólnak.',
  },
  robots: {
    index: false, // Don't index pre-quiz page
    follow: true,
  },
};

export default function PreQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
