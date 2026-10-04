"use client";

import { useState } from "react";

type Category = { name: string; score: number; note: string };

const MOCK_CATEGORIES: Category[] = [
  { name: "llms.txt", score: 40, note: "Missing or stale entries detected" },
  { name: "llms-full.txt", score: 35, note: "Entry count mismatch vs live pages" },
  { name: "JSON-LD for AI extraction", score: 75, note: "FAQPage present, HowTo missing" },
  { name: "AI-crawler robots config", score: 60, note: "PerplexityBot blocked — intentional?" },
  { name: "Content extractability", score: 55, note: "Few question-based H2s, no TL;DRs" },
  { name: "Sitemap completeness", score: 85, note: "3 indexable pages missing" },
  { name: "Canonical coverage", score: 90, note: "UTM parameter risk on 2 templates" },
  { name: "OG / Twitter cards", score: 70, note: "og:image missing on blog posts" },
  { name: "Internal linking", score: 65, note: "7 orphan pages only in sitemap" },
];

function overall(cats: Category[]) {
  return Math.round(cats.reduce((s, c) => s + c.score, 0) / cats.length);
}

function barColor(score: number) {
  if (score >= 80) return "bg-cite-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

export default function AuditWidget() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [audited, setAudited] = useState("");

  function run(e: React.FormEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!value) return;
    setAudited(value.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    setState("loading");
    setTimeout(() => setState("done"), 1800);
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={run}
        className="input-glow flex gap-1.5 rounded-xl border border-navy-600 bg-navy-850/80 p-1.5 backdrop-blur transition"
      >
        <div className="flex flex-1 items-center gap-2 pl-3">
          <span className="font-mono text-sm text-slate-500">https://</span>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourdomain.com"
            aria-label="Website URL"
            className="w-full bg-transparent py-2.5 font-mono text-sm text-paper placeholder-slate-600 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-cite-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-cite-400 hover:shadow-[0_0_20px_-4px_rgba(31,210,244,0.5)] active:scale-[0.98] disabled:opacity-60"
        >
          {state === "loading" ? "Auditing…" : "Audit my site"}
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Free preview score. No signup required.
      </p>

      {state === "loading" && (
        <div className="card-border mt-6 rounded-xl bg-navy-900 p-6">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-cite-500" />
            Crawling {audited}… checking llms.txt, schema, robots, sitemaps…
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-navy-700">
            <div className="h-full w-1/3 animate-scan rounded-full bg-gradient-to-r from-transparent via-cite-500 to-transparent" />
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="card-border mt-6 rounded-xl bg-navy-900 p-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                AI search readiness — {audited}
              </p>
              <p className="font-display mt-1 text-4xl font-bold text-paper">
                {overall(MOCK_CATEGORIES)}
                <span className="text-lg font-normal text-slate-500">/100</span>
              </p>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              Needs work
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {MOCK_CATEGORIES.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-300">{c.name}</span>
                  <span className="font-mono text-slate-400">{c.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-700">
                  <div
                    className={`h-full origin-left animate-bar-grow rounded-full ${barColor(c.score)}`}
                    style={{
                      width: `${c.score}%`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg border border-navy-600 bg-navy-850 p-3 text-xs text-slate-400">
            This is a sample preview. The full audit crawls your real pages and
            ranks every fix by impact. Early access is rolling out now.
          </p>
        </div>
      )}
    </div>
  );
}
