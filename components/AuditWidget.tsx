"use client";

import { useState } from "react";
import GitHubConnect from "./GitHubConnect";

type Issue = {
  severity: "critical" | "warning" | "pass";
  message: string;
  fix: string;
};

type CategoryResult = {
  name: string;
  key?: string;
  score: number;
  issues: Issue[];
  topFixes: Issue[];
};

type AuditResult = {
  domain: string;
  overallScore: number;
  categories: CategoryResult[];
  topFixes: Issue[];
  crawledAt: string;
};

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-600";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Needs work";
  return "Critical";
}

export default function AuditWidget() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!value) return;
    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Audit failed (${res.status})`);
      }

      const data: AuditResult = await res.json();
      setResult(data);
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Audit failed");
      setState("error");
    }
  }

  const audited = result?.domain || url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={run}
        className="sketch-border flex gap-1.5 bg-white p-1.5 transition focus-within:border-accent-500"
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
          className="sketch-btn bg-accent-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {state === "loading" ? "Auditing…" : "Audit my site"}
        </button>
      </form>
      <p className="mt-2 font-hand text-sm text-gray-500">
        Free audit. No signup required.
      </p>

      {state === "loading" && (
        <div className="sketch-card mt-6 p-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-accent-500" />
            Crawling {audited}… checking llms.txt, schema, robots, sitemaps…
          </div>
          <div className="ink-bar mt-4 h-1.5 overflow-hidden bg-gray-100">
            <div className="ink-bar h-full w-1/3 animate-pulse-soft bg-accent-100" />
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="sketch-card mt-6 p-6">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-red-500">Audit failed:</span>{" "}
            {error}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Check the URL is correct and publicly accessible, then try again.
          </p>
        </div>
      )}

      {state === "done" && result && (
        <div className="sketch-card mt-6 p-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-hand text-base text-gray-500">
                AI search readiness — {audited}
              </p>
              <p className="mt-1 font-serif text-4xl font-semibold text-gray-900">
                {result.overallScore}
                <span className="text-lg font-normal text-gray-400">/100</span>
              </p>
            </div>
            <span className="sketch-pill bg-gray-50 px-3 py-1 font-hand text-sm text-gray-600">
              {scoreLabel(result.overallScore)}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {result.categories.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="tabular-nums text-gray-500">{c.score}/100</span>
                </div>
                <div className="ink-bar mt-1 h-1.5 overflow-hidden bg-gray-100">
                  <div
                    className={`ink-bar h-full origin-left animate-bar-grow ${barColor(c.score)}`}
                    style={{
                      width: `${c.score}%`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
                {c.issues.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {c.issues.length} issue{c.issues.length > 1 ? "s" : ""} found
                  </p>
                )}
              </div>
            ))}
          </div>

          {result.topFixes.length > 0 && (
            <div className="sketch-border-soft mt-5 bg-gray-50 p-4">
              <p className="font-hand text-base text-accent-600">
                Top fixes by impact
              </p>
              <ol className="mt-3 space-y-2 text-xs text-gray-600">
                {result.topFixes.slice(0, 3).map((fix, i) => (
                  <li key={i}>
                    <span className="mr-2 font-hand text-sm font-medium text-accent-600">{i + 1}.</span>
                    {fix.message}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <GitHubConnect domain={result.domain} categories={result.categories} />

          <a
            href={`/report/${audited}`}
            className="mt-4 block text-center text-sm font-medium text-accent-600 hover:text-accent-700"
          >
            View full report →
          </a>
        </div>
      )}
    </div>
  );
}
