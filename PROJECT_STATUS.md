# LLMScore — Project Status & Delivery Plan

_Last reviewed: 2026-10-05_

LLMScore (repo: `citable`, domain: llmscore.io) is an AI-search readiness audit tool: enter a URL, get a 0–100 score across 9 categories with ranked fixes, optional GitHub PR auto-fixes, credits/subscription monetisation, and an MCP server.

---

## 1. What's Built

### Landing page — ✅ solid
- `app/page.tsx` (520 lines): hero with animated hand-drawn `HeroSketch` audit animation, live `AuditWidget` wired to the real API, category explanation sections, pricing, auth-aware header (`AccountMenu`/`AuthButtons`).
- Clean-sheet redesign done (commit `cb4a378`), hand-drawn sketch branding (`d1a7227`). Tailwind + custom `Logo.tsx`.

### Audit engine — ✅ complete, the core asset
- `lib/audit.ts`: orchestrator with sitemap-aware crawl (homepage + up to 9 sample pages, spread-sampled), weighted scoring, 30s timeout, 1h in-memory cache, top-5 ranked fixes.
- **All 9 auditors implemented and substantive** (~900 lines total): llms-txt, llms-full, json-ld, robots (AI-crawler aware), extractability, sitemap, canonicals, og-cards, internal-links.
- API: `POST /api/audit` (runs audit, free-audit gating via anon session cookie) + `GET /api/audit/[domain]` (cached fetch).

### Report page — ✅ works
- `app/report/[domain]/page.tsx` + `ReportView.tsx` (223 lines): overall score, per-category breakdown with issues/severity/fixes, top fixes, GitHubConnect panel for auto-fixable categories.

### Auth — ⚠️ scaffolded, weak
- NextAuth v5 (JWT sessions, no DB). GitHub + Google providers conditionally registered (both placeholder creds → currently inactive).
- **Fallback Credentials provider accepts any email — no verification.** This is the only working sign-in path today.
- `lib/pin.ts`: complete in-memory email PIN implementation (6-digit, TTL, attempt limits, timing-safe compare) — **built but not wired into the sign-in flow**, and Resend key is a placeholder so emails can't send anyway.
- Custom lightweight middleware (cookie presence check) because NextAuth edge middleware crashed with placeholder creds.

### GitHub integration — ✅ code-complete, blocked on OAuth creds
- `lib/github.ts` (158 lines): repo listing, branch/commit/PR creation via user's OAuth token (`repo` scope).
- `app/api/fix/route.ts` (218 lines): generates fixes from audit results and opens PRs.
- `lib/fixes/*`: 6 fix generators (llms-txt, robots, sitemap, json-ld, canonical, og-cards).
- `GitHubConnect.tsx`: connect flow, repo picker, per-category "Fix" buttons with PR links.
- **Everything is real code; it just needs a GitHub OAuth app.**

### Stripe payments — ✅ code-complete, blocked on account
- `lib/stripe.ts`: graceful degradation — no key → "early access, everything free" mode.
- Checkout, portal, and webhook routes exist; credit packs ($10/$40/$100) + $29/mo Pro subscription in `Pricing.tsx`.
- All keys/price IDs are placeholders.

### Credits system — ✅ works (file-backed)
- `lib/credits.ts` (183 lines): JSON file store (`data/credits.json`), anon session cookie, free-audit-per-domain tracking, transactions ledger, subscription state, Stripe customer lookup.
- Serialised writes, atomic rename. Fine for a single long-lived server; **not durable on Vercel serverless** (ephemeral filesystem).

### MCP server — ✅ works
- `mcp-server/` (~550 lines): stdio server with `llmscore_audit`, `llmscore_category`, `llmscore_fix` tools, audit client, test script (`npm run mcp:test`).

### SEO/LLM files — ✅ dogfooded
- `public/llms.txt`, `llms-full.txt`, `robots.txt` (all AI crawlers explicitly allowed), `app/sitemap.ts`, `og.png`, favicon.
- Sitemap has only 2 URLs (/, /signin) — hurts own internal-linking/sitemap scores.

---

## 2. What's Missing / Broken

