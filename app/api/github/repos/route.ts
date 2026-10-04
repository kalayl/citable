import { NextRequest, NextResponse } from "next/server";
import { listPublicRepos } from "@/lib/github";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  const token = (session as unknown as Record<string, unknown> | null)?.githubAccessToken as
    | string
    | undefined;
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
    return NextResponse.json({ connected: false, repos: [] });
  }
}
