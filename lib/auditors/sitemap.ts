import { CategoryResult, CrawlContext, Issue } from "../types";
import { headCheck, matchAll, stripTags } from "../http";
import { finalize } from "./util";

export async function auditSitemap(ctx: CrawlContext): Promise<CategoryResult> {
  const issues: Issue[] = [];
  let score = 100;

  if (ctx.sitemapUrls.length === 0) {
    return finalize("Sitemap completeness", "sitemap", 0, [
      {
        severity: "critical",
        message: "No sitemap.xml found (or it contains no URLs)",
        fix: "Publish a sitemap.xml listing all indexable pages and reference it from robots.txt.",
      },
    ]);
  }

  issues.push({
    severity: "pass",
    message: `Sitemap found with ${ctx.sitemapUrls.length} URL${ctx.sitemapUrls.length > 1 ? "s" : ""}`,
    fix: "",
  });

  // HEAD check a sample
  const sample = ctx.sitemapUrls.slice(0, 8);
  const statuses = await Promise.all(sample.map((u) => headCheck(u)));
  const broken = sample.filter((_, i) => statuses[i] >= 400 || statuses[i] === 0);
  const redirecting = sample.filter((_, i) => statuses[i] >= 300 && statuses[i] < 400);
  if (broken.length > 0) {
    score -= Math.min(40, broken.length * 12);
    issues.push({
      severity: "critical",
      message: `${broken.length}/${sample.length} sampled sitemap URLs return errors`,
      fix: "Remove dead URLs from the sitemap - error entries waste crawl budget and erode trust.",
    });
  }
  if (redirecting.length > 0) {
    score -= Math.min(15, redirecting.length * 5);
    issues.push({
      severity: "warning",
      message: `${redirecting.length}/${sample.length} sampled sitemap URLs redirect`,
      fix: "List final canonical URLs in the sitemap, not redirecting ones.",
    });
  }
  if (broken.length === 0 && redirecting.length === 0) {
    issues.push({ severity: "pass", message: `All ${sample.length} sampled sitemap URLs return 200`, fix: "" });
  }

  // Key pages present? Check homepage internal links vs sitemap
  if (ctx.homepage) {
    const links = matchAll(/<a[^>]+href\s*=\s*["']([^"'#?]+)["']/gi, ctx.homepage.html)
      .map((m) => m[1])
      .filter((h) => h.startsWith("/") || h.startsWith(ctx.baseUrl))
      .map((h) => (h.startsWith("/") ? ctx.baseUrl + h : h))
      .map((h) => h.replace(/\/$/, ""));
    const sitemapSet = new Set(ctx.sitemapUrls.map((u) => u.replace(/\/$/, "")));
    const missing = [...new Set(links)].filter(
      (l) => !sitemapSet.has(l) && !/\.(css|js|png|jpg|svg|ico|pdf|xml)$/i.test(l)
    );
    if (missing.length > 3) {
      score -= 15;
      issues.push({
        severity: "warning",
        message: `${missing.length} pages linked from the homepage are missing from the sitemap`,
        fix: "Include all linked, indexable pages in sitemap.xml (e.g. " + missing.slice(0, 3).map((m) => new URL(m).pathname).join(", ") + ").",
      });
    } else {
      issues.push({ severity: "pass", message: "Homepage-linked pages are covered by the sitemap", fix: "" });
    }
  }

  return finalize("Sitemap completeness", "sitemap", score, issues);
}
