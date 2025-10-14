# SEO Code Reference - Quick Copy-Paste Guide

## Complete Code for All SEO Files

### 1. Root Layout - Enhanced Metadata
**File**: `app/layout.tsx`

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter, playfairDisplay } from "./fonts";
import StructuredData from "@/components/seo/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9333ea' },
    { media: '(prefers-color-scheme: dark)', color: '#7e22ce' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eredeti Csakra | Ingyenes Csakra Teszt és Elemzés",
    template: "%s | Eredeti Csakra"
  },
  description: "Fedezd fel csakráid valódi állapotát ingyenes, tudományosan megalapozott tesztünkkel. 28 kérdés, amely feltárja energiáid blokkjait és kiegyensúlyozatlanságait. Személyre szabott elemzés 3 perc alatt.",
  keywords: [
    "csakra teszt",
    "csakra elemzés",
    "ingyenes csakra teszt",
    "csakra gyógyítás",
    "energetika",
    "spirituális fejlődés",
    "önismeret",
    "belső egyensúly",
    "csakra harmonizálás",
    "7 csakra"
  ],
  authors: [{ name: "Eredeti Csakra" }],
  creator: "Eredeti Csakra",
  publisher: "Eredeti Csakra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: siteUrl,
    siteName: "Eredeti Csakra",
    title: "Eredeti Csakra | Ingyenes Csakra Teszt",
    description: "Fedezd fel csakráid valódi állapotát ingyenes tesztünkkel. 28 kérdés, amely feltárja energiáid blokkjait.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Eredeti Csakra - Fedezd fel csakráid állapotát",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eredeti Csakra | Ingyenes Csakra Teszt",
    description: "Fedezd fel csakráid valódi állapotát ingyenes tesztünkkel. 28 kérdés, amely feltárja energiáid blokkjait.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

### 2. Landing Page Metadata
**File**: `app/page.tsx` (add at top)

```typescript
import type { Metadata } from 'next';

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
```

---

### 3. Quiz Page Metadata
**File**: `app/kviz/layout.tsx` (new file)

```typescript
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
```

---

### 4. Result Page Metadata
**File**: `app/eredmeny/[id]/layout.tsx` (new file)

```typescript
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
      index: false,
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
```

---

### 5. Structured Data Component
**File**: `components/seo/StructuredData.tsx` (new file)

See the complete file in the repository - it's 4.5KB and includes:
- Organization Schema
- WebApplication Schema
- FAQ Schema with 5 questions

Key import in layout:
```typescript
import StructuredData from "@/components/seo/StructuredData";

// In JSX:
<head>
  <StructuredData />
</head>
```

---

### 6. Robots.txt
**File**: `public/robots.txt` (new file)

```txt
# Eredeti Csakra - Robots.txt
# https://eredeticsakra.hu

User-agent: *
Allow: /
Disallow: /api/
Disallow: /eredmeny/

# Sitemap location
Sitemap: https://eredeticsakra.hu/sitemap.xml

# Crawl-delay (optional, prevents aggressive crawling)
Crawl-delay: 1
```

---

### 7. Sitemap Configuration
**File**: `next-sitemap.config.js` (new file, root level)

```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://eredeticsakra.hu',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/eredmeny/'],
      },
    ],
    additionalSitemaps: [],
  },
  exclude: [
    '/api/*',
    '/eredmeny/*',
  ],
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/kviz') {
      priority = 0.9;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    result.push(
      await config.transform(config, '/'),
      await config.transform(config, '/kviz')
    );
    return result;
  },
};
```

---

### 8. Package.json Update
**File**: `package.json`

Add to scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postbuild": "next-sitemap",  // ← ADD THIS
    "start": "next start",
    "lint": "next lint"
  }
}
```

Install package:
```bash
npm install next-sitemap --save-dev
```

---

### 9. Environment Variables
**File**: `.env.local` (add this line)

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_SITE_URL=https://eredeticsakra.hu  # Production
```

---

### 10. Open Graph Image
**File**: `app/opengraph-image.tsx` (new file)

See complete file in repository - generates dynamic 1200x630px image with:
- Purple-rose-gold gradient
- "Eredeti Csakra" branding
- Subtitle and features
- Domain badge

---

## Quick Commands

### Development
```bash
npm run dev
open http://localhost:3000/opengraph-image  # View OG image
```

### Build & Test
```bash
npm run build  # Also generates sitemap
ls -la public/sitemap.xml  # Verify sitemap
npm start  # Test production build
```

### Validation
```bash
# View metadata in browser
curl http://localhost:3000 | grep '<meta'
curl http://localhost:3000 | grep 'application/ld+json'
```

---

## Common Patterns

### Adding Metadata to New Page
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your description (150-160 chars)',
  // ... other fields
};
```

### Adding to Sitemap
Edit `next-sitemap.config.js`:
```javascript
additionalPaths: async (config) => {
  return [
    await config.transform(config, '/your-new-page'),
  ];
}
```

---

**Last Updated**: October 14, 2025
**Status**: Production Ready
