import { AuditResult } from "../types";

/** Add missing pages to sitemap.xml, or generate a fresh one. */
export function fixSitemap(
  current: string | null,
  audit: AuditResult,
  knownUrls: string[]
): string {
  const urls = new Set<string>();
  urls.add(audit.url + "/");
  for (const u of knownUrls) urls.add(u);

  if (current) {
    const existing = [...current.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(
      (m) => m[1]
    );
    for (const u of existing) urls.add(u);
  }

  const today = new Date().toISOString().slice(0, 10);
  const entries = [...urls]
    .map(
      (u) =>
        `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
