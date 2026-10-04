# LLMScore (citable)

Free AI-search readiness audit for any website, with paid fix delivery via GitHub PRs.

## Features

- **Free audit** — `POST /api/audit { url }` crawls a site and scores 9 categories (llms.txt, JSON-LD, robots, sitemap, canonicals, OG cards, extractability, internal links, llms-full).
- **GitHub PR fixes (paywall)** — connect GitHub, pick a repo, and LLMScore opens a PR with the fix. Free audit; $29/mo for automatic PR fixes (early access: free everything).

## GitHub integration

1. `GET /api/auth/github` — redirects to GitHub OAuth consent (scopes: `repo`, `user:email`).
2. `GET /api/auth/github/callback` — exchanges the code for a token and stores it in an httpOnly cookie (`gh_token`).
3. `GET /api/github/repos` — lists the connected user's public repos.
4. `POST /api/fix { domain, category, repo }` — fetches the audit, generates the fixed file (llms.txt, robots.txt, sitemap.xml, or HTML head tags), creates a branch `llmscore/fix-{category}-{timestamp}`, commits, and opens a PR. Returns `{ prUrl }`.

Fix generators live in `lib/fixes/` (one per category). All GitHub API calls use plain `fetch()` — no octokit.

## Environment variables

Create a GitHub **OAuth App** (Settings → Developer settings → OAuth Apps) with callback URL `https://<your-domain>/api/auth/github/callback`, then set:

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Placeholders are in `.env.local`.

## Development

```
npm run dev     # local dev
npm run build   # production build
npm run mcp     # MCP server
```
