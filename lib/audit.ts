import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditCache } from "@/db/schema";
import { AuditResult, CategoryResult, CrawlContext, PageData } from "./types";
import { fetchText, matchAll } from "./http";
import { auditLlmsTxt } from "./auditors/llms-txt";
import { auditLlmsFull } from "./auditors/llms-full";
import { auditJsonLd } from "./auditors/json-ld";
import { auditRobots } from "./auditors/robots";
import { auditExtractability } from "./auditors/extractability";
import { auditSitemap } from "./auditors/sitemap";
import { auditCanonicals } from "./auditors/canonicals";
import { auditOgCards } from "./auditors/og-cards";
import { auditInternalLinks } from "./auditors/internal-links";

const WEIGHTS: Record<string, number> = {
  "llms-txt": 0.15,
  "json-ld": 0.15,
  robots: 0.1,
  extractability: 0.15,
  sitemap: 0.1,
  canonicals: 0.1,
  "og-cards": 0.1,
  "llms-full": 0.05,
  "internal-links": 0.1,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const AUDIT_TIMEOUT_MS = 30_000;
const MAX_PAGES = 10;

type CacheEntry = { result: AuditResult; at: number };
const globalCache = globalThis as unknown as { __auditCache?: Map<string, CacheEntry> };
const cache = (globalCache.__auditCache ||= new Map<string, CacheEntry>());

function getMemCachedAudit(domain: string): AuditResult | null {
  const entry = cache.get(domain.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(domain.toLowerCase());
    return null;
  }
  return entry.result;
}

/** Check in-memory then DB cache for a fresh audit result (1h TTL). */
export async function getCachedAudit(domain: string): Promise<AuditResult | null> {
  const key = domain.toLowerCase();
  const mem = getMemCachedAudit(key);
  if (mem) return mem;
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select()
      .from(auditCache)
      .where(eq(auditCache.domain, key))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await db.delete(auditCache).where(eq(auditCache.domain, key));
      return null;
    }
    const result = row.result as AuditResult;
    cache.set(key, { result, at: row.createdAt.getTime() });
    return result;
  } catch (err) {
    console.error("[audit] DB cache read failed:", err);
    return null;
  }
}

async function setDbCachedAudit(domain: string, result: AuditResult): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    const values = {
      domain: domain.toLowerCase(),
      result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    };
    await db
      .insert(auditCache)
      .values(values)
      .onConflictDoUpdate({ target: auditCache.domain, set: values });
  } catch (err) {
    console.error("[audit] DB cache write failed:", err);
  }
}

export function normalizeUrl(input: string): { baseUrl: string; domain: string } | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  try {
    const u = new URL(raw);
    if (!u.hostname.includes(".")) return null;
    return { baseUrl: `${u.protocol}//${u.host}`, domain: u.host.toLowerCase() };
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const candidates = [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap_index.xml`];
  for (const c of candidates) {
    const res = await fetchText(c, 8000);
    if (!res || res.status !== 200 || !res.text.includes("<")) continue;
    let xml = res.text;
    // Sitemap index? Fetch first few child sitemaps.
    if (/<sitemapindex/i.test(xml)) {
      const children = matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi, xml)
        .map((m) => m[1])
        .slice(0, 3);
      const parts = await Promise.all(children.map((u) => fetchText(u, 8000)));
      xml = parts.map((p) => p?.text || "").join("\n");
    }
    const urls = matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi, xml)
      .map((m) => m[1])
      .filter((u) => /^https?:\/\//.test(u) && !u.endsWith(".xml"));
    if (urls.length > 0) return [...new Set(urls)];
  }
  return [];
}

async function fetchPage(url: string): Promise<PageData | null> {
  const res = await fetchText(url, 5000);
  if (!res) return null;
  return { url: res.finalUrl, status: res.status, html: res.text };
}

async function buildContext(baseUrl: string, domain: string): Promise<CrawlContext> {
  const [homepage, sitemapUrls] = await Promise.all([
    fetchPage(baseUrl + "/"),
    fetchSitemapUrls(baseUrl),
  ]);

  // Pick up to MAX_PAGES-1 sample pages: prefer sitemap, else internal links
  let candidates: string[] = [];
  if (sitemapUrls.length > 0) {
    candidates = sitemapUrls.filter((u) => u.replace(/\/$/, "") !== baseUrl);
  } else if (homepage) {
    candidates = matchAll(/<a[^>]+href\s*=\s*["']([^"'#]+)["']/gi, homepage.html)
      .map((m) => m[1])
      .filter((h) => h.startsWith("/") && h.length > 1)
      .map((h) => baseUrl + h.split("?")[0]);
  }
  // Spread sample across the list rather than taking the first N
  const uniq = [...new Set(candidates)].filter(
    (u) => !/\.(css|js|png|jpg|jpeg|svg|ico|pdf|xml|zip)$/i.test(u)
  );
  const n = Math.min(MAX_PAGES - 1, uniq.length, 9);
  const picked: string[] = [];
  for (let i = 0; i < n; i++) {
    picked.push(uniq[Math.floor((i * uniq.length) / n)]);
  }

  const fetched = await Promise.all(picked.map((u) => fetchPage(u)));
  const samplePages = fetched.filter(
    (p): p is PageData => !!p && p.status === 200 && p.html.length > 0
  );

  return {
    baseUrl,
    domain,
    homepage: homepage && homepage.status === 200 ? homepage : null,
    samplePages,
    sitemapUrls,
  };
}

export async function runAudit(inputUrl: string): Promise<AuditResult> {
  const norm = normalizeUrl(inputUrl);
  if (!norm) throw new Error("Invalid URL");

  const cached = await getCachedAudit(norm.domain);
  if (cached) return cached;

  const work = (async (): Promise<AuditResult> => {
    const ctx = await buildContext(norm.baseUrl, norm.domain);

    const categories: CategoryResult[] = await Promise.all([
      auditLlmsTxt(ctx),
      auditLlmsFull(ctx),
      auditJsonLd(ctx),
      auditRobots(ctx),
      auditExtractability(ctx),
      auditSitemap(ctx),
      auditCanonicals(ctx),
      auditOgCards(ctx),
      auditInternalLinks(ctx),
    ]);

    const overallScore = Math.round(
      categories.reduce((sum, c) => sum + c.score * (WEIGHTS[c.key] ?? 0), 0)
    );

    // Global top fixes: critical first, weighted by category weight, then warnings
    const allIssues = categories.flatMap((c) =>
      c.issues
        .filter((i) => i.severity !== "pass" && i.fix)
        .map((i) => ({
          category: c.name,
          severity: i.severity,
          message: i.message,
          fix: i.fix,
          weight: (WEIGHTS[c.key] ?? 0) * (i.severity === "critical" ? 2 : 1) * (100 - c.score),
        }))
    );
    allIssues.sort((a, b) => b.weight - a.weight);
    const topFixes = allIssues.slice(0, 5).map(({ category, severity, message, fix }) => ({
      category,
      severity,
      message,
      fix,
    }));

    const result: AuditResult = {
      domain: norm.domain,
      url: norm.baseUrl,
      overallScore,
      categories,
      topFixes,
      crawledAt: new Date().toISOString(),
      pagesCrawled: (ctx.homepage ? 1 : 0) + ctx.samplePages.length,
    };
    cache.set(norm.domain, { result, at: Date.now() });
    await setDbCachedAudit(norm.domain, result);
    return result;
  })();

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Audit timed out after 30s")), AUDIT_TIMEOUT_MS)
  );
  return Promise.race([work, timeout]);
}
