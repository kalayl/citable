import { CategoryResult, CrawlContext, Issue } from "../types";
import { fetchText, headCheck, matchAll } from "../http";
import { finalize } from "./util";

export async function auditLlmsTxt(ctx: CrawlContext): Promise<CategoryResult> {
  const issues: Issue[] = [];
  let score = 100;

  const res = await fetchText(`${ctx.baseUrl}/llms.txt`);
  if (!res || res.status !== 200 || !res.text.trim()) {
    return finalize("llms.txt", "llms-txt", 0, [
      {
        severity: "critical",
        message: "No llms.txt found at /llms.txt",
        fix: "Create an llms.txt file listing your key pages with titles and descriptions so AI crawlers can discover your content efficiently.",
      },
    ]);
  }
  // Looks like an HTML soft-404?
  if (/<html[\s>]/i.test(res.text.slice(0, 500))) {
    return finalize("llms.txt", "llms-txt", 10, [
      {
        severity: "critical",
        message: "/llms.txt returns an HTML page, not a plain-text llms.txt file",
        fix: "Serve a proper plain-text/markdown llms.txt at /llms.txt instead of an HTML fallback page.",
      },
    ]);
  }

  issues.push({ severity: "pass", message: "llms.txt exists and is plain text", fix: "" });

  // Extract URLs
  const urls = matchAll(/https?:\/\/[^\s)\]>"']+/g, res.text).map((m) => m[0]);
  const relative = matchAll(/\]\((\/[^\s)]+)\)/g, res.text).map((m) => ctx.baseUrl + m[1]);
  const allUrls = [...urls, ...relative];

  if (allUrls.length === 0) {
    score -= 40;
    issues.push({
      severity: "warning",
      message: "llms.txt contains no URLs",
      fix: "Add markdown links to your most important pages so AI crawlers know what to index.",
    });
  } else {
    // Duplicates
    const seen = new Set<string>();
    const dups = new Set<string>();
    for (const u of allUrls) {
      const norm = u.replace(/\/$/, "");
      if (seen.has(norm)) dups.add(norm);
      seen.add(norm);
    }
    if (dups.size > 0) {
      score -= Math.min(20, dups.size * 5);
      issues.push({
        severity: "warning",
        message: `${dups.size} duplicate URL${dups.size > 1 ? "s" : ""} in llms.txt`,
        fix: "Remove duplicate entries - they waste crawler budget and signal poor maintenance.",
      });
    } else {
      issues.push({ severity: "pass", message: "No duplicate entries", fix: "" });
    }

    // HEAD check a sample (max 8)
    const sample = [...seen].slice(0, 8);
    const statuses = await Promise.all(sample.map((u) => headCheck(u)));
    const broken = sample.filter((_, i) => statuses[i] === 404 || statuses[i] === 410 || statuses[i] === 0);
    const redirects = sample.filter((_, i) => statuses[i] >= 300 && statuses[i] < 400);
    if (broken.length > 0) {
      score -= Math.min(40, broken.length * 10);
      issues.push({
        severity: "critical",
        message: `${broken.length} of ${sample.length} sampled llms.txt URLs are broken (404/unreachable)`,
        fix: "Remove or update stale URLs in llms.txt. Broken links teach AI crawlers to distrust the file.",
      });
    }
    if (redirects.length > 0) {
      score -= Math.min(15, redirects.length * 5);
      issues.push({
        severity: "warning",
        message: `${redirects.length} sampled llms.txt URLs redirect instead of resolving directly`,
        fix: "Point llms.txt entries at final URLs, not redirects.",
      });
    }
    if (broken.length === 0 && redirects.length === 0) {
      issues.push({ severity: "pass", message: `Sampled URLs (${sample.length}) all resolve with 200`, fix: "" });
    }
  }

  // Claimed counts accuracy, e.g. "42 pages"
  const countClaim = res.text.match(/(\d+)\s+(pages|posts|articles|docs|entries)/i);
  if (countClaim) {
    const claimed = parseInt(countClaim[1], 10);
    if (allUrls.length > 0 && Math.abs(claimed - allUrls.length) > Math.max(3, claimed * 0.2)) {
      score -= 10;
      issues.push({
        severity: "warning",
        message: `llms.txt claims ${claimed} ${countClaim[2]} but lists ${allUrls.length} URLs`,
        fix: "Keep stated counts in sync with actual entries, or remove the count claim.",
      });
    }
  }

  // Structure: has a title heading?
  if (!/^#\s+.+/m.test(res.text)) {
    score -= 5;
    issues.push({
      severity: "warning",
      message: "llms.txt missing a top-level # heading",
      fix: "Start llms.txt with '# Site Name' followed by a one-line description, per the llms.txt convention.",
    });
  }

  return finalize("llms.txt", "llms-txt", score, issues);
}