| Issue | Severity | Detail |
|---|---|---|
| GitHub OAuth creds | 🔴 Blocker | Placeholders — GitHub sign-in + PR fixes dead |
| Google OAuth creds | 🟠 | Placeholders — Google sign-in dead |
| Stripe account | 🟠 | Placeholders — payments disabled (intentional early-access mode) |
| Resend domain + key | 🟠 | `noreply@llmscore.dev` unverified, placeholder key — no email sending |
| Email auth = no verification | 🔴 Security | Credentials provider accepts any email string; PIN code exists but isn't wired in |
| No database | 🔴 Architecture | Credits in JSON file, PINs/audit cache in memory — all lost on serverless cold start; credits won't work reliably on Vercel |
| No rate limiting | 🟠 | `/api/audit` is unauthenticated and uncapped — abuse/SSRF-adjacent risk |
| Audit cache in-memory only | 🟡 | Re-crawls on every cold start |
| Own internal-linking score ~10/100 | 🟡 | Only 2 pages; needs content pages (docs, blog, category explainers) |
| llms-full.txt coverage gap | 🟡 | Only 3 entries |
| No analytics (PostHog) | 🟡 | Zero visibility into funnel |
| No error tracking (Sentry) | 🟡 | Silent production failures |
| No tests | 🟡 | No unit or e2e tests anywhere |

---

## 3. Delivery Plan

### ✅ Ready to ship now
- Landing page, audit engine (all 9 auditors), report pages, MCP server, SEO/LLM files.
- "Early access — everything free" positioning already built in; **the free audit tool is launchable today** with email sign-in disabled or clearly labelled.

### 🔑 Needs credentials (Sven, ~1–2 hrs total)
1. **GitHub OAuth app** (github.com/settings/developers) → unlocks sign-in + the PR-fix differentiator. Highest value.
2. **Resend**: verify llmscore.io (or .dev) domain, real API key → unlocks email PIN flow.
3. **Google OAuth** (Cloud Console) → secondary sign-in.
4. **Stripe**: account + 4 products/prices + webhook endpoint → unlocks revenue (can wait until post-launch given early-access-free positioning).
5. Set all of the above in Vercel env vars + rotate `AUTH_SECRET`.

### 🛠 Needs engineering (priority order)
1. **Wire PIN flow into auth** (~half day): send PIN via Resend in a `/api/auth/pin` route, verify in the Credentials provider. Kills the accept-any-email hole. (Requires Resend creds; requires DB or KV for PIN storage on serverless — see infra.)
2. **Rate-limit `/api/audit`** (~2 hrs): per-IP token bucket (Upstash Ratelimit or Vercel KV).
3. **Expand site content** (~1 day): 9 category explainer pages → fixes own sitemap/internal-links/llms-full scores and gives SEO surface.
4. **Basic e2e smoke test** (~half day): Playwright — audit a known domain, render report.

### 🏗 Needs infrastructure
1. **Database** — single biggest architectural gap. Recommend Vercel Postgres or Turso + Drizzle: migrate credits store, PIN store, audit result cache, and add NextAuth adapter (enables proper Resend magic-link provider). ~1–2 days.
2. **PostHog** (~1 hr): funnel events — audit started/completed, sign-in, GitHub connect, fix PR opened.
3. **Sentry** (~1 hr): error tracking on API routes + client.
4. **Durable audit cache** (comes free with DB): persist results, enables score-history/re-audit-diff features later.

### 💡 Nice to have
- Score history + change tracking per domain
- Scheduled re-audits with email alerts (needs cron + DB)
- Competitor comparison ("you vs. them")
- Badge/embed ("LLMScore 87") for audited sites
- Public leaderboard of audited domains
- Team accounts
- Hosted MCP server (remote transport) for ChatGPT/Claude integration

### Suggested sequence
**Week 1:** GitHub OAuth + Resend creds → DB migration → wire PIN auth → rate limiting → PostHog/Sentry → soft launch (free early access).
**Week 2:** Content pages (dogfood own score to 90+), e2e tests, Stripe setup → enable payments → public launch.

---

## Bottom line
The product core — audit engine, report UX, PR-fix pipeline, MCP server — is **genuinely built, not stubbed** (~4,800 lines of real code). What stands between this and launch is almost entirely: (a) third-party credentials only Sven can create, and (b) a database to make auth and credits production-safe. Engineering gap to a credible public launch: roughly **3–5 focused days** once credentials exist.
