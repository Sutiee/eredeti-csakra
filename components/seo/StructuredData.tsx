/**
 * Structured Data Component
 * Provides JSON-LD structured data for improved SEO
 */

type OrganizationSchema = {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description: string;
  contactPoint?: {
    '@type': string;
    contactType: string;
    availableLanguage: string;
  };
};

type WebApplicationSchema = {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  description: string;
  inLanguage: string;
};

type FAQSchema = {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

/**
 * Organization Schema
 */
export function OrganizationStructuredData() {
  const organizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eredeti Csakra',
    url: siteUrl,
    description: 'Csakra elemzés és harmonizálás szakértői. Segítünk megtalálni az egyensúlyt energetikai rendszeredben.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}

/**
 * WebApplication Schema
 */
export function WebApplicationStructuredData() {
  const webAppSchema: WebApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Eredeti Csakra - Csakra Teszt',
    url: siteUrl,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Bármilyen (Web-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'HUF',
    },
    description: 'Ingyenes online csakra teszt, amely személyre szabott elemzést nyújt energetikai rendszered állapotáról.',
    inLanguage: 'hu-HU',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
    />
  );
}

/**
 * FAQ Schema for Landing Page
 */
export function FAQStructuredData() {
  const faqSchema: FAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Mi az a csakra?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A csakrák energetikai központok a testünkben, amelyek különböző fizikai, érzelmi és spirituális funkciókat szabályoznak. 7 fő csakra van, amelyek a gerincoszlop mentén helyezkednek el.',
        },
      },
      {
        '@type': 'Question',
        name: 'Mennyi időbe telik a teszt kitöltése?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A csakra teszt kitöltése körülbelül 3-5 percet vesz igénybe. 28 kérdésre kell válaszolnod őszintén, hogy pontos eredményt kapj.',
        },
      },
      {
        '@type': 'Question',
        name: 'Valóban ingyenes a teszt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Igen, a csakra teszt és az alapvető elemzés teljesen ingyenes. Azonnal megkapod a részletes eredményt a kitöltés után.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hogyan működik a teszt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A teszt 28 kérdést tartalmaz, amelyek a 7 fő csakrádhoz kapcsolódnak. Válaszaid alapján kiszámítjuk az egyes csakrák egyensúlyi állapotát és személyre szabott tanácsokat adunk.',
        },
      },
      {
        '@type': 'Question',
        name: 'Mit jelent, ha egy csakra blokkolt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Blokkolt csakra esetén az adott energiaközpont nem működik optimálisan, ami fizikai, érzelmi vagy mentális tünetekben nyilvánulhat meg. A teszt eredménye konkrét gyakorlatokat javasol a harmonizáláshoz.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

/**
 * Combined Structured Data Component
 * Use this on the landing page for complete SEO coverage
 */
export default function StructuredData() {
  return (
    <>
      <OrganizationStructuredData />
      <WebApplicationStructuredData />
      <FAQStructuredData />
    </>
  );
}
