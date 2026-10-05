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

type Repo = { fullName: string; url: string };
type FixState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; prUrl: string }
  | { status: "error"; message: string };

const FIXABLE_KEYS = [
  "llms-txt",
  "robots",
  "json-ld",
  "sitemap",
  "canonicals",
  "og-cards",
];
const REPO_STORAGE_KEY = "llmscore:selected-repo";

function FixSection({ audit, github }: { audit: Audit; github: { connected: boolean; repos: Repo[] } }) {
  const [repo, setRepo] = useState("");
  const [state, setState] = useState<FixState>({ status: "idle" });

  const fixableCategories = audit.categories.filter(
    (c) =>
      FIXABLE_KEYS.includes(c.key) &&
      c.score < 80 &&
      c.issues.some((i) => i.severity !== "pass"),
  );

  useEffect(() => {
    if (github.repos.length === 0) return;
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(REPO_STORAGE_KEY) : null;
    if (saved && github.repos.some((r) => r.fullName === saved)) {
      setRepo(saved);
    } else {
      setRepo(github.repos[0].fullName);
    }
  }, [github.repos]);

  function selectRepo(value: string) {
    setRepo(value);
    try {
      localStorage.setItem(REPO_STORAGE_KEY, value);
    } catch {
      // ignore storage errors
    }
  }

  async function createPr() {
    if (!repo || fixableCategories.length === 0) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          domain: audit.domain,
          repo,
          categories: fixableCategories.map((c) => c.key),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create PR");
      setState({ status: "done", prUrl: data.prUrl });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Failed to create PR",
      });
    }
  }

  if (!github.connected) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
        Connect GitHub to turn these fixes into a PR.{" "}
        <a
          href="/signin"
          className="font-semibold text-accent-600 underline underline-offset-2"
        >
          Sign in with GitHub
        </a>
      </div>
    );
  }

  if (github.repos.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
        No public repos found.
      </div>
    );
  }

  if (fixableCategories.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
        No automated fixes needed — everything fixable already looks good.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
          Repo
        </label>
        <select
          value={repo}
          onChange={(e) => selectRepo(e.target.value)}
          className="max-w-[260px] rounded border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-700"
          disabled={state.status === "loading"}
        >
          {github.repos.map((r) => (
            <option key={r.fullName} value={r.fullName}>
              {r.fullName}
            </option>
          ))}
        </select>
        {state.status === "done" ? (
          <a
            href={state.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-semibold text-accent-600 underline underline-offset-2"
          >
            PR created: view it →
          </a>
        ) : (
          <button
            onClick={createPr}
            disabled={state.status === "loading" || !repo}
            className="rounded bg-accent-600 px-3 py-1.5 font-mono text-xs font-semibold text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {state.status === "loading"
              ? "Creating PR…"
              : `Create PR with all fixes (${fixableCategories.length})`}
          </button>
        )}
      </div>
      {state.status === "error" && (
        <p className="mt-2 text-xs text-red-600">{state.message}</p>
      )}
      <ul className="mt-4 space-y-1.5">
        {fixableCategories.map((c) => (
          <li key={c.key} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            {c.name}
            <span className="font-mono text-[11px] text-gray-400">{c.key}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportView({ domain }: { domain: string }) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [github, setGithub] = useState<{ connected: boolean; repos: Repo[] } | null>(null);

  useEffect(() => {
    if (!audit) return;
    let cancelled = false;
    fetch("/api/github/repos")
      .then((r) => (r.ok ? r.json() : { connected: false, repos: [] }))
      .then((d) => {
        if (!cancelled)
          setGithub({ connected: !!d.connected, repos: d.repos ?? [] });
      })
      .catch(() => {
        if (!cancelled) setGithub({ connected: false, repos: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [audit]);

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

      {/* Fix via GitHub PR */}
      {audit.topFixes.length > 0 && github && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Fix via GitHub PR</h2>
          <FixSection audit={audit} github={github} />
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
