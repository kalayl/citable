import AuditWidget from "@/components/AuditWidget";
import Logo, { LogoMark } from "@/components/Logo";

/* ---------- small inline building blocks ---------- */

function TerminalPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900 font-mono text-[13px] leading-relaxed shadow-xl shadow-gray-200/60">
      <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
        <span className="ml-2 text-xs text-gray-500">llmscore audit — example-saas.com</span>
      </div>
      <div className="px-5 py-4 text-gray-300">
        <p className="text-gray-500">$ llmscore audit example-saas.com</p>
        <p className="mt-2">
          <span className="text-gray-500">→</span> crawling 340 pages… <span className="text-gray-500">done in 41s</span>
        </p>
        <p className="mt-3 text-gray-500">── AI SEARCH READINESS ──────────────</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          64<span className="text-base font-normal text-gray-500">/100</span>
          <span className="ml-3 rounded bg-gray-800 px-2 py-0.5 text-xs font-normal text-amber-300">needs work</span>
        </p>
        <p className="mt-4 text-gray-500">top fixes by impact:</p>
        <p className="mt-1">
          <span className="text-red-400">✗ CRIT</span>{"  "}llms-full.txt missing
          <span className="text-gray-500"> — 212/340 pages invisible to AI crawlers</span>
        </p>
        <p>
          <span className="text-red-400">✗ CRIT</span>{"  "}llms.txt stale
          <span className="text-gray-500"> — 14 URLs return 404, 9 duplicates</span>
        </p>
        <p>
          <span className="text-amber-400">! WARN</span>{"  "}PerplexityBot blocked in robots.txt
          <span className="text-gray-500"> — intentional?</span>
        </p>
        <p className="mt-3 text-gray-600">full report: llmscore.io/report/a8f2…</p>
      </div>
    </div>
  );
}

function CodeBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "bad" | "good";
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div
        className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-medium ${
          tone === "bad"
            ? "border-red-100 bg-red-50 text-red-600"
            : "border-emerald-100 bg-emerald-50 text-emerald-700"
        }`}
      >
        <span>{tone === "bad" ? "✗" : "✓"}</span>
        {title}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-gray-700">
        {children}
      </pre>
    </div>
  );
}

/* ---------- page ---------- */

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" aria-label="LLMScore home">
            <Logo />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-gray-500 sm:flex">
            <a href="#checks" className="transition hover:text-gray-900">
              What it checks
            </a>
            <a href="#how" className="transition hover:text-gray-900">
              How it works
            </a>
            <a href="#report" className="transition hover:text-gray-900">
              Sample report
            </a>
            <a
              href="#top"
              className="rounded-lg bg-accent-500 px-3.5 py-1.5 font-medium text-white transition hover:bg-accent-600"
            >
              Get your score
            </a>
          </nav>
        </div>
      </header>

      {/* Hero — asymmetric */}
      <section id="top" className="border-b border-gray-100">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <span className="mb-6 inline-block rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              Early access — AI search readiness audits
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              What&apos;s your{" "}
              <span className="text-accent-500">LLM score</span>?
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-500">
              ChatGPT, Perplexity and Google AI Overviews are answering your
              customers&apos; questions. LLMScore audits whether your site is
              structured to be the cited source — and tells you exactly what to
              fix.
            </p>
            <div className="mt-8">
              <AuditWidget />
            </div>
          </div>
          <div className="hidden lg:block">
            <TerminalPanel />
          </div>
        </div>
        {/* terminal shown below on small screens */}
        <div className="mx-auto max-w-6xl px-6 pb-16 lg:hidden">
          <TerminalPanel />
        </div>
      </section>

      {/* Why it matters — editorial */}
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-600">
            The shift is already here
          </p>
          <blockquote className="mt-6 max-w-4xl text-3xl font-semibold leading-snug tracking-tight text-gray-900 sm:text-4xl">
            AI Overviews now appear on roughly half of informational Google
            queries. When the AI answers, it cites{" "}
            <span className="text-accent-500">three to five sources</span> — not
            ten blue links.
          </blockquote>
          <p className="mt-6 max-w-2xl text-gray-500">
            Traditional SEO tools don&apos;t check whether your site is readable
            by AI crawlers or structured for AI extraction. If your pages
            can&apos;t be cleanly parsed, summarised and attributed, you&apos;re
            invisible in the answer — no matter how well you rank.
          </p>

          {/* before / after */}
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Then — ten blue links
              </p>
              <div className="mt-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-2.5 w-2/3 rounded bg-accent-100" />
                    <div className="mt-1.5 h-2 w-full rounded bg-gray-100" />
                    <div className="mt-1 h-2 w-5/6 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-gray-500">
                Rank in the top ten and you get seen. Everyone gets a slot.
              </p>
            </div>
            <div className="rounded-xl border border-accent-100 bg-white p-6 ring-1 ring-accent-100">
              <p className="text-xs font-medium uppercase tracking-wider text-accent-600">
                Now — one AI answer
              </p>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="mt-1.5 h-2 w-11/12 rounded bg-gray-200" />
                <div className="mt-1.5 h-2 w-4/5 rounded bg-gray-200" />
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600">
                    source 1
                  </span>
                  <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600">
                    source 2
                  </span>
                  <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600">
                    source 3
                  </span>
                </div>
              </div>
              <p className="mt-5 text-sm text-gray-500">
                The answer is extracted and synthesised. Only the cited sources
                exist. Everyone else is invisible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it checks — grouped, not uniform */}
      <section id="checks" className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            What does LLMScore check?
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            Nine checks across the LLM optimisation layer that sits on top of
            your SEO. Three matter most.
          </p>

          <div className="mt-12 space-y-10">
            {/* Check 1: llms.txt */}
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div>
                <p className="font-mono text-xs text-accent-600">01</p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  llms.txt &amp; llms-full.txt
                </h3>
                <p className="mt-2 text-gray-500">
                  The front door for AI crawlers. LLMScore validates that it
                  exists, every URL resolves, counts match your live pages, and
                  nothing is stale or duplicated.
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 font-mono text-xs text-gray-500">
                  example-saas.com/llms.txt — 3 issues found
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-gray-700">
{`# Example SaaS
> B2B workflow automation

