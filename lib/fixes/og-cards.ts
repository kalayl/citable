import { AuditResult } from "../types";

/** Add Open Graph tags to an HTML document's <head>. */
export function fixOgCards(current: string | null, audit: AuditResult): string {
  const html =
    current ||
    `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${audit.domain}</title>\n</head>\n<body>\n</body>\n</html>\n`;

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || audit.domain;
  const descMatch = html.match(
    /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']*)["']/i
  );
  const description = descMatch?.[1] || `${audit.domain} — overview and key pages.`;

  const tags: string[] = [];
  if (!/property\s*=\s*["']og:title["']/i.test(html))
    tags.push(`  <meta property="og:title" content="${title}">`);
  if (!/property\s*=\s*["']og:description["']/i.test(html))
    tags.push(`  <meta property="og:description" content="${description}">`);
  if (!/property\s*=\s*["']og:url["']/i.test(html))
    tags.push(`  <meta property="og:url" content="${audit.url}/">`);
  if (!/property\s*=\s*["']og:type["']/i.test(html))
    tags.push(`  <meta property="og:type" content="website">`);
  if (!/name\s*=\s*["']twitter:card["']/i.test(html))
    tags.push(`  <meta name="twitter:card" content="summary_large_image">`);

  if (tags.length === 0) return html;
  const block = tags.join("\n") + "\n";
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${block}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}\n${block}`);
  return block + html;
}
