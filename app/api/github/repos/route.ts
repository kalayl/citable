import { NextRequest, NextResponse } from "next/server";
import { GITHUB_TOKEN_COOKIE, listPublicRepos } from "@/lib/github";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(GITHUB_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ connected: false, repos: [] });
  }
  try {
    const repos = await listPublicRepos(token);
    return NextResponse.json({
      connected: true,
      repos: repos.map((r) => ({ fullName: r.full_name, url: r.html_url })),
    });
  } catch {
    // Token likely expired/revoked
    const res = NextResponse.json({ connected: false, repos: [] });
    res.cookies.delete(GITHUB_TOKEN_COOKIE);
    return res;
  }
}
