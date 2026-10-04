import AuditWidget from "@/components/AuditWidget";
import Logo, { LogoMark } from "@/components/Logo";

const checks = [
  {
    title: "llms.txt validation",
    body: "Exists, URLs resolve, counts are accurate, no duplicate entries, not stale. The front door for AI crawlers.",
  },
  {
    title: "llms-full.txt validation",
    body: "Entry count vs actual pages, name quality (no \"CODE: CODE\" dupes), currency-encoding issues and more.",
  },
  {
    title: "JSON-LD for AI extraction",
    body: "Not just \"is schema present?\" — will an LLM extract a clean answer? FAQPage, Breadcrumbs, Organization, Product, Article, HowTo.",
  },
  {
    title: "AI-crawler robots config",
    body: "GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended — who's allowed, who's blocked, and is it intentional?",
  },
  {
    title: "Content extractability",
    body: "Question-based H2s, TL;DR blocks, concise openings, schema aligned with page content. Will AI surface you as a cited source?",
  },
  {
    title: "Sitemap completeness",
    body: "All indexable pages present? Orphan pages that exist in the sitemap but have no internal links?",
  },
  {
    title: "Canonical coverage",
    body: "Every page has a canonical. Parameter and UTM risks flagged before they split your authority.",
  },
  {
    title: "OG / Twitter cards",
    body: "og:title, og:description, og:image on every page — and consistent with on-page metadata.",
  },
  {
    title: "Internal linking",
    body: "Key pages reachable within 2 clicks from the homepage. Orphans found and flagged.",
  },
];

const steps = [
  {
    n: "1",
    title: "Enter your URL",
    body: "Point Citable at your domain. We crawl your pages, llms.txt, robots.txt, sitemaps and structured data.",
  },
  {
    n: "2",
    title: "Get your audit",
    body: "A 0–100 AI search readiness score, broken down across 9 categories, with every issue documented.",
  },
  {
    n: "3",
    title: "Ship the fixes",
    body: "Each fix is specific and ranked by impact. Re-run the audit to verify, and watch your citations grow.",
  },
];

const sample = [
  { name: "llms.txt", score: 40 },
  { name: "llms-full.txt", score: 35 },
  { name: "JSON-LD", score: 75 },
  { name: "AI-crawler robots", score: 60 },
  { name: "Extractability", score: 55 },
  { name: "Sitemap", score: 85 },
  { name: "Canonicals", score: 90 },
  { name: "OG / Twitter cards", score: 70 },
  { name: "Internal linking", score: 65 },
];

function barColor(score: number) {
  if (score >= 80) return "bg-accent-500";
  if (score >= 60) return "bg-gray-400";
  return "bg-gray-300";
}

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#" aria-label="Citable home">
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

      {/* Hero */}
      <section id="top" className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
          <span className="mb-6 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            Early access — AI search readiness audits
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Will AI <span className="text-accent-500">cite</span> your site?
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-500">
            ChatGPT, Perplexity and Google AI Overviews are answering your
            customers&apos; questions. Citable audits whether your site is
            structured to be their source — and tells you exactly what to fix.
          </p>
          <div className="mt-10 flex w-full justify-center">
            <AuditWidget />
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Why is AI search eating traditional search?
              </h2>
              <p className="mt-4 text-gray-500">
                Google AI Overviews, ChatGPT search and Perplexity now sit
                between your content and your customers. They don&apos;t rank
                ten blue links — they extract answers and cite a handful of
                sources.
              </p>
              <p className="mt-4 text-gray-500">
                Traditional SEO tools don&apos;t check whether your site is
                readable by AI crawlers or structured for AI extraction. If
                your pages can&apos;t be cleanly parsed, summarised and
                attributed, you&apos;re invisible in the answers — no matter
                how well you rank.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                The LLM layer Citable audits
              </p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="text-accent-500">→</span>
                  Can AI crawlers reach and read your pages?
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-500">→</span>
                  Can an LLM extract a clean, attributable answer?
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-500">→</span>
                  Does your structured data match what&apos;s on the page?
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-500">→</span>
                  Are your llms.txt and sitemaps accurate and fresh?
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What it checks */}
      <section id="checks" className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            What does Citable check?
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            Citable checks the full LLM optimisation layer that sits on top of
            your SEO.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            How does Citable work?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border border-gray-200 bg-white p-6">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-50 text-sm font-medium text-accent-600">
                  {s.n}
                </span>
                <h3 className="mt-3 font-medium text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="report" className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            What does a report look like?
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            Every category scored, every issue explained, every fix ranked by
            impact.
          </p>
          <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-gray-400">
                citable.dev/report/example-saas.com
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    example-saas.com
                  </p>
                  <p className="mt-1 text-5xl font-semibold text-gray-900">
                    64
                    <span className="text-xl font-normal text-gray-400">
                      /100
                    </span>
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>3 critical · 4 warnings · 2 passing</p>
                </div>
              </div>
              <div className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {sample.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-gray-700">{c.name}</span>
                      <span className="tabular-nums text-gray-500">
                        {c.score}/100
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full origin-left animate-bar-grow rounded-full ${barColor(c.score)}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Top fixes by impact
                </p>
                <ol className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>
                    <span className="mr-2 font-medium text-accent-600">1</span>
                    Create llms-full.txt — 212 of 340 indexable pages are
                    invisible to AI crawlers that use it.
                  </li>
                  <li>
                    <span className="mr-2 font-medium text-accent-600">2</span>
                    Fix stale llms.txt entries — 14 URLs 404 and 9 are
                    duplicates.
                  </li>
                  <li>
                    <span className="mr-2 font-medium text-accent-600">3</span>
                    Add TL;DR blocks and question-based H2s to your top 20
                    traffic pages.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            How much does it cost?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Free preview scores during early access. Full audits with ranked
            fixes and re-run tracking are rolling out to the waitlist now.
          </p>
          <a
            href="#top"
            className="mt-8 inline-block rounded-lg bg-accent-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Get your score
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-gray-400 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={18} />
          <span>Citable — AI search readiness audits</span>
        </div>
        <p>© {new Date().getFullYear()} Citable. Built for the AI search era.</p>
      </footer>
    </main>
  );
}
