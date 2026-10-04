import { CategoryResult, CrawlContext, Issue } from "../types";
import { fetchText, matchAll } from "../http";
import { finalize } from "./util";

export async function auditLlmsFull(ctx: CrawlContext): Promise<CategoryResult> {
  const issues: Issue[] = [];
  let score = 100;

  const res = await fetchText(`${ctx.baseUrl}/llms-full.txt`, 8000);
  if (!res || res.status !== 200 || !res.text.trim()) {
    return finalize("llms-full.txt", "llms-full", 0, [
      {
        severity: "critical",
        message: "No llms-full.txt found at /llms-full.txt",
        fix: "Generate an llms-full.txt containing full page content so LLMs can ingest your site in one fetch.",
      },
    ]);
  }
  if (/<html[\s>]/i.test(res.text.slice(0, 500))) {
    return finalize("llms-full.txt", "llms-full", 10, [
      {
        severity: "critical",
        message: "/llms-full.txt returns an HTML page, not plain text",
        fix: "Serve plain-text/markdown content at /llms-full.txt instead of an HTML fallback.",
      },
    ]);
  }
  issues.push({ severity: "pass", message: "llms-full.txt exists", fix: "" });

  // Count entries (H1/H2 sections or URL lines)
  const headings = matchAll(/^#{1,2}\s+(.+)$/gm, res.text).map((m) => m[1].trim());
  const entryCount = headings.length;

  if (ctx.sitemapUrls.length > 0 && entryCount > 0) {
    const ratio = entryCount / ctx.sitemapUrls.length;
    if (ratio < 0.5) {
      score -= 30;
      issues.push({
        severity: "critical",
        message: `llms-full.txt has ~${entryCount} sections but sitemap lists ${ctx.sitemapUrls.length} pages - large coverage gap`,
        fix: "Regenerate llms-full.txt to cover all indexable pages, or document why pages are excluded.",
      });
    } else if (ratio < 0.8) {
      score -= 15;
      issues.push({
        severity: "warning",
        message: `llms-full.txt covers ~${entryCount}/${ctx.sitemapUrls.length} sitemap pages`,
        fix: "Close the coverage gap between llms-full.txt and your sitemap.",
      });
    } else {
      issues.push({ severity: "pass", message: `Coverage roughly matches sitemap (${entryCount} sections / ${ctx.sitemapUrls.length} pages)`, fix: "" });
    }
  } else if (entryCount === 0) {
    score -= 25;
    issues.push({
      severity: "warning",
      message: "llms-full.txt has no markdown section headings - structure unclear",
      fix: "Structure llms-full.txt with # / ## headings per page so LLMs can segment content.",
    });
  }

  // Name quality: "CODE: CODE" duplicate-name pattern
  const dupNames = headings.filter((h) => {
    const m = h.match(/^([^:]{2,40}):\s*(.+)$/);
    return m && m[1].trim().toLowerCase() === m[2].trim().toLowerCase();
  });
  if (dupNames.length > 0) {
    score -= Math.min(20, dupNames.length * 4);
    issues.push({
      severity: "warning",
      message: `${dupNames.length} section titles have duplicated names (e.g. "${dupNames[0]}")`,
      fix: "Clean up generated titles - 'NAME: NAME' duplicates suggest a broken export template.",
    });
  }

  // Currency / encoding issues (mojibake)
  const mojibake = matchAll(/Â£|â‚¬|â€™|â€œ|Ã©|&#x?[0-9a-f]+;/gi, res.text);
  if (mojibake.length > 3) {
    score -= 15;
    issues.push({
      severity: "warning",
      message: `Encoding artifacts detected (${mojibake.length} occurrences, e.g. "${mojibake[0][0]}")`,
      fix: "Fix character encoding in your llms-full.txt generator - serve clean UTF-8 (£, €, ', \u201C).",
    });
  } else {
    issues.push({ severity: "pass", message: "No encoding artifacts detected", fix: "" });
  }

  return finalize("llms-full.txt", "llms-full", score, issues);
}
