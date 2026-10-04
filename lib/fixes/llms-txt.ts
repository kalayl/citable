import { AuditResult } from "../types";

/** Regenerate llms.txt from audit/sitemap data. */
export function fixLlmsTxt(
  _current: string | null,
  audit: AuditResult,
  sitemapUrls: string[]
): string {
  const domain = audit.domain;
  const lines: string[] = [];
  lines.push(`# ${domain}`);
  lines.push("");
  lines.push(`> Key pages on ${domain}, listed for AI crawlers and LLM-based search.`);
  lines.push("");
  lines.push("## Pages");
  lines.push("");

  const urls = sitemapUrls.length > 0 ? sitemapUrls.slice(0, 50) : [audit.url];
  for (const u of urls) {
    let label: string;
    try {
      const path = new URL(u).pathname;
      label =
        path === "/" || path === ""
          ? "Home"
          : path
              .replace(/\/$/, "")
              .split("/")
              .filter(Boolean)
              .pop()!
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      label = u;
    }
    lines.push(`- [${label}](${u})`);
  }
  lines.push("");
  return lines.join("\n");
}
