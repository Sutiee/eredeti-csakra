import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const id = params.id;

  return {
    title: 'Csakra Teszt Eredményed',
    description: 'Személyre szabott csakra elemzésed eredménye. Fedezd fel, melyik csakráid vannak egyensúlyban, és melyekre kell odafigyelned. Kapj gyakorlati tanácsokat csakráid harmonizálásához.',
    openGraph: {
      type: 'website',
      locale: 'hu_HU',
      url: `${siteUrl}/eredmeny/${id}`,
      siteName: 'Eredeti Csakra',
      title: 'Csakra Teszt Eredményed | Eredeti Csakra',
      description: 'Személyre szabott csakra elemzésed eredménye. Fedezd fel csakráid állapotát és kapj gyakorlati tanácsokat.',
    },
    twitter: {
      card: 'summary',
      title: 'Csakra Teszt Eredményed | Eredeti Csakra',
      description: 'Személyre szabott csakra elemzésed eredménye.',
    },
    robots: {
      index: false, // Private results should not be indexed
      follow: false,
      noarchive: true,
      nocache: true,
    },
  };
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
