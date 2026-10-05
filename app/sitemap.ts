import { MetadataRoute } from "next"

const SITE_URL = "https://llmscore.io"

const CHECK_SLUGS = [
  "llms-txt",
  "llms-full-txt",
  "json-ld",
  "robots",
  "extractability",
  "sitemap",
  "canonicals",
  "og-cards",
  "internal-links",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...CHECK_SLUGS.map((slug) => ({
      url: `${SITE_URL}/checks/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
