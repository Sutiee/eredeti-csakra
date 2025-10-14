import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eredeti Csakra - Fedezd fel belső energiáidat",
  description: "Ingyenes csakra elemzés 3 perc alatt. Derítsd ki, melyik csakrád blokkolt és hogyan oldhatod fel.",
  keywords: ["csakra", "energia", "spirituális", "önismeret", "gyógyulás"],
  authors: [{ name: "Eredeti Csakra" }],
  openGraph: {
    title: "Eredeti Csakra - Fedezd fel belső energiáidat",
    description: "Ingyenes csakra elemzés 3 perc alatt",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
