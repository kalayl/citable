import { CategoryResult, CrawlContext, Issue } from "../types";
import { matchAll } from "../http";
import { finalize, failCategory } from "./util";

function internalHrefs(html: string, baseUrl: string): string[] {
  return matchAll(/<a[^>]+href\s*=\s*["']([^"'#]+)["']/gi, html)
    .map((m) => m[1])
    .filter((h) => h.startsWith("/") || h.startsWith(baseUrl))
    .map((h) => (h.startsWith("/") ? baseUrl + h : h))
    .map((h) => h.split("?")[0].replace(/\/$/, ""))
    .filter((h) => !/\.(css|js|png|jpg|jpeg|gif|svg|ico|pdf|xml|zip)$/i.test(h));
}

export async function auditInternalLinks(ctx: CrawlContext): Promise<CategoryResult> {
  if (!ctx.homepage) {
    return failCategory("Internal linking", "internal-links", "Could not fetch homepage", "Make sure the homepage is reachable.");
  }

  const issues: Issue[] = [];
  let score = 100;

  // 1-click set: homepage links. 2-click set: links on crawled sample pages.
  const oneClick = new Set(internalHrefs(ctx.homepage.html, ctx.baseUrl));
  const twoClick = new Set(oneClick);
  for (const p of ctx.samplePages) {
    internalHrefs(p.html, ctx.baseUrl).forEach((h) => twoClick.add(h));
  }
  twoClick.add(ctx.baseUrl);

  if (oneClick.size === 0) {
    return finalize("Internal linking", "internal-links", 10, [
      {
        severity: "critical",
        message: "No internal links found on the homepage",
        fix: "Add internal navigation and contextual links - crawlers discover and weight pages via links.",
      },
    ]);
  }
  issues.push({ severity: "pass", message: `${oneClick.size} internal links on homepage`, fix: "" });

  // Orphans: in sitemap but not reachable within 2 clicks of homepage
  if (ctx.sitemapUrls.length > 0) {
    const norm = (u: string) => u.split("?")[0].replace(/\/$/, "");
    const reach = new Set([...twoClick].map(norm));
    const orphans = ctx.sitemapUrls.map(norm).filter((u) => !reach.has(u));
    const ratio = orphans.length / ctx.sitemapUrls.length;
    // Only penalise meaningfully if we crawled enough sample pages to judge
    if (orphans.length > 0 && ctx.samplePages.length >= 3) {
      if (ratio > 0.5) {
        score -= 35;
        issues.push({
          severity: "critical",
          message: `${orphans.length}/${ctx.sitemapUrls.length} sitemap pages appear unreachable within 2 clicks of the homepage`,
          fix: "Link orphaned pages from hub/category pages - pages only reachable via sitemap get far less crawl attention and authority.",
        });
      } else if (ratio > 0.2) {
        score -= 20;
        issues.push({
          severity: "warning",
          message: `${orphans.length} sitemap pages not found within 2 clicks of the homepage (sampled crawl)`,
          fix: "Strengthen internal links to deep pages via hub pages, related-content blocks or footer links.",
        });
      } else {
        issues.push({ severity: "pass", message: "Most sitemap pages reachable within 2 clicks (sampled)", fix: "" });
      }
    }
  }

  // Nav depth signal: nav present?
  if (!/<nav[\s>]/i.test(ctx.homepage.html)) {
    score -= 10;
    issues.push({
      severity: "warning",
      message: "No <nav> element on the homepage",
      fix: "Use a semantic <nav> for primary navigation - it helps crawlers identify your key pages.",
    });
  }

  return finalize("Internal linking", "internal-links", score, issues);
}
