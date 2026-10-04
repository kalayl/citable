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
  if (score >= 80) return "bg-mint-500";
  if (score >= 60) return "bg-yellow-400";
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
      <form onSubmit={run} className="flex gap-2">
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourdomain.com"
          aria-label="Website URL"
          className="flex-1 rounded-lg border border-ink-600 bg-ink-850 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-mint-500/60 focus:ring-2 focus:ring-mint-500/20"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-mint-500 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-mint-400 disabled:opacity-60"
        >
          {state === "loading" ? "Auditing…" : "Audit my site"}
        </button>
      </form>
      <p className="mt-2 text-xs text-zinc-500">
        Free preview score. No signup required.
      </p>

      {state === "loading" && (
        <div className="card-border mt-6 rounded-xl bg-ink-900 p-6">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-mint-500" />
            Crawling {audited}… checking llms.txt, schema, robots, sitemaps…
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full w-2/3 animate-pulse-soft rounded-full bg-mint-500" />
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="card-border mt-6 rounded-xl bg-ink-900 p-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                AI search readiness — {audited}
              </p>
              <p className="mt-1 text-4xl font-bold text-zinc-100">
                {overall(MOCK_CATEGORIES)}
                <span className="text-lg font-normal text-zinc-500">/100</span>
              </p>
            </div>
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-300">
              Needs work
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {MOCK_CATEGORIES.map((c) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-300">{c.name}</span>
                  <span className="font-mono text-zinc-400">{c.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className={`h-full rounded-full ${barColor(c.score)}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg border border-ink-600 bg-ink-850 p-3 text-xs text-zinc-400">
            This is a sample preview. The full audit crawls your real pages and
            ranks every fix by impact. Early access is rolling out now.
          </p>
        </div>
      )}
    </div>
  );
}
