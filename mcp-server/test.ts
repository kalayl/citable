/**
 * Simple smoke test for the LLMScore MCP server tools.
 * Runs each tool handler via an in-memory client/server pair.
 *
 * Run with: npx tsx mcp-server/test.ts [url]
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "./tools";

const URL_ARG = process.argv[2] || "example.com";

function printResult(label: string, res: any) {
  console.log(`\n=== ${label} ===`);
  for (const item of res.content ?? []) {
    if (item.type === "text") {
      try {
        console.log(JSON.stringify(JSON.parse(item.text), null, 2).slice(0, 2000));
      } catch {
        console.log(item.text.slice(0, 2000));
      }
    }
  }
  if (res.isError) console.log("(returned as error)");
}

async function main() {
  const server = new McpServer({ name: "llmscore", version: "0.1.0" });
  registerTools(server);

  const client = new Client({ name: "llmscore-test", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  const tools = await client.listTools();
  console.log("Tools:", tools.tools.map((t) => t.name).join(", "));

  const audit = await client.callTool({
    name: "llmscore_audit",
    arguments: { url: URL_ARG },
  });
  printResult(`llmscore_audit(${URL_ARG})`, audit);

  const category = await client.callTool({
    name: "llmscore_category",
    arguments: { url: URL_ARG, category: "llms-txt" },
  });
  printResult(`llmscore_category(${URL_ARG}, llms-txt)`, category);

  const fix = await client.callTool({
    name: "llmscore_fix",
    arguments: { url: URL_ARG, category: "llms-txt", issueIndex: 0 },
  });
  printResult(`llmscore_fix(${URL_ARG}, llms-txt, 0)`, fix);

  await client.close();
  console.log("\nAll tool calls completed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
