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
  if (score >= 80) return "bg-accent-500";
  if (score >= 60) return "bg-gray-400";
  return "bg-gray-300";
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
        className="flex gap-1.5 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm transition focus-within:border-accent-500"
      >
        <div className="flex flex-1 items-center gap-2 pl-3">
          <span className="text-sm text-gray-400">https://</span>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourdomain.com"
            aria-label="Website URL"
            className="w-full bg-transparent py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {state === "loading" ? "Auditing…" : "Audit my site"}
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-400">
        Free preview score. No signup required.
      </p>

      {state === "loading" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-accent-500" />
            Crawling {audited}… checking llms.txt, schema, robots, sitemaps…
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-1/3 animate-pulse-soft rounded-full bg-accent-100" />
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                AI search readiness — {audited}
              </p>
              <p className="mt-1 text-4xl font-semibold text-gray-900">
                {overall(MOCK_CATEGORIES)}
                <span className="text-lg font-normal text-gray-400">/100</span>
              </p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              Needs work
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {MOCK_CATEGORIES.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="tabular-nums text-gray-500">{c.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full origin-left animate-bar-grow rounded-full ${barColor(c.score)}`}
                    style={{
                      width: `${c.score}%`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            This is a sample preview. The full audit crawls your real pages and
            ranks every fix by impact. Early access is rolling out now.
          </p>
        </div>
      )}
    </div>
  );
}
