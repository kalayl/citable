import { NextRequest, NextResponse } from "next/server";
import { runAudit, getCachedAudit } from "@/lib/audit";
import { fetchText, matchAll } from "@/lib/http";
import {
  GITHUB_TOKEN_COOKIE,
  getFile,
  putFile,
  getDefaultBranch,
  createBranch,
  createPullRequest,
} from "@/lib/github";
import { fixLlmsTxt } from "@/lib/fixes/llms-txt";
import { fixRobots } from "@/lib/fixes/robots";
import { fixJsonLd } from "@/lib/fixes/json-ld";
import { fixSitemap } from "@/lib/fixes/sitemap";
import { fixCanonical } from "@/lib/fixes/canonical";
import { fixOgCards } from "@/lib/fixes/og-cards";
import type { AuditResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const HTML_CANDIDATES = ["index.html", "public/index.html", "src/index.html"];

interface FixPlan {
  /** candidate file paths, first existing wins; first entry used if none exist */
  candidates: string[];
  generate: (current: string | null, audit: AuditResult, sitemapUrls: string[]) => string;
  title: string;
  summary: string;
}

const FIX_PLANS: Record<string, FixPlan> = {
  "llms-txt": {
    candidates: ["public/llms.txt", "llms.txt"],
    generate: (c, a, s) => fixLlmsTxt(c, a, s),
    title: "Add llms.txt for AI crawlers",
    summary:
      "Adds an llms.txt file listing your key pages so AI crawlers (ChatGPT, Claude, Perplexity) can discover and cite your content efficiently.",
  },
  robots: {
    candidates: ["public/robots.txt", "robots.txt"],
    generate: (c, a) => fixRobots(c, `${a.url}/sitemap.xml`),
    title: "Allow AI crawlers in robots.txt",
    summary:
      "Adds explicit Allow rules for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) so LLM-based search engines can index your site.",
  },
  "json-ld": {
    candidates: HTML_CANDIDATES,
    generate: (c, a) => fixJsonLd(c, a),
    title: "Add JSON-LD structured data",
    summary:
      "Injects schema.org JSON-LD into your HTML head so AI systems can understand what your site is about.",
  },
  sitemap: {
    candidates: ["public/sitemap.xml", "sitemap.xml"],
    generate: (c, a, s) => fixSitemap(c, a, s),
    title: "Update sitemap.xml",
    summary:
      "Adds missing pages to your sitemap so crawlers can find all of your content.",
  },
  canonicals: {
    candidates: HTML_CANDIDATES,
    generate: (c, a) => fixCanonical(c, a),
    title: "Add canonical tags",
    summary:
      "Adds canonical link tags so crawlers attribute your content to the right URL.",
  },
  "og-cards": {
    candidates: HTML_CANDIDATES,
    generate: (c, a) => fixOgCards(c, a),
    title: "Add Open Graph tags",
    summary:
      "Adds Open Graph and Twitter card tags so your pages render rich previews when cited or shared.",
  },
};

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const res = await fetchText(`${baseUrl}/sitemap.xml`, 8000);
  if (!res || res.status !== 200) return [];
  return matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi, res.text)
    .map((m) => m[1])
    .filter((u) => /^https?:\/\//.test(u) && !u.endsWith(".xml"));
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(GITHUB_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Not connected to GitHub. Connect your account first." },
      { status: 401 }
    );
  }

  let body: { domain?: string; category?: string; issueIndex?: number; repo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { domain, category, repo } = body;
  if (!domain || !category || !repo || !repo.includes("/")) {
    return NextResponse.json(
      { error: "Missing required fields: domain, category, repo (owner/repo)" },
      { status: 400 }
    );
  }

  const plan = FIX_PLANS[category];
  if (!plan) {
    return NextResponse.json(
      { error: `No automated fix available for category '${category}'` },
      { status: 400 }
    );
  }

  const [owner, repoName] = repo.split("/");

  try {
    // 1. Get the audit result (cache or re-run)
    const audit = getCachedAudit(domain) || (await runAudit(domain));

    // 2. Find the base branch
    const base = await getDefaultBranch(token, owner, repoName);

    // 3. Find the target file (first existing candidate, else first candidate)
    let targetPath = plan.candidates[0];
    let currentFile = null;
    for (const candidate of plan.candidates) {
      const f = await getFile(token, owner, repoName, candidate, base.branch);
      if (f) {
        targetPath = candidate;
        currentFile = f;
        break;
      }
    }

    // 4. Generate the fixed content
    const sitemapUrls = await fetchSitemapUrls(audit.url);
    const fixed = plan.generate(currentFile?.content ?? null, audit, sitemapUrls);

    if (currentFile && currentFile.content === fixed) {
      return NextResponse.json(
        { error: "File already looks correct — no changes needed." },
        { status: 409 }
      );
    }

    // 5. Create branch
    const branchName = `llmscore/fix-${category}-${Date.now()}`;
    await createBranch(token, owner, repoName, branchName, base.sha);

    // 6. Commit the file
    await putFile(token, owner, repoName, targetPath, {
      content: fixed,
      message: `${plan.title} (${targetPath})`,
      branch: branchName,
      sha: currentFile?.sha,
    });

    // 7. Open PR
    const issueList = (audit.categories.find((c) => c.key === category)?.issues || [])
      .filter((i) => i.severity !== "pass")
      .map((i) => `- **${i.severity}**: ${i.message}`)
      .join("\n");

    const prBody = [
      `## ${plan.title}`,
      "",
      plan.summary,
      "",
      "### Issues found by the audit",
      issueList || "- (see full report)",
      "",
      `### Changed`,
      `- \`${targetPath}\` (${currentFile ? "updated" : "created"})`,
      "",
      `---`,
      `Generated by [LLMScore](https://llmscore.dev) from an audit of **${audit.domain}** (score: ${audit.overallScore}/100). Review the diff, then merge.`,
    ].join("\n");

    const prUrl = await createPullRequest(token, owner, repoName, {
      title: plan.title,
      body: prBody,
      head: branchName,
      base: base.branch,
    });

    return NextResponse.json({ prUrl, branch: branchName, path: targetPath });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fix failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
