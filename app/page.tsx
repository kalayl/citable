import AuditWidget from "@/components/AuditWidget";
import Logo, { LogoMark } from "@/components/Logo";

const checks = [
  {
    icon: "📄",
    title: "llms.txt validation",
    body: "Exists, URLs resolve, counts are accurate, no duplicate entries, not stale. The front door for AI crawlers.",
  },
  {
    icon: "📚",
    title: "llms-full.txt validation",
    body: "Entry count vs actual pages, name quality (no \"CODE: CODE\" dupes), currency-encoding issues and more.",
  },
  {
    icon: "🧩",
    title: "JSON-LD for AI extraction",
    body: "Not just \"is schema present?\" — will an LLM extract a clean answer? FAQPage, Breadcrumbs, Organization, Product, Article, HowTo.",
  },
  {
    icon: "🤖",
    title: "AI-crawler robots config",
    body: "GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended — who's allowed, who's blocked, and is it intentional?",
  },
  {
    icon: "🔍",
    title: "Content extractability",
    body: "Question-based H2s, TL;DR blocks, concise openings, schema aligned with page content. Will AI surface you as a cited source?",
  },
  {
    icon: "🗺️",
    title: "Sitemap completeness",
    body: "All indexable pages present? Orphan pages that exist in the sitemap but have no internal links?",
  },
  {
    icon: "🔗",
    title: "Canonical coverage",
    body: "Every page has a canonical. Parameter and UTM risks flagged before they split your authority.",
  },
  {
    icon: "🖼️",
    title: "OG / Twitter cards",
    body: "og:title, og:description, og:image on every page — and consistent with on-page metadata.",
  },
  {
    icon: "🕸️",
    title: "Internal linking",
    body: "Key pages reachable within 2 clicks from the homepage. Orphans found and flagged.",
  },
];