## Docs
- [Getting started](/docs/start)
`}<span className="bg-red-50 text-red-600">{`- [API reference](/docs/api-v1)   ← 404 (moved to /docs/api)`}</span>{`
- [Webhooks](/docs/webhooks)
`}<span className="bg-red-50 text-red-600">{`- [Webhooks](/docs/webhooks)      ← duplicate entry`}</span>{`
`}<span className="bg-amber-50 text-amber-700">{`# last updated 2025-03-02        ← 19 months stale`}</span>
                </pre>
              </div>
            </div>

            {/* Check 2: JSON-LD */}
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div>
                <p className="font-mono text-xs text-accent-600">02</p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  JSON-LD for AI extraction
                </h3>
                <p className="mt-2 text-gray-500">
                  Not just &quot;is schema present?&quot; — will an LLM extract
                  a clean answer? FAQPage, Breadcrumbs, Organization, Product,
                  Article, HowTo, and whether the schema matches what&apos;s
                  actually on the page.
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 font-mono text-xs text-gray-500">
                  /pricing — FAQPage schema, 2 issues
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-gray-700">
{`{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How much does it cost?",
`}<span className="bg-red-50 text-red-600">{`    "acceptedAnswer": undefined   ← answer missing`}</span>{`
  }]
`}<span className="bg-amber-50 text-amber-700">{`}                                 ← page has 6 FAQs, schema has 1`}</span>
                </pre>
              </div>
            </div>

            {/* Check 3: extractability */}
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div>
                <p className="font-mono text-xs text-accent-600">03</p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  Content extractability
                </h3>
                <p className="mt-2 text-gray-500">
                  Question-based H2s, TL;DR blocks, concise openings. Can an LLM
                  lift a clean, attributable answer from your page — or does it
                  have to guess?
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 font-mono text-xs text-gray-500">
                  /blog/workflow-automation — extractability 55/100
                </div>
                <div className="space-y-2 p-4 font-mono text-[12.5px] leading-relaxed">
                  <p className="text-red-600">
                    ✗ H2 &quot;Our thoughts&quot; — not question-based, AI
                    can&apos;t match to queries
                  </p>
                  <p className="text-red-600">✗ No TL;DR block in first 200 words</p>
                  <p className="text-amber-700">
                    ! Opening paragraph is 94 words before the first claim
                  </p>
                  <p className="text-emerald-700">
                    ✓ Definitions use &quot;X is Y&quot; sentence structure
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* remaining checks — compact */}
          <div className="mt-14 border-t border-gray-100 pt-8">
            <p className="text-sm font-medium text-gray-900">
              Plus six more checks:
            </p>
            <ul className="mt-4 grid gap-x-10 gap-y-3 text-sm text-gray-500 sm:grid-cols-2">
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">AI-crawler robots config</span>{" "}
                  — GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">Sitemap completeness</span> —
                  missing pages, orphans with no internal links
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">Canonical coverage</span> —
                  parameter and UTM risks before they split your authority
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">OG / Twitter cards</span> —
                  present on every page, consistent with on-page metadata
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">Internal linking</span> — key
                  pages reachable within 2 clicks, orphans flagged
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-500">→</span>
                <span>
                  <span className="text-gray-700">Schema-content alignment</span>{" "}
                  — structured data that matches what&apos;s actually rendered
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Robots example */}
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Most sites block AI crawlers by accident.
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            A robots.txt copied from a template in 2023 is quietly costing you
            citations today. One of the most common fixes we flag:
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <CodeBlock title="robots.txt — blocking the answer engines" tone="bad">
{`User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

# ChatGPT and Perplexity can't read
# a single page on this site.`}
            </CodeBlock>
            <CodeBlock title="robots.txt — intentional access" tone="good">
{`User-agent: GPTBot
Allow: /
Disallow: /account/

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /`}
            </CodeBlock>
          </div>
        </div>
      </section>

      {/* How it works — horizontal flow */}
      <section id="how" className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            How does LLMScore work?
          </h2>
          <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {/* connecting line */}
            <div
              className="absolute left-0 right-0 top-5 hidden h-px bg-gray-200 md:block"
              aria-hidden="true"
            />
            {/* step 1 */}
            <div className="relative">
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent-100 bg-white font-mono text-sm font-semibold text-accent-600">
                1
              </span>
              <h3 className="mt-5 font-medium text-gray-900">Enter your URL</h3>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-500">
                <span className="text-gray-300">https://</span>
                yourdomain.com
                <span className="ml-auto rounded bg-accent-500 px-2 py-0.5 text-[10px] font-medium text-white">
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
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent-100 bg-white font-mono text-sm font-semibold text-accent-600">
                2
              </span>
              <h3 className="mt-5 font-medium text-gray-900">Get your audit</h3>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-500" />
                  checking 9 categories…
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-2/3 rounded-full bg-accent-100" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                A 0–100 readiness score with every issue documented, in under a
                minute.
              </p>
            </div>
            {/* step 3 */}
            <div className="relative">
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent-100 bg-white font-mono text-sm font-semibold text-accent-600">
                3
              </span>
              <h3 className="mt-5 font-medium text-gray-900">Ship the fixes</h3>
              <div className="mt-3 space-y-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs">
                <p className="text-emerald-700">✓ llms-full.txt added</p>
                <p className="text-emerald-700">✓ 14 stale URLs fixed</p>
                <p className="text-gray-400">○ TL;DR blocks — in progress</p>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Each fix is specific and ranked by impact. Re-run to verify, and
                watch your citations grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="report" className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            What does a report look like?
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            Every category scored, every issue explained, every fix ranked by
            impact.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-gray-400">
                llmscore.io/report/meridianpayroll.com
              </span>
            </div>
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
              {/* left: gauge + summary */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  meridianpayroll.com · 340 pages crawled
                </p>
                {/* gauge */}
                <div className="mt-5 flex items-center gap-6">
                  <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#F5F5F4"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#3D63DD"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${0.64 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      transform="rotate(-90 60 60)"
                    />
                    <text
                      x="60"
                      y="58"
                      textAnchor="middle"
                      className="fill-gray-900"
                      fontSize="28"
                      fontWeight="600"
                    >
                      64
                    </text>
                    <text
                      x="60"
                      y="76"
                      textAnchor="middle"
                      className="fill-gray-400"
                      fontSize="11"
                    >
                      /100
                    </text>
                  </svg>
                  <div className="text-sm text-gray-500">
                    <p>
                      <span className="font-medium text-red-500">3 critical</span>
                    </p>
                    <p>
                      <span className="font-medium text-amber-600">4 warnings</span>
                    </p>
                    <p>
                      <span className="font-medium text-emerald-600">2 passing</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Top fixes by impact
                  </p>
                  <ol className="mt-3 space-y-2.5 text-sm text-gray-600">
                    <li>
                      <span className="mr-2 font-mono text-xs font-medium text-accent-600">01</span>
                      Create llms-full.txt — 212 of 340 indexable pages are
                      invisible to AI crawlers that use it.
                    </li>
                    <li>
                      <span className="mr-2 font-mono text-xs font-medium text-accent-600">02</span>
                      Fix stale llms.txt — 14 URLs 404, 9 duplicates.
                    </li>
                    <li>
                      <span className="mr-2 font-mono text-xs font-medium text-accent-600">03</span>
                      Unblock PerplexityBot in robots.txt — currently denied
                      site-wide.
                    </li>
                    <li>
                      <span className="mr-2 font-mono text-xs font-medium text-accent-600">04</span>
                      Add TL;DR blocks to the 20 highest-traffic guides.
                    </li>
                  </ol>
                </div>
              </div>
              {/* right: category breakdown with notes */}
              <div className="space-y-4">
                {[
                  {
                    name: "llms.txt",
                    score: 40,
                    note: "14 URLs return 404 · 9 duplicate entries · last updated 19 months ago",
                  },
                  {
                    name: "llms-full.txt",
                    score: 35,
                    note: "Missing entirely — 212 of 340 indexable pages unreachable via llms-full",
                  },
                  {
                    name: "JSON-LD",
                    score: 75,
                    note: "FAQPage present on 12 pages · HowTo missing on 6 tutorial pages",
                  },
                  {
                    name: "AI-crawler robots",
                    score: 60,
                    note: "PerplexityBot blocked site-wide · GPTBot allowed · CCBot not addressed",
                  },
                  {
                    name: "Extractability",
                    score: 55,
                    note: "4 of 20 top pages have question-based H2s · no TL;DR blocks found",
                  },
                  {
                    name: "Sitemap",
                    score: 85,
                    note: "3 indexable pages missing · 7 orphans present only in sitemap",
                  },
                  {
                    name: "Canonicals",
                    score: 90,
                    note: "UTM parameter risk on 2 templates · otherwise complete",
                  },
                  {
                    name: "OG / Twitter cards",
                    score: 70,
                    note: "og:image missing on 31 blog posts · titles consistent",
                  },
                ].map((c) => (
                  <div key={c.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="font-mono tabular-nums text-gray-500">
                        {c.score}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full origin-left animate-bar-grow rounded-full ${
                          c.score >= 80
                            ? "bg-accent-500"
                            : c.score >= 60
                              ? "bg-gray-400"
                              : "bg-gray-300"
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

      {/* Pricing line + CTA */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-2xl font-semibold tracking-tight text-gray-900">
            Find out what the answer engines see.
          </p>
          <a
            href="#top"
            className="mt-6 inline-block rounded-lg bg-accent-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Get your score
          </a>
          <p className="mt-4 text-sm text-gray-400">
            Free during early access. Pricing for full audits TBA.
          </p>
        </div>
      </section>

      {/* Footer */}
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
