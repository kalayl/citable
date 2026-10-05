import { NextRequest, NextResponse } from "next/server";
import { runAudit, getCachedAudit } from "@/lib/audit";
import { fetchText, matchAll } from "@/lib/http";
import {
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
import { auth } from "@/auth";
import { getOrCreateSessionId } from "@/lib/session-anon";
import { canCreatePR, recordPrFix } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/stripe";
import { trackFixPR } from "@/lib/analytics";

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
  // Auth.js session check
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Sign in required", signinUrl: "/signin" },
      { status: 401 },
    );
  }

  const billingEnabled = isStripeConfigured();
  const { sessionId } = getOrCreateSessionId(req);
  if (billingEnabled) {
    const quota = await canCreatePR(sessionId, 1);
    if (!quota.allowed) {
      const upgrade =
        quota.plan === "free"
          ? "Upgrade to Pro ($29/mo) for up to 10 GitHub PR fixes per month."
          : quota.plan === "agency"
            ? "You've used all 50 PR fixes this month — contact us about Enterprise for unlimited fixes."
            : `You've used all ${quota.limit} PR fixes this month — upgrade to Agency ($99/mo) for 50/mo.`;
      return NextResponse.json(
        {
          error:
            quota.plan === "free"
              ? "One-click PR fixes require a Pro or Agency subscription."
              : `Monthly PR fix limit reached (${quota.used}/${quota.limit}).`,
          code: "payment_required",
          plan: quota.plan,
          used: quota.used,
          limit: quota.limit,
          upgrade,
        },
        { status: 402 },
      );
    }
  }

  // Get the GitHub access token from the Auth.js JWT (stored in the session)
  const token = (session as unknown as Record<string, unknown>).githubAccessToken as string | undefined;
  if (!token) {
    return NextResponse.json(
      { error: "Not connected to GitHub. Sign in with GitHub first." },
      { status: 401 }
    );
  }

  let body: {
    domain?: string;
    category?: string;
    categories?: string[];
    issueIndex?: number;
    repo?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { domain, repo } = body;
  // Backward compat: single `category` or new `categories` array
  const categories = (
    body.categories && body.categories.length > 0
      ? body.categories
      : body.category
        ? [body.category]
        : []
  ).filter((c, i, arr) => arr.indexOf(c) === i);
  if (!domain || categories.length === 0 || !repo || !repo.includes("/")) {
    return NextResponse.json(
      { error: "Missing required fields: domain, categories, repo (owner/repo)" },
      { status: 400 },
    );
  }

  const unknown = categories.filter((c) => !FIX_PLANS[c]);
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `No automated fix available for: ${unknown.join(", ")}` },
      { status: 400 },
    );
  }

  const [owner, repoName] = repo.split("/");

  try {
    // 1. Get the audit result (cache or re-run)
    const audit = (await getCachedAudit(domain)) || (await runAudit(domain));

    // 2. Find the base branch
    const base = await getDefaultBranch(token, owner, repoName);

    // 3. Compute changes for each category before creating any branch
    const sitemapUrls = await fetchSitemapUrls(audit.url);
    const changes: {
      category: string;
      plan: FixPlan;
      targetPath: string;
      fixed: string;
      currentFile: { content: string; sha: string } | null;
    }[] = [];
    const skipped: string[] = [];

    for (const category of categories) {
      const plan = FIX_PLANS[category];
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
      const fixed = plan.generate(currentFile?.content ?? null, audit, sitemapUrls);
      if (currentFile && currentFile.content === fixed) {
        skipped.push(category);
        continue;
      }
      changes.push({ category, plan, targetPath, fixed, currentFile });
    }

    if (changes.length === 0) {
      return NextResponse.json(
        { error: "All files already look correct — no changes needed." },
        { status: 409 },
      );
    }

    // 4. Create one branch for all fixes
    const branchName = `llmscore/fixes-${Date.now()}`;
    await createBranch(token, owner, repoName, branchName, base.sha);

    // 5. Commit each fix to the same branch. Multiple categories can target
    // the same file (e.g. index.html): chain content and re-fetch the sha
    // from the branch so commits stack correctly.
    const committedPaths = new Set<string>();
    for (const ch of changes) {
      let content = ch.fixed;
      let sha = ch.currentFile?.sha;
      if (committedPaths.has(ch.targetPath)) {
        const latest = await getFile(token, owner, repoName, ch.targetPath, branchName);
        content = ch.plan.generate(latest?.content ?? null, audit, sitemapUrls);
        sha = latest?.sha;
        if (latest && latest.content === content) continue;
      }
      await putFile(token, owner, repoName, ch.targetPath, {
        content,
        message: `${ch.plan.title} (${ch.targetPath})`,
        branch: branchName,
        sha,
      });
      committedPaths.add(ch.targetPath);
    }

    // 6. Open one PR covering all fixes
    const single = changes.length === 1;
    const prTitle = single
      ? changes[0].plan.title
      : `LLMScore: ${changes.length} AI-search fixes for ${audit.domain}`;

    const sections = changes.map((ch) => {
      const issueList = (audit.categories.find((c) => c.key === ch.category)?.issues || [])
        .filter((i) => i.severity !== "pass")
        .map((i) => `- **${i.severity}**: ${i.message}`)
        .join("\n");
      return [
        `## ${ch.plan.title}`,
        "",
        ch.plan.summary,
        "",
        "### Issues found by the audit",
        issueList || "- (see full report)",
        "",
        "### Changed",
        `- \`${ch.targetPath}\` (${ch.currentFile ? "updated" : "created"})`,
      ].join("\n");
    });

    const prBody = [
      ...sections,
      `---`,
      `Generated by [LLMScore](https://llmscore.dev) from an audit of **${audit.domain}** (score: ${audit.overallScore}/100). Review the diff, then merge.`,
    ].join("\n\n");

    const prUrl = await createPullRequest(token, owner, repoName, {
      title: prTitle,
      body: prBody,
      head: branchName,
      base: base.branch,
    });

    if (billingEnabled) {
      await recordPrFix(sessionId, `${repo} ${changes.map((c) => c.category).join(",")}`);
    }
    await trackFixPR(
      domain,
      changes.map((c) => c.category).join(","),
      prUrl,
      session.user.email,
    );

    return NextResponse.json({
      prUrl,
      branch: branchName,
      categories: changes.map((c) => c.category),
      skipped,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fix failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
