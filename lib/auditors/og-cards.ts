import { CategoryResult, CrawlContext, Issue, PageData } from "../types";
import { attr, headCheck, matchAll, stripTags } from "../http";
import { finalize, failCategory } from "./util";

function metaContent(html: string, prop: string): string | null {
  const metas = matchAll(/<meta[^>]+>/gi, html).map((m) => m[0]);
  for (const m of metas) {
    const p = attr(m, "property") || attr(m, "name");
    if (p && p.toLowerCase() === prop.toLowerCase()) {
      return attr(m, "content");
    }
  }
  return null;
}

export async function auditOgCards(ctx: CrawlContext): Promise<CategoryResult> {
  const pages: PageData[] = [ctx.homepage, ...ctx.samplePages].filter(
    (p): p is PageData => !!p
  );
  if (pages.length === 0) {
    return failCategory("OG / Twitter cards", "og-cards", "No pages could be crawled", "Make sure the site is reachable.");
  }

  const issues: Issue[] = [];
  let score = 100;
  let missingTitle = 0;
  let missingDesc = 0;
  let missingImage = 0;
  let inconsistent = 0;
  const imageUrls = new Set<string>();

  for (const p of pages) {
    const ogTitle = metaContent(p.html, "og:title");
    const ogDesc = metaContent(p.html, "og:description");
    const ogImage = metaContent(p.html, "og:image");
    if (!ogTitle) missingTitle++;
    if (!ogDesc) missingDesc++;
    if (!ogImage) missingImage++;
    else imageUrls.add(ogImage.startsWith("/") ? ctx.baseUrl + ogImage : ogImage);

    const titleTag = p.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (ogTitle && titleTag) {
      const t = stripTags(titleTag[1]).toLowerCase();
      const o = ogTitle.toLowerCase();
      if (t && o && !t.includes(o.slice(0, 20)) && !o.includes(t.slice(0, 20))) inconsistent++;
    }
  }

  if (missingTitle > 0) {
    score -= Math.min(30, missingTitle * 10);
    issues.push({
      severity: "warning",
      message: `og:title missing on ${missingTitle}/${pages.length} sampled pages`,
      fix: "Add og:title to every page - link previews in AI chats and social use it.",
    });
  }
  if (missingDesc > 0) {
    score -= Math.min(25, missingDesc * 8);
    issues.push({
      severity: "warning",
      message: `og:description missing on ${missingDesc}/${pages.length} sampled pages`,
      fix: "Add og:description with a concise summary of each page.",
    });
  }
  if (missingImage > 0) {
    score -= Math.min(25, missingImage * 8);
    issues.push({
      severity: "warning",
      message: `og:image missing on ${missingImage}/${pages.length} sampled pages`,
      fix: "Add an og:image (1200x630) to every shareable page.",
    });
  }
  if (missingTitle + missingDesc + missingImage === 0) {
    issues.push({ severity: "pass", message: "og:title, og:description and og:image present on all sampled pages", fix: "" });
  }

  if (inconsistent > 0) {
    score -= 10;
    issues.push({
      severity: "warning",
      message: `og:title diverges from <title> on ${inconsistent} page${inconsistent > 1 ? "s" : ""}`,
      fix: "Keep og:title consistent with the page title to avoid mixed signals.",
    });
  }

  // HEAD check up to 3 og:image URLs
  const toCheck = [...imageUrls].slice(0, 3);
  if (toCheck.length > 0) {
    const statuses = await Promise.all(toCheck.map((u) => headCheck(u)));
    const brokenImgs = toCheck.filter((_, i) => statuses[i] >= 400 || statuses[i] === 0);
    if (brokenImgs.length > 0) {
      score -= 20;
      issues.push({
        severity: "critical",
        message: `${brokenImgs.length} og:image URL${brokenImgs.length > 1 ? "s" : ""} do not resolve`,
        fix: "Fix broken og:image URLs - dead preview images look broken everywhere your links are shared.",
      });
    } else {
      issues.push({ severity: "pass", message: "og:image URLs resolve", fix: "" });
    }
  }

  return finalize("OG / Twitter cards", "og-cards", score, issues);
}
