import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** Connect the MCP server over stdio (standard for local MCP servers). */
export async function connectStdio(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep the process alive; stdio transport closes when the client disconnects.
  process.stdin.on("close", () => process.exit(0));
}
