/** Add AI crawler allow rules to robots.txt (preserving existing content). */

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export function fixRobots(current: string | null, sitemapUrl?: string): string {
  const existing = (current || "").trimEnd();
  const blocks: string[] = [];

  const missing = AI_CRAWLERS.filter(
    (bot) => !new RegExp(`user-agent:\\s*${bot}`, "i").test(existing)
  );

  for (const bot of missing) {
    blocks.push(`User-agent: ${bot}\nAllow: /`);
  }

  let out = existing;
  if (blocks.length > 0) {
    out +=
      (out ? "\n\n" : "") +
      "# AI crawlers — allow (added by LLMScore)\n" +
      blocks.join("\n\n");
  }
  if (!existing) {
    out = "User-agent: *\nAllow: /\n\n" + out;
  }
  if (sitemapUrl && !/sitemap:/i.test(out)) {
    out += `\n\nSitemap: ${sitemapUrl}`;
  }
  return out.trimEnd() + "\n";
}
