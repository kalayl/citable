import { CategoryResult, CrawlContext, Issue, PageData } from "../types";
import { attr, matchAll } from "../http";
import { finalize, failCategory } from "./util";

export async function auditCanonicals(ctx: CrawlContext): Promise<CategoryResult> {
  const pages: PageData[] = [ctx.homepage, ...ctx.samplePages].filter(
    (p): p is PageData => !!p
  );
  if (pages.length === 0) {
    return failCategory("Canonical coverage", "canonicals", "No pages could be crawled", "Make sure the site is reachable.");
  }

  const issues: Issue[] = [];
  let score = 100;
  let missing = 0;
  let mismatched = 0;
  let paramRisk = 0;

  for (const p of pages) {
    const linkTags = matchAll(/<link[^>]+>/gi, p.html).map((m) => m[0]);
    const canonicalTag = linkTags.find((t) => /rel\s*=\s*["']canonical["']/i.test(t));
    if (!canonicalTag) {
      missing++;
      continue;
    }
    const href = attr(canonicalTag, "href");
    if (!href) {
      missing++;
      continue;
    }
    const canonical = href.startsWith("/") ? ctx.baseUrl + href : href;
    const norm = (u: string) => u.replace(/\/$/, "").replace(/^http:/, "https:").toLowerCase();
    if (norm(canonical) !== norm(p.url.split("?")[0])) mismatched++;
    if (/[?&](utm_|ref=|fbclid)/i.test(canonical)) paramRisk++;
  }

  if (missing > 0) {
    score -= Math.min(50, missing * 15);
    issues.push({
      severity: missing === pages.length ? "critical" : "warning",
      message: `${missing}/${pages.length} sampled pages have no canonical tag`,
      fix: "Add <link rel=\"canonical\"> to every page template - without it, parameter and mirror URLs split your authority.",
    });
  } else {
    issues.push({ severity: "pass", message: `All ${pages.length} sampled pages have canonical tags`, fix: "" });
  }

  if (mismatched > 0) {
    score -= Math.min(30, mismatched * 10);
    issues.push({
      severity: "warning",
      message: `${mismatched} page${mismatched > 1 ? "s" : ""} have a canonical pointing to a different URL`,
      fix: "Verify self-referencing canonicals on primary pages - cross-canonicals tell crawlers to ignore the page.",
    });
  } else if (missing < pages.length) {
    issues.push({ severity: "pass", message: "Canonical URLs match page URLs", fix: "" });
  }

  if (paramRisk > 0) {
    score -= 15;
    issues.push({
      severity: "warning",
      message: `${paramRisk} canonical URL${paramRisk > 1 ? "s" : ""} contain tracking parameters (utm/ref)`,
      fix: "Strip tracking parameters from canonical URLs - they fragment indexing.",
    });
  }

  return finalize("Canonical coverage", "canonicals", score, issues);
}