const steps = [
  {
    n: "01",
    title: "Enter your URL",
    body: "Point Citable at your domain. We crawl your pages, llms.txt, robots.txt, sitemaps and structured data.",
  },
  {
    n: "02",
    title: "Get your audit",
    body: "A 0–100 AI search readiness score, broken down across 9 categories, with every issue documented.",
  },
  {
    n: "03",
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
  if (score >= 80) return "bg-cite-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" aria-label="Citable home">
            <Logo />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            <a href="#checks" className="transition hover:text-paper">
              What it checks
            </a>
            <a href="#how" className="transition hover:text-paper">
              How it works
            </a>
            <a href="#report" className="transition hover:text-paper">
              Sample report
            </a>
            <a
              href="#top"
              className="rounded-lg bg-cite-500 px-3 py-1.5 font-medium text-navy-950 transition hover:bg-cite-400 hover:shadow-[0_0_20px_-4px_rgba(31,210,244,0.5)]"
            >
              Get your score
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="hero-mesh relative border-b border-white/5">
        <div className="grid-lines absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
          <span className="mb-6 rounded-full border border-cite-500/30 bg-cite-500/10 px-3 py-1 font-mono text-xs font-medium text-cite-400">
            Early access — AI search readiness audits
          </span>
          <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-paper sm:text-6xl">
            Will AI{" "}
            <span className="relative whitespace-nowrap text-cite-400">
              cite
              <sup className="absolute -right-1 -top-1 font-mono text-xs font-medium text-cite-400/70 sm:-right-2 sm:top-0 sm:text-sm">
                [1]
              </sup>
            </span>{" "}
            your site?
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            ChatGPT, Perplexity and Google AI Overviews are answering your
            customers&apos; questions. Citable audits whether your site is
            structured to be their source — and tells you exactly what to fix.
          </p>
          <div className="mt-10 flex w-full justify-center">
            <AuditWidget />
          </div>
          <p className="footnote-rule mt-14 max-w-md font-mono text-xs text-slate-500">
            [1] Citation: the act of an AI answer engine naming your site as
            its source. The new organic traffic.
          </p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                AI search is eating traditional search
              </h2>
              <p className="mt-4 text-slate-400">
                Google AI Overviews, ChatGPT search and Perplexity now sit
                between your content and your customers. They don&apos;t rank
                ten blue links — they extract answers and cite a handful of
                sources.
              </p>
              <p className="mt-4 text-slate-400">
                Traditional SEO tools don&apos;t check whether your site is
                readable by AI crawlers or structured for AI extraction. If
                your pages can&apos;t be cleanly parsed, summarised and
                attributed, you&apos;re invisible in the answers — no matter
                how well you rank.
              </p>
            </div>
            <div className="card-border rounded-xl bg-navy-900 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                The LLM layer Citable audits
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="text-cite-400">→</span>
                  Can AI crawlers reach and read your pages?
                </li>
                <li className="flex gap-3">
                  <span className="text-cite-400">→</span>
                  Can an LLM extract a clean, attributable answer?
                </li>
                <li className="flex gap-3">
                  <span className="text-cite-400">→</span>
                  Does your structured data match what&apos;s on the page?
                </li>
                <li className="flex gap-3">
                  <span className="text-cite-400">→</span>
                  Are your llms.txt and sitemaps accurate and fresh?
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What it checks */}
      <section id="checks" className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
            Nine audits, one score
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Citable checks the full LLM optimisation layer that sits on top of
            your SEO.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c, i) => (
              <div
                key={c.title}
                className="card-border card-lift group relative rounded-xl bg-navy-900 p-5"
              >
                <span className="absolute right-4 top-4 font-mono text-xs text-slate-600 transition group-hover:text-cite-400/60">
                  [{i + 1}]
                </span>
                <div className="text-2xl">{c.icon}</div>
                <h3 className="mt-3 font-semibold text-paper">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="card-border card-lift rounded-xl bg-navy-900 p-6"
              >
                <span className="font-mono text-sm text-cite-400">{s.n}</span>
                <h3 className="mt-3 font-semibold text-paper">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="report" className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
            What a report looks like
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Every category scored, every issue explained, every fix ranked by
            impact.
          </p>
          <div className="card-border mt-10 overflow-hidden rounded-xl bg-navy-900">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-navy-850 px-5 py-3">
              <span className="chrome-dot bg-red-400/60" />
              <span className="chrome-dot bg-amber-400/60" />
              <span className="chrome-dot bg-cite-500/60" />
              <span className="ml-3 flex-1 truncate rounded-md bg-navy-950/70 px-3 py-1 font-mono text-xs text-slate-500">
                citable.dev/report/example-saas.com
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    example-saas.com
                  </p>
                  <p className="font-display mt-1 text-5xl font-bold text-paper">
                    64
                    <span className="text-xl font-normal text-slate-500">
                      /100
                    </span>
                  </p>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p>
                    <span className="text-red-400">●</span> 3 critical
                    &nbsp;<span className="text-amber-400">●</span> 4 warnings
                    &nbsp;<span className="text-cite-400">●</span> 2 passing
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {sample.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-slate-300">{c.name}</span>
                      <span className="font-mono text-slate-400">
                        {c.score}/100
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy-700">
                      <div
                        className={`h-full origin-left animate-bar-grow rounded-full ${barColor(c.score)}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg border border-navy-600 bg-navy-850 p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Top fixes by impact
                </p>
                <ol className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>
                    <span className="mr-2 font-mono text-red-400">1</span>
                    Create llms-full.txt — 212 of 340 indexable pages are
                    invisible to AI crawlers that use it.
                  </li>
                  <li>
                    <span className="mr-2 font-mono text-red-400">2</span>
                    Fix stale llms.txt entries — 14 URLs 404 and 9 are
                    duplicates.
                  </li>
                  <li>
                    <span className="mr-2 font-mono text-amber-400">3</span>
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
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
            Early access
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Free preview scores during early access. Full audits with ranked
            fixes and re-run tracking are rolling out to the waitlist now.
          </p>
          <a
            href="#top"
            className="mt-8 inline-block rounded-lg bg-cite-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-cite-400 hover:shadow-[0_0_28px_-4px_rgba(31,210,244,0.5)]"
          >
            Get your score
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={20} />
          <span>Citable — AI search readiness audits</span>
        </div>
        <p>© {new Date().getFullYear()} Citable. Built for the AI search era.</p>
      </footer>
    </main>
  );
}
