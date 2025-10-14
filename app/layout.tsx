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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
        >
          Ugrás a tartalomhoz
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
