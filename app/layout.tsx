import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = "https://citable.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Citable — Will AI cite your site?",
  description:
    "Citable audits your website's AI search readiness: llms.txt, JSON-LD, AI-crawler robots config, content extractability, sitemaps, canonicals and more. Get a 0–100 score with ranked fixes.",
  keywords: [
    "AI search optimization",
    "LLM optimization",
    "llms.txt",
    "AI Overviews",
    "generative engine optimization",
    "GEO",
    "AI SEO audit",
  ],
  openGraph: {
    title: "Citable — Will AI cite your site?",
    description:
      "Get your AI search readiness score. Citable audits the LLM layer on top of your SEO: llms.txt, JSON-LD, AI crawlers, extractability.",
    url: siteUrl,
    siteName: "Citable",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Citable" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Citable — Will AI cite your site?",
    description:
      "Get your AI search readiness score. Audit llms.txt, JSON-LD, AI crawlers and content extractability.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Citable",
      url: siteUrl,
      logo: `${siteUrl}/og.png`,
      description: "Citable builds AI search readiness audits for websites.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Citable",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "Citable",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "AI search readiness audit tool. Point Citable at a URL and get a 0–100 AI search readiness score with ranked, actionable fixes across llms.txt, JSON-LD, AI-crawler robots config, content extractability, sitemaps, canonicals, social cards and internal linking.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Early access",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
