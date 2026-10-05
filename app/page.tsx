import Link from "next/link";
import AuditWidget from "@/components/AuditWidget";
import Pricing from "@/components/Pricing";
import AccountMenu from "@/components/AccountMenu";
import HeroSketch from "@/components/HeroSketch";
import { LogoMark } from "@/components/Logo";

/* ================================================================
   Clean-sheet landing page.
   Principles: one job per section, scale-driven hierarchy,
   progressive disclosure, evidence over claims, restraint.
   ================================================================ */

/* ---------- small building blocks ---------- */

function CodePanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sketch-card overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 font-mono text-xs text-gray-500">
        {label}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-gray-700">
        {children}
      </pre>
    </div>
  );
}

function Annotation({ children }: { children: React.ReactNode }) {
  return <p className="font-hand text-lg text-accent-600">{children}</p>;
}

/* ---------- page ---------- */

export default function Home() {
  return (
    <main>
      {/* ============================================================
          1. HERO — the question. Near-full viewport, no nav, no clutter.
          ============================================================ */}
      <section
        id="top"
        className="relative flex min-h-[92vh] flex-col justify-center border-b border-gray-200"
      >
        <div className="absolute left-0 right-0 top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2.5">
              <LogoMark size={20} />
              <span className="font-sans text-base font-semibold text-gray-900">
                LLMScore
              </span>
            </div>
            <AccountMenu />
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Annotation>auditing sites in early access</Annotation>
              <h1 className="mt-4 font-sans text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-[4rem] lg:leading-[1.05]">
                Your SEO tool doesn&apos;t check{" "}
                <span className="sketch-underline text-accent-600">AI search</span>.
                We do.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-500">
                LLMScore audits your site the way ChatGPT, Perplexity and
                Google AI see it — then opens the PRs that fix it.
              </p>
              <div className="mt-10">
                <AuditWidget />
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroSketch />
            </div>
          </div>
        </div>
        {/* scroll indicator */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-300"
          aria-hidden="true"
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <path
              d="M10 4 C 9.5 11, 10.5 17, 10 23"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M5 18 C 7 20.5, 8.5 22.5, 10 24 C 11.5 22.5, 13 20.5, 15 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================
          1.5 WORKFLOW — schematic: URL → Audit → Score → Fixes → PR
          ============================================================ */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="flex flex-col items-center justify-center gap-4 font-mono text-sm sm:flex-row sm:gap-0">
            {[
              { label: "URL", sub: "your site" },
              { label: "Audit", sub: "9 checks" },
              { label: "Score", sub: "0\u2013100" },
              { label: "Fixes", sub: "ranked" },
              { label: "PR", sub: "on GitHub" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="sketch-border-soft bg-white px-5 py-3 text-center">
                  <p className="font-semibold text-gray-900">{step.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{step.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <span
                    className="mx-3 hidden text-accent-600 sm:inline"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. THE SHIFT — one statistic. Nothing else.
          ============================================================ */}
      <section className="border-b border-gray-200 bg-paper-deep/60">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
          <p className="font-sans text-[6rem] font-bold leading-none tracking-tight text-gray-900 sm:text-[8rem]">
            47<span className="text-accent-600">%</span>
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
            of Google searches now surface an AI Overview. When the AI answers,
            it cites three to five sources — not ten blue links. Everyone else
            is invisible.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            <a
              href="https://www.semrush.com/blog/ai-overviews-study/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-gray-300 underline-offset-4 transition hover:text-gray-600"
            >
              Semrush AI Overviews study, 2025
            </a>
          </p>
        </div>
      </section>

      {/* ============================================================
          3. WHAT IT CHECKS — three deep, six shallow.
          ============================================================ */}
      <section id="checks" className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Annotation>nine checks · three matter most</Annotation>
          <h2 className="mt-3 max-w-2xl font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The layer traditional SEO tools don&apos;t see.
          </h2>

          <div className="mt-16 space-y-20">
            {/* 1 — llms.txt */}
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <div>
                <p className="font-hand text-xl text-accent-600">no. 1</p>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                  llms.txt &amp; llms-full.txt
                </h3>
                <p className="mt-3 leading-relaxed text-gray-500">
                  The front door for AI crawlers. LLMScore validates that it
                  exists, every URL resolves, counts match your live pages, and
                  nothing is stale or duplicated.
                </p>
              </div>
              <CodePanel label="example-saas.com/llms.txt — 3 issues found">
{`# Example SaaS
> B2B workflow automation

## Docs
- [Getting started](/docs/start)
`}<span className="bg-red-50 text-red-600">{`- [API reference](/docs/api-v1)   ← 404 (moved to /docs/api)`}</span>{`
- [Webhooks](/docs/webhooks)
`}<span className="bg-red-50 text-red-600">{`- [Webhooks](/docs/webhooks)      ← duplicate entry`}</span>{`
`}<span className="bg-amber-50 text-amber-700">{`# last updated 2025-03-02        ← 19 months stale`}</span>
              </CodePanel>
            </div>

            {/* 2 — JSON-LD */}
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <div>
                <p className="font-hand text-xl text-accent-600">no. 2</p>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                  JSON-LD for AI extraction
                </h3>
                <p className="mt-3 leading-relaxed text-gray-500">
                  Not just &quot;is schema present?&quot; — will an LLM extract a
                  clean answer? FAQPage, Breadcrumbs, Organization, Product,
                  HowTo, and whether the schema matches what&apos;s actually on
                  the page.
                </p>
              </div>
              <CodePanel label="/pricing — FAQPage schema, 2 issues">
{`{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How much does it cost?",
`}<span className="bg-red-50 text-red-600">{`    "acceptedAnswer": undefined   ← answer missing`}</span>{`
  }]
`}<span className="bg-amber-50 text-amber-700">{`}                                 ← page has 6 FAQs, schema has 1`}</span>
              </CodePanel>
            </div>

            {/* 3 — robots */}
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <div>
                <p className="font-hand text-xl text-accent-600">no. 3</p>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                  AI-crawler robots config
                </h3>
                <p className="mt-3 leading-relaxed text-gray-500">
                  A robots.txt copied from a template in 2023 is quietly costing
                  you citations today. GPTBot, ClaudeBot, PerplexityBot, CCBot,
                  Google-Extended — blocked by accident on most sites we audit.
                </p>
              </div>
              <CodePanel label="robots.txt — blocking the answer engines">
{`User-agent: GPTBot
`}<span className="bg-red-50 text-red-600">{`Disallow: /                       ← ChatGPT can't read a single page`}</span>{`

User-agent: CCBot
`}<span className="bg-red-50 text-red-600">{`Disallow: /                       ← neither can most AI training crawls`}</span>{`

User-agent: PerplexityBot
`}<span className="bg-emerald-50 text-emerald-700">{`Allow: /                          ← fix: intentional, scoped access`}</span>
              </CodePanel>
            </div>
          </div>

          {/* remaining six — plain list, restraint */}
          <div className="mt-20 border-t border-gray-200 pt-10">
            <p className="font-hand text-lg text-gray-400">plus six more:</p>
            <ul className="mt-5 grid gap-x-12 gap-y-3 text-[15px] text-gray-500 sm:grid-cols-2">
              <li><span className="text-gray-800">Content extractability</span> — question-based H2s, TL;DR blocks</li>
              <li><span className="text-gray-800">Sitemap completeness</span> — missing pages, orphans</li>
              <li><span className="text-gray-800">Canonical coverage</span> — parameter and UTM risks</li>
              <li><span className="text-gray-800">OG / Twitter cards</span> — present and consistent everywhere</li>
              <li><span className="text-gray-800">Internal linking</span> — key pages within 2 clicks</li>
              <li><span className="text-gray-800">Schema-content alignment</span> — structured data matches the page</li>
            </ul>
          </div>

          {/* learn more about each check */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <p className="font-hand text-lg text-accent-600">
              learn more about each check:
            </p>
            <ul className="mt-5 grid gap-x-12 gap-y-3 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: "/checks/llms-txt", label: "What is llms.txt?" },
                { href: "/checks/llms-full-txt", label: "llms-full.txt explained" },
                { href: "/checks/json-ld", label: "JSON-LD for AI extraction" },
                { href: "/checks/robots", label: "AI crawler robots config" },
                { href: "/checks/extractability", label: "Content extractability" },
                { href: "/checks/sitemap", label: "Sitemap completeness" },
                { href: "/checks/canonicals", label: "Canonical coverage" },
                { href: "/checks/og-cards", label: "OG / Twitter cards" },
                { href: "/checks/internal-links", label: "Internal linking" },
              ].map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-accent-600"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. HOW IT WORKS — horizontal flow, three distinct visuals.
          ============================================================ */}
      <section id="how" className="border-b border-gray-200 bg-paper-deep/60">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <div className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            <div
              className="absolute left-0 right-0 top-5 hidden h-px bg-gray-300 md:block"
              aria-hidden="true"
            />
            {/* step 1 */}
            <div className="relative">
              <span className="sketch-pill relative z-10 flex h-10 w-10 items-center justify-center bg-white font-hand text-lg font-semibold text-accent-600">
                1
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Enter your URL
              </h3>
              <div className="sketch-border-soft mt-3 flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs text-gray-500">
                <span className="text-gray-300">https://</span>
                yourdomain.com
                <span className="sketch-pill ml-auto bg-accent-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  audit
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                We crawl your pages, llms.txt, robots.txt, sitemaps and
                structured data.
              </p>
            </div>
            {/* step 2 */}
            <div className="relative">
              <span className="sketch-pill relative z-10 flex h-10 w-10 items-center justify-center bg-white font-hand text-lg font-semibold text-accent-600">
                2
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Get your score
              </h3>
              <div className="sketch-border-soft mt-3 bg-white px-3 py-2">
                <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-500" />
                  checking 9 categories…
                </div>
                <div className="ink-bar mt-2 h-1 overflow-hidden bg-gray-100">
                  <div className="ink-bar h-full w-2/3 bg-accent-100" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                A 0–100 readiness score with every issue documented, in under a
                minute.
              </p>
            </div>
            {/* step 3 */}
            <div className="relative">
              <span className="sketch-pill relative z-10 flex h-10 w-10 items-center justify-center bg-white font-hand text-lg font-semibold text-accent-600">
                3
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Ship the fixes
              </h3>
              <div className="sketch-border-soft mt-3 space-y-1.5 bg-white px-3 py-2 font-mono text-xs">
                <p className="text-emerald-700">✓ PR #42 — add llms-full.txt</p>
                <p className="text-emerald-700">✓ PR #43 — fix 14 stale URLs</p>
                <p className="text-gray-400">○ PR #44 — unblock PerplexityBot</p>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Connect GitHub and LLMScore opens the pull requests for you,
                ranked by impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. SAMPLE REPORT — the proof.
          ============================================================ */}
      <section id="report" className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Annotation>a real report, not a mockup of one</Annotation>
          <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Every issue explained. Every fix ranked by impact.
          </h2>

          <div className="sketch-card mt-12 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="sketch-pill ml-3 flex-1 truncate bg-white px-3 py-1 text-xs text-gray-400">
                llmscore.io/report/meridianpayroll.com
              </span>
            </div>
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
              {/* left: gauge + top fixes */}
              <div>
                <p className="font-hand text-base text-gray-500">
                  meridianpayroll.com · 340 pages crawled · 41s
                </p>
                <div className="mt-5 flex items-center gap-6">
                  <svg width="130" height="130" viewBox="0 0 120 120" aria-hidden="true">
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke="#E0D6C2" strokeWidth="3" strokeDasharray="4 5"
                    />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke="#55724E" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${0.64 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="58" textAnchor="middle" className="fill-gray-900"
                      fontSize="30" fontWeight="600" fontFamily="var(--font-sans)">
                      64
                    </text>
                    <text x="60" y="78" textAnchor="middle" className="fill-gray-400"
                      fontSize="12" fontFamily="var(--font-hand)">
                      of 100
                    </text>
                  </svg>
                  <div className="text-sm text-gray-500">
                    <p><span className="font-medium text-red-500">3 critical</span></p>
                    <p><span className="font-medium text-amber-600">4 warnings</span></p>
                    <p><span className="font-medium text-emerald-600">2 passing</span></p>
                  </div>
                </div>
                <div className="sketch-border-soft mt-6 bg-gray-50 p-4">
                  <p className="font-hand text-base text-accent-600">
                    Top fixes by impact
                  </p>
                  <ol className="mt-3 space-y-2.5 text-sm text-gray-600">
                    <li>
                      <span className="mr-2 font-hand text-base font-medium text-accent-600">1.</span>
                      Create llms-full.txt — 212 of 340 indexable pages are
                      invisible to AI crawlers that use it.
                    </li>
                    <li>
                      <span className="mr-2 font-hand text-base font-medium text-accent-600">2.</span>
                      Fix stale llms.txt — 14 URLs 404, 9 duplicates.
                    </li>
                    <li>
                      <span className="mr-2 font-hand text-base font-medium text-accent-600">3.</span>
                      Unblock PerplexityBot in robots.txt — currently denied
                      site-wide.
                    </li>
                  </ol>
                </div>
              </div>
              {/* right: category breakdown */}
              <div className="space-y-4">
                {[
                  { name: "llms.txt", score: 40, note: "14 URLs return 404 · 9 duplicate entries · last updated 19 months ago" },
                  { name: "llms-full.txt", score: 35, note: "Missing entirely — 212 of 340 indexable pages unreachable via llms-full" },
                  { name: "JSON-LD", score: 75, note: "FAQPage present on 12 pages · HowTo missing on 6 tutorial pages" },
                  { name: "AI-crawler robots", score: 60, note: "PerplexityBot blocked site-wide · GPTBot allowed · CCBot not addressed" },
                  { name: "Extractability", score: 55, note: "4 of 20 top pages have question-based H2s · no TL;DR blocks found" },
                  { name: "Sitemap", score: 85, note: "3 indexable pages missing · 7 orphans present only in sitemap" },
                  { name: "Canonicals", score: 90, note: "UTM parameter risk on 2 templates · otherwise complete" },
                  { name: "OG / Twitter cards", score: 70, note: "og:image missing on 31 blog posts · titles consistent" },
                ].map((c) => (
                  <div key={c.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="font-mono tabular-nums text-gray-500">{c.score}</span>
                    </div>
                    <div className="ink-bar mt-1.5 h-1.5 overflow-hidden bg-gray-100">
                      <div
                        className={`ink-bar h-full origin-left animate-bar-grow ${
                          c.score >= 80
                            ? "bg-emerald-600"
                            : c.score >= 60
                              ? "bg-amber-400"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. GITHUB — the paywall. One mock PR, one CTA.
          ============================================================ */}
      <section id="github" className="border-b border-gray-200 bg-paper-deep/60">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Annotation>from audit to merged, automatically</Annotation>
              <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Connect your repo. LLMScore opens PRs with the fixes.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-gray-500">
                The audit is free. Connect GitHub and LLMScore turns each fix
                into a pull request — branch, commit, description — ready for
                review.
              </p>
              <p className="mt-5 text-sm text-gray-500">
                Free audit. <span className="text-gray-800">$29/mo</span> for
                automatic PR fixes.
              </p>
              <a
                href="#top"
                className="sketch-btn mt-7 inline-block bg-accent-600 px-6 py-3 text-sm font-medium text-white"
              >
                Connect GitHub
              </a>
            </div>
            {/* mock PR */}
            <div className="sketch-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                meridian/website · pull request #42
              </div>
              <div className="p-5">
                <p className="text-[15px] font-semibold text-gray-900">
                  fix(seo): add llms-full.txt covering all 340 indexable pages
                </p>
                <p className="mt-1 font-mono text-xs text-gray-400">
                  llmscore/add-llms-full-txt → main
                </p>
                <div className="sketch-border-soft mt-4 bg-gray-50 p-3 text-sm text-gray-600">
                  <p>
                    LLMScore audit found 212 of 340 indexable pages unreachable
                    by AI crawlers that read llms-full.txt. This PR generates it
                    from the live sitemap, grouped by section.
                  </p>
                </div>
                <div className="mt-4 font-mono text-xs">
                  <p className="text-gray-500">1 file changed</p>
                  <p className="mt-1.5 text-emerald-700">+ public/llms-full.txt (+412 lines)</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="sketch-pill bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                    ✓ checks passing
                  </span>
                  <span className="text-gray-400">opened by llmscore-bot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. PRICING — four tiers. The score is free, the fix is the product.
          ============================================================ */}
      <Pricing />

      {/* ============================================================
          7b. FINAL CTA
          ============================================================ */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <p className="font-sans text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            The score is free. The fix is the product.
          </p>
          <p className="mt-3 font-hand text-xl text-accent-600">
            early access: everything free
          </p>
          <a
            href="#top"
            className="sketch-btn mt-8 inline-block bg-accent-600 px-7 py-3 text-sm font-medium text-white"
          >
            Get your score
          </a>
        </div>
      </section>

      {/* ============================================================
          8. FOOTER — minimal.
          ============================================================ */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-gray-400 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={18} />
          <span>LLMScore — AI search readiness audits</span>
        </div>
        <p>© {new Date().getFullYear()} LLMScore</p>
      </footer>
    </main>
  );
}
