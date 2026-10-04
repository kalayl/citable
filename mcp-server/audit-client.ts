/**
 * Audit client for the MCP server.
 *
 * Strategy:
 * 1. If the audit API is reachable (LLMSCORE_API_URL or http://localhost:3000),
 *    POST /api/audit and use the response.
 * 2. Otherwise, try to import the local audit engine from lib/auditors/.
 * 3. If neither exists yet (engine built in parallel), fall back to a minimal
 *    built-in audit that checks the most important signals directly.
 */
import type { AuditResult, CategoryResult, Issue } from "../lib/types";
import { fetchText, stripTags, matchAll, attr } from "../lib/http";

export const CATEGORY_KEYS = [
  "llms-txt",
  "llms-full",
  "json-ld",
  "robots",
  "extractability",
  "sitemap",
  "canonicals",
  "og-cards",
  "internal-links",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return new URL(u).origin;
}

async function tryApi(url: string): Promise<AuditResult | null> {
  const base = process.env.LLMSCORE_API_URL || "http://localhost:3000";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    const res = await fetch(`${base}/api/audit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return (await res.json()) as AuditResult;
  } catch {
    return null;
  }
}

async function tryLocalEngine(url: string): Promise<AuditResult | null> {
  try {
    // Dynamic import so this works even before lib/auditors exists.
    const mod: any = await import("../lib/auditors/index" + "");
    const run = mod.runAudit || mod.audit || mod.default;
    if (typeof run === "function") return (await run(url)) as AuditResult;
    return null;
  } catch {
    return null;
  }
}

/* ------------------------- built-in fallback audit ------------------------ */

function scoreFromIssues(issues: Issue[]): number {
  let score = 100;
  for (const i of issues) {
    if (i.severity === "critical") score -= 40;
    else if (i.severity === "warning") score -= 15;
  }
  return Math.max(0, score);
}

async function fallbackCategory(
  baseUrl: string,
  key: CategoryKey
): Promise<CategoryResult> {
  const issues: Issue[] = [];
  const pass = (message: string) =>
    issues.push({ severity: "pass", message, fix: "" });

  const home = await fetchText(baseUrl);
  const html = home?.text ?? "";

  switch (key) {
    case "llms-txt": {
      const r = await fetchText(`${baseUrl}/llms.txt`);
      if (!r || r.status !== 200 || !r.text.trim()) {
        issues.push({
          severity: "critical",
          message: "No /llms.txt file found",
          fix: "Create /llms.txt with a short site summary and links to key pages in Markdown.",
        });
      } else pass("/llms.txt present");
      break;
    }
    case "llms-full": {
      const r = await fetchText(`${baseUrl}/llms-full.txt`);
      if (!r || r.status !== 200 || !r.text.trim()) {
        issues.push({
          severity: "warning",
          message: "No /llms-full.txt file found",
          fix: "Create /llms-full.txt containing full plain-text content of key pages for LLM consumption.",
        });
      } else pass("/llms-full.txt present");
      break;
    }
    case "json-ld": {
      const blocks = matchAll(
        /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
        html
      );
      if (blocks.length === 0) {
        issues.push({
          severity: "critical",
          message: "No JSON-LD structured data on homepage",
          fix: 'Add a <script type="application/ld+json"> block with Organization/WebSite schema.',
        });
      } else {
        let valid = 0;
        for (const b of blocks) {
          try {
            JSON.parse(b[1]);
            valid++;
          } catch {
            issues.push({
              severity: "warning",
              message: "JSON-LD block contains invalid JSON",
              fix: "Validate JSON-LD with a linter; ensure it parses as strict JSON.",
            });
          }
        }
        if (valid > 0) pass(`${valid} valid JSON-LD block(s) found`);
      }
      break;
    }
    case "robots": {
      const r = await fetchText(`${baseUrl}/robots.txt`);
      if (!r || r.status !== 200) {
        issues.push({
          severity: "warning",
          message: "No robots.txt found",
          fix: "Add robots.txt allowing AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and referencing your sitemap.",
        });
      } else {
        const txt = r.text.toLowerCase();
        const aiBots = ["gptbot", "claudebot", "perplexitybot"];
        const blocked = aiBots.filter((b) => {
          const idx = txt.indexOf(b);
          if (idx === -1) return false;
          const after = txt.slice(idx, idx + 300);
          return /disallow:\s*\/\s*($|\n)/.test(after);
        });
        if (blocked.length > 0) {
          issues.push({
            severity: "critical",
            message: `robots.txt blocks AI crawlers: ${blocked.join(", ")}`,
            fix: "Remove Disallow: / rules for AI user agents you want citing your site.",
          });
        } else pass("robots.txt present and does not block major AI crawlers");
      }
      break;
    }
    case "extractability": {
      const text = stripTags(html);
      if (text.length < 300) {
        issues.push({
          severity: "critical",
          message: "Homepage has very little extractable text (likely JS-rendered)",
          fix: "Server-render primary content so crawlers without JS can read it.",
        });
      } else pass(`Homepage exposes ${text.length} chars of extractable text`);
      const h1s = matchAll(/<h1[\s>]/gi, html);
      if (h1s.length === 0) {
        issues.push({
          severity: "warning",
          message: "No <h1> on homepage",
          fix: "Add a single descriptive <h1> stating what the site/page is.",
        });
      }
      break;
    }
    case "sitemap": {
      const r = await fetchText(`${baseUrl}/sitemap.xml`);
      if (!r || r.status !== 200 || !/<(urlset|sitemapindex)/i.test(r.text)) {
        issues.push({
          severity: "warning",
          message: "No valid sitemap.xml found",
          fix: "Generate a sitemap.xml and reference it from robots.txt.",
        });
      } else pass("sitemap.xml present");
      break;
    }
    case "canonicals": {
      const links = matchAll(/<link[^>]+>/gi, html).map((m) => m[0]);
      const canonical = links.find(
        (l) => (attr(l, "rel") || "").toLowerCase() === "canonical"
      );
      if (!canonical) {
        issues.push({
          severity: "warning",
          message: "No canonical link tag on homepage",
          fix: 'Add <link rel="canonical" href="..."> to every page.',
        });
      } else pass("Canonical tag present on homepage");
      break;
    }
    case "og-cards": {
      const metas = matchAll(/<meta[^>]+>/gi, html).map((m) => m[0]);
      const og = (p: string) =>
        metas.some((m) => (attr(m, "property") || attr(m, "name") || "") === p);
      const missing = ["og:title", "og:description", "og:image"].filter(
        (p) => !og(p)
      );
      if (missing.length > 0) {
        issues.push({
          severity: "warning",
          message: `Missing Open Graph tags: ${missing.join(", ")}`,
          fix: "Add og:title, og:description and og:image meta tags.",
        });
      } else pass("Core Open Graph tags present");
      break;
    }
    case "internal-links": {
      const anchors = matchAll(/<a[^>]+href\s*=\s*("[^"]*"|'[^']*')/gi, html);
      const internal = anchors.filter((a) => {
        const href = a[1].slice(1, -1);
        return href.startsWith("/") || href.startsWith(baseUrl);
      });
      if (internal.length < 3) {
        issues.push({
          severity: "warning",
          message: `Only ${internal.length} internal link(s) on homepage`,
          fix: "Add descriptive internal links so crawlers can discover key pages.",
        });
      } else pass(`${internal.length} internal links on homepage`);
      break;
    }
  }

  const names: Record<CategoryKey, string> = {
    "llms-txt": "llms.txt",
    "llms-full": "llms-full.txt",
    "json-ld": "JSON-LD structured data",
    robots: "Robots & AI crawler access",
    extractability: "Content extractability",
    sitemap: "Sitemap",
    canonicals: "Canonical URLs",
    "og-cards": "Open Graph cards",
    "internal-links": "Internal linking",
  };

  const topFixes = issues
    .filter((i) => i.severity !== "pass")
    .slice(0, 3)
    .map((i) => i.fix);

  return { name: names[key], key, score: scoreFromIssues(issues), issues, topFixes };
}

async function fallbackAudit(url: string): Promise<AuditResult> {
  const baseUrl = normalizeUrl(url);
  const domain = new URL(baseUrl).hostname;
  const categories = await Promise.all(
    CATEGORY_KEYS.map((k) => fallbackCategory(baseUrl, k))
  );
  const overallScore = Math.round(
    categories.reduce((s, c) => s + c.score, 0) / categories.length
  );
  const topFixes = categories
    .flatMap((c) =>
      c.issues
        .filter((i) => i.severity !== "pass")
        .map((i) => ({
          category: c.name,
          severity: i.severity,
          message: i.message,
          fix: i.fix,
        }))
    )
    .sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1))
    .slice(0, 5);
  return {
    domain,
    url: baseUrl,
    overallScore,
    categories,
    topFixes,
    crawledAt: new Date().toISOString(),
    pagesCrawled: 1,
  };
}

/* --------------------------------- public -------------------------------- */

export async function runFullAudit(url: string): Promise<AuditResult> {
  const normalized = normalizeUrl(url);
  return (
    (await tryApi(normalized)) ??
    (await tryLocalEngine(normalized)) ??
    (await fallbackAudit(normalized))
  );
}

export async function runCategoryAudit(
  url: string,
  category: CategoryKey
): Promise<CategoryResult> {
  const full = await runFullAudit(url);
  const match = full.categories.find(
    (c) => c.key === category || c.name.toLowerCase() === category
  );
  if (match) return match;
  // Fall back to direct single-category check
  return fallbackCategory(normalizeUrl(url), category);
}
