import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CATEGORY_KEYS,
  runCategoryAudit,
  runFullAudit,
  type CategoryKey,
} from "./audit-client";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
  };
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "llmscore_audit",
    {
      title: "LLMScore full audit",
      description:
        "Run a full LLMScore audit on a URL. Scores how well a site is optimized for AI assistants and LLM crawlers across 9 categories (llms.txt, JSON-LD, robots, extractability, sitemap, canonicals, OG cards, internal links). Returns per-category scores, issues and prioritized fixes.",
      inputSchema: {
        url: z.string().describe("The site URL or domain to audit, e.g. example.com"),
      },
    },
    async ({ url }) => {
      try {
        const result = await runFullAudit(url);
        return jsonResult({
          domain: result.domain,
          overallScore: result.overallScore,
          categories: result.categories.map((c) => ({
            name: c.name,
            key: c.key,
            score: c.score,
            issues: c.issues,
            topFixes: c.topFixes,
          })),
          topFixes: result.topFixes,
          crawledAt: result.crawledAt,
        });
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "llmscore_category",
    {
      title: "LLMScore single-category audit",
      description:
        "Run a single LLMScore category audit on a URL. Categories: " +
        CATEGORY_KEYS.join(", "),
      inputSchema: {
        url: z.string().describe("The site URL or domain to audit"),
        category: z
          .enum(CATEGORY_KEYS)
          .describe("Which audit category to run"),
      },
    },
    async ({ url, category }) => {
      try {
        const result = await runCategoryAudit(url, category as CategoryKey);
        return jsonResult({
          name: result.name,
          key: result.key,
          score: result.score,
          issues: result.issues,
          topFixes: result.topFixes,
        });
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "llmscore_fix",
    {
      title: "LLMScore fix instructions",
      description:
        "Get detailed fix instructions for a specific issue found by an LLMScore category audit. Run llmscore_category first to see the issue list; issueIndex is the 0-based index into that list.",
      inputSchema: {
        url: z.string().describe("The site URL or domain"),
        category: z.enum(CATEGORY_KEYS).describe("The audit category"),
        issueIndex: z
          .number()
          .int()
          .min(0)
          .describe("0-based index of the issue within the category's issues array"),
      },
    },
    async ({ url, category, issueIndex }) => {
      try {
        const result = await runCategoryAudit(url, category as CategoryKey);
        const issue = result.issues[issueIndex];
        if (!issue) {
          return errorResult(
            new Error(
              `No issue at index ${issueIndex} for category "${category}" (found ${result.issues.length} issues)`
            )
          );
        }
        return jsonResult({
          severity: issue.severity,
          message: issue.message,
          fix: issue.fix,
          ...(("codeExample" in issue && (issue as any).codeExample)
            ? { codeExample: (issue as any).codeExample }
            : {}),
          ...(("before" in issue && (issue as any).before)
            ? { before: (issue as any).before }
            : {}),
          ...(("after" in issue && (issue as any).after)
            ? { after: (issue as any).after }
            : {}),
        });
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}
