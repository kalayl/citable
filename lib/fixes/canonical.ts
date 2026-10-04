import { AuditResult } from "../types";

/** Add a canonical link tag to an HTML document's <head>. */
export function fixCanonical(current: string | null, audit: AuditResult): string {
  const html =
    current ||
    `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${audit.domain}</title>\n</head>\n<body>\n</body>\n</html>\n`;
  if (/<link[^>]+rel\s*=\s*["']canonical["']/i.test(html)) return html;

  const tag = `  <link rel="canonical" href="${audit.url}/">\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${tag}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}\n${tag}`);
  return tag + html;
}
