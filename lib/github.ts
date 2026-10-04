/**
 * GitHub API helpers. All calls use fetch() with a user OAuth token.
 * Token is stored in an httpOnly cookie set by the OAuth callback route.
 */

const GH_API = "https://api.github.com";

export const GITHUB_TOKEN_COOKIE = "gh_token";

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "llmscore",
  };
}

async function gh<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${GH_API}${path}`, {
    ...init,
    headers: { ...ghHeaders(token), ...(init?.headers || {}) },
  });
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = {} as T;
  }
  return { ok: res.ok, status: res.status, data };
}

export interface Repo {
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
  html_url: string;
}

export async function listPublicRepos(token: string): Promise<Repo[]> {
  const res = await gh<Repo[]>(
    token,
    "/user/repos?type=public&sort=updated&per_page=100"
  );
  if (!res.ok) throw new Error(`Failed to list repos (${res.status})`);
  return res.data;
}

export interface RepoFile {
  path: string;
  sha: string;
  content: string; // decoded
}

/** Get a file from a repo. Returns null if it doesn't exist. */
export async function getFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<RepoFile | null> {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const res = await gh<{ sha: string; content?: string; encoding?: string }>(
    token,
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}${q}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
  const content =
    res.data.content && res.data.encoding === "base64"
      ? Buffer.from(res.data.content, "base64").toString("utf-8")
      : "";
  return { path, sha: res.data.sha, content };
}

/** Create or update a file on a branch. */
export async function putFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  opts: { content: string; message: string; branch: string; sha?: string }
): Promise<void> {
  const res = await gh<unknown>(
    token,
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: opts.message,
        content: Buffer.from(opts.content, "utf-8").toString("base64"),
        branch: opts.branch,
        ...(opts.sha ? { sha: opts.sha } : {}),
      }),
    }
  );
  if (!res.ok) throw new Error(`Failed to write ${path} (${res.status})`);
}

/** Get the default branch and its head commit SHA. Throws if no branch exists. */
export async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string
): Promise<{ branch: string; sha: string }> {
  const repoRes = await gh<{ default_branch?: string }>(token, `/repos/${owner}/${repo}`);
  if (!repoRes.ok) throw new Error(`Repo not found (${repoRes.status})`);
  const branch = repoRes.data.default_branch;
  if (!branch) throw new Error("Repository has no default branch");
  const refRes = await gh<{ object?: { sha: string } }>(
    token,
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`
  );
  if (!refRes.ok || !refRes.data.object) {
    throw new Error("Repository has no commits on its default branch");
  }
  return { branch, sha: refRes.data.object.sha };
}

/** Create a branch from a base SHA. */
export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  branchName: string,
  fromSha: string
): Promise<void> {
  const res = await gh<unknown>(token, `/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: fromSha }),
  });
  if (!res.ok) throw new Error(`Failed to create branch (${res.status})`);
}

/** Open a pull request. Returns the PR URL. */
export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  opts: { title: string; body: string; head: string; base: string }
): Promise<string> {
  const res = await gh<{ html_url?: string; message?: string }>(
    token,
    `/repos/${owner}/${repo}/pulls`,
    { method: "POST", body: JSON.stringify(opts) }
  );
  if (!res.ok || !res.data.html_url) {
    throw new Error(res.data.message || `Failed to open PR (${res.status})`);
  }
  return res.data.html_url;
}
