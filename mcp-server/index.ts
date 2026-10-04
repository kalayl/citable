#!/usr/bin/env node
/**
 * LLMScore MCP server.
 *
 * Exposes llmscore_audit, llmscore_category and llmscore_fix tools over stdio.
 * Run with: npx tsx mcp-server/index.ts
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools";
import { connectStdio } from "./transport";

async function main() {
  const server = new McpServer({
    name: "llmscore",
    version: "0.1.0",
  });

  registerTools(server);
  await connectStdio(server);
  // Log to stderr only - stdout is reserved for the MCP protocol.
  console.error("LLMScore MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error in LLMScore MCP server:", err);
  process.exit(1);
});
