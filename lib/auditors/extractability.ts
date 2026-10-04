import { CategoryResult, CrawlContext, Issue, PageData } from "../types";
import { matchAll, stripTags } from "../http";
import { finalize, failCategory } from "./util";

const QUESTION_WORDS = /^(what|why|how|when|where|who|which|can|should|is|are|do|does|will)\b/i;

export async function auditExtractability(ctx: CrawlContext): Promise<CategoryResult> {
  if (!ctx.homepage) {
    return failCategory(
      "Content extractability",
      "extractability",
      "Could not fetch homepage",
      "Make sure the homepage is reachable."
    );
  }
  const issues: Issue[] = [];
  let score = 100;
  const pages: PageData[] = [ctx.homepage, ...ctx.samplePages];

  let totalH2 = 0;
  let questionH2 = 0;
  let tldrPages = 0;
  let longOpeners = 0;
  let noH1 = 0;

  for (const p of pages) {
    const h2s = matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, p.html).map((m) => stripTags(m[1]));
    totalH2 += h2s.length;
    questionH2 += h2s.filter((h) => QUESTION_WORDS.test(h.trim()) || h.includes("?")).length;

    const body = stripTags(p.html);
    if (/\b(tl;?dr|key takeaways|in short|summary:)\b/i.test(p.html) || /\b(tl;?dr|key takeaways)\b/i.test(body)) {
      tldrPages++;
    }

    const firstP = matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi, p.html)
      .map((m) => stripTags(m[1]))
      .find((t) => t.length > 20);
    if (firstP && firstP.split(/\s+/).length > 80) longOpeners++;

    if (!/<h1[\s>]/i.test(p.html)) noH1++;
  }

  // Question-based H2s
  if (totalH2 === 0) {
    score -= 25;
    issues.push({
      severity: "warning",
      message: "No H2 headings found on sampled pages",
      fix: "Structure content with H2 subheadings - AI systems use heading hierarchy to segment and quote content.",
    });
  } else {
    const ratio = questionH2 / totalH2;
    if (ratio < 0.1) {
      score -= 20;
      issues.push({
        severity: "warning",
        message: `Only ${questionH2}/${totalH2} H2s are question-based`,
        fix: "Rewrite key H2s as questions ('How does X work?') - question headings map directly to AI search queries.",
      });
    } else {
      issues.push({ severity: "pass", message: `${questionH2}/${totalH2} H2s are question-based`, fix: "" });
    }
  }

  // TL;DR blocks
  if (tldrPages === 0) {
    score -= 20;
    issues.push({
      severity: "warning",
      message: "No TL;DR / key-takeaways blocks found on sampled pages",
      fix: "Add a 2-3 sentence TL;DR at the top of long pages - LLMs preferentially quote concise summaries.",
    });
  } else {
    issues.push({ severity: "pass", message: `TL;DR/summary blocks found on ${tldrPages}/${pages.length} pages`, fix: "" });
  }

  // Opening paragraph length
  if (longOpeners > pages.length / 2) {
    score -= 15;
    issues.push({
      severity: "warning",
      message: `${longOpeners}/${pages.length} pages open with paragraphs over 80 words`,
      fix: "Tighten opening paragraphs to under ~50 words - front-load the answer.",
    });
  } else {
    issues.push({ severity: "pass", message: "Opening paragraphs are concise", fix: "" });
  }

  // H1 presence
  if (noH1 > 0) {
    score -= Math.min(20, noH1 * 7);
    issues.push({
      severity: noH1 === pages.length ? "critical" : "warning",
      message: `${noH1}/${pages.length} sampled pages have no H1`,
      fix: "Give every page exactly one descriptive H1 - it is the primary topic signal for extraction.",
    });
  } else {
    issues.push({ severity: "pass", message: "All sampled pages have an H1", fix: "" });
  }

  // Content volume check (JS-only shells)
  const homeText = stripTags(ctx.homepage.html);
  if (homeText.length < 400) {
    score -= 30;
    issues.push({
      severity: "critical",
      message: `Homepage renders only ~${homeText.length} characters of static text - likely a JS-rendered shell`,
      fix: "Server-render your content. Most AI crawlers do not execute JavaScript, so client-only content is invisible to them.",
    });
  }

  return finalize("Content extractability", "extractability", score, issues);
}
