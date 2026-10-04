"use client";

import { useEffect, useState } from "react";

type Severity = "critical" | "warning" | "pass";
type Issue = { severity: Severity; message: string; fix: string };
type Category = {
  name: string;
  key: string;
  score: number;
  issues: Issue[];
  topFixes: string[];
};
type Audit = {
  domain: string;
  url: string;
  overallScore: number;
  categories: Category[];
  topFixes: { category: string; severity: Severity; message: string; fix: string }[];
  crawledAt: string;
  pagesCrawled: number;
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}
function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}
function label(score: number) {
  if (score >= 80) return "strong";
  if (score >= 60) return "needs work";
  return "at risk";
}

function SeverityBadge({ s }: { s: Severity }) {
  if (s === "critical")
    return (
      <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-red-600">
        CRIT
      </span>
    );
  if (s === "warning")
    return (
      <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-600">
        WARN
      </span>
    );
  return (
    <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-600">
      PASS
    </span>
  );
}

export default function ReportView({ domain }: { domain: string }) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Try cache first
        const cached = await fetch(`/api/audit/${encodeURIComponent(domain)}`);
        if (cached.ok) {
          const data = await cached.json();
          if (!cancelled) setAudit(data);
          return;
        }
        // Run a fresh audit
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: domain }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Audit failed");
        if (!cancelled) setAudit(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Audit failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [domain]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-accent-500" />
        <p className="font-mono text-sm text-gray-500">
          auditing {domain} — crawling pages, checking llms.txt, schemas, robots…
        </p>
        <p className="mt-2 text-xs text-gray-400">usually takes 10-30 seconds</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-lg font-semibold">Audit failed</p>
        <p className="mt-2 text-sm text-gray-500">{error || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Overall */}
      <div className="flex flex-col items-start gap-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
            AI search readiness
          </p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">
            <span className={scoreColor(audit.overallScore)}>{audit.overallScore}</span>
            <span className="text-2xl font-normal text-gray-400">/100</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {audit.domain} · {label(audit.overallScore)} · {audit.pagesCrawled} pages crawled ·{" "}
            {new Date(audit.crawledAt).toLocaleString()}
          </p>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-2 sm:ml-auto sm:max-w-sm">
          {audit.categories.map((c) => (
            <div key={c.key} className="flex items-center gap-3 text-xs">
              <span className="w-40 shrink-0 truncate text-gray-500">{c.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${barColor(c.score)}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-gray-600">{c.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top fixes */}
      {audit.topFixes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            Top fixes by impact
          </h2>
          <ol className="mt-4 space-y-3">
            {audit.topFixes.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-gray-200 p-4"
              >
                <span className="mt-0.5 font-mono text-sm text-gray-400">{i + 1}.</span>
                <SeverityBadge s={f.severity} />
                <div>
                  <p className="text-sm font-medium">{f.message}</p>
                  <p className="mt-1 text-sm text-gray-500">{f.fix}</p>
                  <p className="mt-1 font-mono text-[11px] text-gray-400">{f.category}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Categories */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Category detail</h2>
        <div className="mt-4 space-y-4">
          {audit.categories.map((c) => (
            <details
              key={c.key}
              className="group rounded-xl border border-gray-200"
              open={c.score < 80}
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                <span className={`font-mono text-lg font-semibold ${scoreColor(c.score)}`}>
                  {c.score}
                </span>
                <span className="font-medium">{c.name}</span>
                <div className="ml-auto h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${barColor(c.score)}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </summary>
              <ul className="space-y-2 border-t border-gray-100 p-4">
                {c.issues.map((iss, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <SeverityBadge s={iss.severity} />
                    <div>
                      <p className="text-gray-800">{iss.message}</p>
                      {iss.fix && iss.severity !== "pass" && (
                        <p className="mt-0.5 text-gray-500">{iss.fix}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 pb-10 text-center text-xs text-gray-400">
        Audited {new Date(audit.crawledAt).toLocaleString()} · results cached for 1 hour
      </p>
    </div>
  );
}
