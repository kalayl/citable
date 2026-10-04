# LLMScore MCP Server

Expose the LLMScore audit as [Model Context Protocol](https://modelcontextprotocol.io) tools so Claude, ChatGPT, Cursor, Windsurf or any MCP-compatible client can audit a site's AI-readiness directly from chat.

## Tools

| Tool | Input | Output |
|------|-------|--------|
| `llmscore_audit` | `{ url }` | Full audit: domain, overallScore, per-category scores/issues/fixes, topFixes, crawledAt |
| `llmscore_category` | `{ url, category }` | Single category: name, score, issues, topFixes |
| `llmscore_fix` | `{ url, category, issueIndex }` | Detailed fix: severity, message, fix, codeExample/before/after when available |

Categories: `llms-txt`, `llms-full`, `json-ld`, `robots`, `extractability`, `sitemap`, `canonicals`, `og-cards`, `internal-links`.

## Running

```bash
npm install
npx tsx mcp-server/index.ts   # or: npm run mcp
```

The server speaks MCP over stdio. If a local LLMScore API is running (`npm run dev`), audits route through `POST /api/audit`; otherwise the server runs the audit directly. Set `LLMSCORE_API_URL` to point at a deployed API.

## Client setup

### Claude Desktop

`~/.config/claude/claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "llmscore": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/citable/mcp-server/index.ts"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` globally):

```json
{
  "mcpServers": {
    "llmscore": {
      "command": "npx",
      "args": ["tsx", "mcp-server/index.ts"]
    }
  }
}
```

### Generic MCP client

Any client that supports stdio MCP servers:

```json
{"mcpServers":{"llmscore":{"command":"npx","args":["tsx","mcp-server/index.ts"]}}}
```

Optionally add `"env": {"LLMSCORE_API_URL": "https://llmscore.io"}` to use the hosted API.

## Testing

```bash
npm run mcp:test            # audits example.com via an in-memory client
npx tsx mcp-server/test.ts yoursite.com
```
