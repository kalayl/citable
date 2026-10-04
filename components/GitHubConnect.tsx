"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type Repo = { fullName: string; url: string };

const FIXABLE = new Set([
  "llms-txt",
  "robots",
  "json-ld",
  "sitemap",
  "canonicals",
  "og-cards",
]);

type Category = { name: string; key?: string; score: number };

export default function GitHubConnect({
  domain,
  categories,
}: {
  domain: string;
  categories: Category[];
}) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState("");
  const [fixing, setFixing] = useState<string | null>(null);
  const [prs, setPrs] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const ghToken = (session as unknown as Record<string, unknown> | null)?.githubAccessToken;

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((d) => {
        setConnected(!!d.connected);
        setRepos(d.repos || []);
        if (d.repos?.length) setRepo(d.repos[0].fullName);
      })
      .catch(() => setConnected(false));
  }, []);

  const fixable = categories.filter(
    (c) => c.key && FIXABLE.has(c.key) && c.score < 100
  );
  if (fixable.length === 0) return null;

  async function runFix(category: string) {
    if (!repo) return;
    setFixing(category);
    setError("");
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, category, repo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fix failed");
      setPrs((p) => ({ ...p, [category]: data.prUrl }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fix failed");
    } finally {
      setFixing(null);
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        Fix it automatically
      </p>

      {connected === false && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            Want LLMScore to fix these issues? Connect GitHub and we open PRs
            with the fixes. You review and merge.
          </p>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: window.location.href })}
            className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Connect GitHub →
          </button>
          <p className="mt-2 text-xs text-gray-400">
            Free audit. $29/mo for automatic PR fixes. Early access: free
            everything.
          </p>
        </div>
      )}

      {connected && (
        <div className="mt-3 space-y-3">
          <label className="block text-xs text-gray-500">
            Target repository
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {repos.map((r) => (
                <option key={r.fullName} value={r.fullName}>
                  {r.fullName}
                </option>
              ))}
            </select>
          </label>

          <ul className="space-y-2">
            {fixable.map((c) => (
              <li
                key={c.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-gray-700">{c.name}</span>
                {prs[c.key!] ? (
                  <a
                    href={prs[c.key!]}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent-600 hover:text-accent-700"
                  >
                    PR opened →
                  </a>
                ) : (
                  <button
                    onClick={() => runFix(c.key!)}
                    disabled={fixing !== null || !repo}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 disabled:opacity-50"
                  >
                    {fixing === c.key ? "Opening PR…" : "Fix in GitHub"}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-gray-400">
            LLMScore creates a branch and opens a PR. Nothing merges without
            your review.
          </p>
        </div>
      )}
    </div>
  );
}
