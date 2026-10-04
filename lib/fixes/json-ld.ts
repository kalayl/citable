import { AuditResult } from "../types";

/** Inject a baseline JSON-LD block into an HTML document's <head>. */
export function fixJsonLd(current: string | null, audit: AuditResult): string {
  const html = current || defaultHtml(audit);
  if (/application\/ld\+json/i.test(html)) return html; // already present

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: audit.domain,
    url: audit.url,
  };
  const script = `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${script}</head>`);
  }
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n${script}`);
  }
  return script + html;
}

function defaultHtml(audit: AuditResult): string {
  return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${audit.domain}</title>\n</head>\n<body>\n</body>\n</html>\n`;
}
