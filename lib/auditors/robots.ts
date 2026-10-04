import { CategoryResult, CrawlContext, Issue } from "../types";
import { fetchText } from "../http";
import { finalize } from "./util";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "cohere-ai",
  "Meta-ExternalAgent",
];

type Rule = { agent: string; disallows: string[]; allows: string[] };

function parseRobots(text: string): Rule[] {
  const rules: Rule[] = [];
  let current: Rule[] = [];
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "user-agent") {
      if (!lastWasAgent) current = [];
      const rule: Rule = { agent: value, disallows: [], allows: [] };
      rules.push(rule);
      current.push(rule);
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (field === "disallow") current.forEach((r) => r.disallows.push(value));
      if (field === "allow") current.forEach((r) => r.allows.push(value));
    }
  }
  return rules;
}

function statusFor(bot: string, rules: Rule[]): "allowed" | "blocked" | "default" {
  const specific = rules.filter((r) => r.agent.toLowerCase() === bot.toLowerCase());
  const applicable = specific.length > 0 ? specific : rules.filter((r) => r.agent === "*");
  if (applicable.length === 0) return "default";
  const blockedAll = applicable.some((r) => r.disallows.includes("/")) &&
    !applicable.some((r) => r.allows.includes("/") || r.disallows.every((d) => d === ""));
  if (blockedAll) return specific.length > 0 ? "blocked" : "default";
  return specific.length > 0 ? "allowed" : "default";
}

export async function auditRobots(ctx: CrawlContext): Promise<CategoryResult> {
  const issues: Issue[] = [];
  let score = 100;

  const res = await fetchText(`${ctx.baseUrl}/robots.txt`);
  if (!res || res.status !== 200 || !res.text.trim()) {
    return finalize("AI-crawler robots config", "robots", 40, [
      {
        severity: "warning",
        message: "No robots.txt found - crawlers fall back to permissive defaults",
        fix: "Add a robots.txt that explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and points to your sitemap.",
      },
    ]);
  }

  const rules = parseRobots(res.text);

  // Wildcard full block?
  const wildcard = rules.filter((r) => r.agent === "*");
  const wildcardBlocksAll = wildcard.some((r) => r.disallows.includes("/"));
  if (wildcardBlocksAll) {
    score -= 60;
    issues.push({
      severity: "critical",
      message: "robots.txt blocks ALL crawlers with 'User-agent: * / Disallow: /'",
      fix: "Remove the blanket Disallow: / unless this site is intentionally private - it makes you invisible to every AI search engine.",
    });
  }

  const blocked: string[] = [];
  const allowed: string[] = [];
  for (const bot of AI_CRAWLERS) {
    const s = statusFor(bot, rules);
    if (s === "blocked") blocked.push(bot);
    if (s === "allowed") allowed.push(bot);
  }

  const importantBlocked = blocked.filter((b) =>
    ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"].includes(b)
  );
  if (importantBlocked.length > 0) {
    score -= Math.min(50, importantBlocked.length * 15);
    issues.push({
      severity: "critical",
      message: `Major AI crawlers explicitly blocked: ${importantBlocked.join(", ")}`,
      fix: `Remove the Disallow rules for ${importantBlocked.join(", ")} unless blocking AI answers is intentional - these bots power ChatGPT, Claude and Perplexity citations.`,
    });
  }
  const minorBlocked = blocked.filter((b) => !importantBlocked.includes(b));
  if (minorBlocked.length > 0) {
    issues.push({
      severity: "warning",
      message: `Other AI-related crawlers blocked: ${minorBlocked.join(", ")}`,
      fix: "Review whether blocking these crawlers is intentional (Bytespider/CCBot are often blocked deliberately).",
    });
    score -= Math.min(10, minorBlocked.length * 3);
  }
  if (blocked.length === 0) {
    issues.push({ severity: "pass", message: "No AI crawlers are blocked", fix: "" });
  }
  if (allowed.length > 0) {
    issues.push({ severity: "pass", message: `Explicit rules present for: ${allowed.join(", ")}`, fix: "" });
  }

  // Sitemap directive
  if (!/^sitemap\s*:/im.test(res.text)) {
    score -= 10;
    issues.push({
      severity: "warning",
      message: "No Sitemap: directive in robots.txt",
      fix: "Add 'Sitemap: https://yourdomain.com/sitemap.xml' to robots.txt so crawlers find your sitemap.",
    });
  } else {
    issues.push({ severity: "pass", message: "Sitemap directive present", fix: "" });
  }

  return finalize("AI-crawler robots config", "robots", score, issues);
}
