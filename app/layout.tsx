import type { Metadata } from "next";
import { Inter, EB_Garamond, Caveat } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
});

const siteUrl = "https://llmscore.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LLMScore — What's your LLM score?",
  description:
    "LLMScore audits your website's AI search readiness: llms.txt, JSON-LD, AI-crawler robots config, content extractability, sitemaps, canonicals and more. Get your LLM score (0–100) with ranked fixes.",
  keywords: [
    "LLM score",
    "LLM optimization",
    "AI search readiness score",
    "AI search optimization",
    "llms.txt",
    "AI Overviews",
    "generative engine optimization",
    "GEO",
  ],
  openGraph: {
    title: "LLMScore — What's your LLM score?",
    description:
      "Get your LLM score. LLMScore audits the LLM layer on top of your SEO: llms.txt, JSON-LD, AI crawlers, extractability.",
    url: siteUrl,
    siteName: "LLMScore",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "LLMScore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLMScore — What's your LLM score?",
    description:
      "Get your LLM score. Audit llms.txt, JSON-LD, AI crawlers and content extractability.",
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
      name: "LLMScore",
      url: siteUrl,
      logo: `${siteUrl}/og.png`,
      description: "LLMScore builds AI search readiness audits for websites.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "LLMScore",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "LLMScore",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "AI search readiness audit tool. Point LLMScore at a URL and get a 0–100 AI search readiness score with ranked, actionable fixes across llms.txt, JSON-LD, AI-crawler robots config, content extractability, sitemaps, canonicals, social cards and internal linking.",
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
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${hand.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
