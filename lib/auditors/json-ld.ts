import { CategoryResult, CrawlContext, Issue, PageData } from "../types";
import { matchAll } from "../http";
import { finalize, failCategory } from "./util";

const VALUABLE_TYPES = [
  "Organization",
  "WebSite",
  "FAQPage",
  "BreadcrumbList",
  "Product",
  "Article",
  "BlogPosting",
  "HowTo",
  "SoftwareApplication",
];

function extractTypes(html: string): { types: string[]; invalidBlocks: number } {
  const blocks = matchAll(
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    html
  );
  const types: string[] = [];
  let invalidBlocks = 0;
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b[1].trim());
      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"] && Array.isArray(parsed["@graph"])
          ? parsed["@graph"]
          : [parsed];
      for (const n of nodes) {
        const t = n && n["@type"];
        if (typeof t === "string") types.push(t);
        else if (Array.isArray(t)) types.push(...t.filter((x) => typeof x === "string"));
      }
    } catch {
      invalidBlocks++;
    }
  }
  return { types, invalidBlocks };
}

export async function auditJsonLd(ctx: CrawlContext): Promise<CategoryResult> {
  if (!ctx.homepage) {
    return failCategory(
      "JSON-LD for AI extraction",
      "json-ld",
      "Could not fetch homepage to inspect structured data",
      "Make sure your homepage is reachable and returns HTML."
    );
  }

  const issues: Issue[] = [];
  let score = 0;

  const pages: PageData[] = [ctx.homepage, ...ctx.samplePages];
  const allTypes = new Set<string>();
  let invalid = 0;
  let pagesWithLd = 0;
  for (const p of pages) {
    const { types, invalidBlocks } = extractTypes(p.html);
    if (types.length > 0) pagesWithLd++;
    types.forEach((t) => allTypes.add(t));
    invalid += invalidBlocks;
  }

  if (allTypes.size === 0 && invalid === 0) {
    return finalize("JSON-LD for AI extraction", "json-ld", 0, [
      {
        severity: "critical",
        message: `No JSON-LD structured data found across ${pages.length} crawled pages`,
        fix: "Add JSON-LD blocks (Organization, WebSite, FAQPage, Article) - structured data is the highest-leverage signal for AI extraction.",
      },
    ]);
  }

  // Base points for having any valid JSON-LD
  score = 30;

  // Core types
  if (allTypes.has("Organization")) {
    score += 15;
    issues.push({ severity: "pass", message: "Organization schema present", fix: "" });
  } else {
    issues.push({
      severity: "critical",
      message: "No Organization schema found",
      fix: "Add Organization JSON-LD with name, logo, url and sameAs links so AI systems can identify your brand.",
    });
  }
  if (allTypes.has("WebSite")) {
    score += 10;
    issues.push({ severity: "pass", message: "WebSite schema present", fix: "" });
  } else {
    issues.push({
      severity: "warning",
      message: "No WebSite schema found",
      fix: "Add WebSite JSON-LD on the homepage with your site name and URL.",
    });
  }

  // Content types
  const contentTypes = ["FAQPage", "Article", "BlogPosting", "HowTo", "Product", "SoftwareApplication"];
  const present = contentTypes.filter((t) => allTypes.has(t));
  score += Math.min(25, present.length * 10);
  if (present.length === 0) {
    issues.push({
      severity: "warning",
      message: "No content schemas (FAQPage, Article, HowTo, Product...) found on sampled pages",
      fix: "Add FAQPage schema to FAQ sections and Article schema to posts - these are directly quoted by AI search engines.",
    });
  } else {
    issues.push({ severity: "pass", message: `Content schemas present: ${present.join(", ")}`, fix: "" });
  }

  if (allTypes.has("BreadcrumbList")) {
    score += 5;
    issues.push({ severity: "pass", message: "BreadcrumbList schema present", fix: "" });
  }

  // Coverage across pages
  const coverage = pagesWithLd / pages.length;
  score += Math.round(coverage * 15);
  if (coverage < 0.5) {
    issues.push({
      severity: "warning",
      message: `Only ${pagesWithLd}/${pages.length} sampled pages carry JSON-LD`,
      fix: "Roll structured data out across all key templates, not just the homepage.",
    });
  }

  if (invalid > 0) {
    score -= invalid * 10;
    issues.push({
      severity: "critical",
      message: `${invalid} JSON-LD block${invalid > 1 ? "s" : ""} failed to parse (invalid JSON)`,
      fix: "Fix malformed JSON-LD - invalid blocks are silently ignored by crawlers.",
    });
  }

  return finalize("JSON-LD for AI extraction", "json-ld", score, issues);
}
