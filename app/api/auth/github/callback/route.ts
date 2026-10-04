import { NextRequest, NextResponse } from "next/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github";
import {
  createSession,
  getOrCreateSessionId,
  attachSessionCookie,
} from "@/lib/session";

export const runtime = "nodejs";

async function fetchGitHubEmail(token: string): Promise<string | null> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "llmscore",
  };
  try {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified);
      if (primary) return primary.email;
    }
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (userRes.ok) {
      const user = (await userRes.json()) as { email?: string | null };
      if (user.email) return user.email;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("gh_oauth_state")?.value;
  const origin = req.nextUrl.origin;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/?github=error`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID_PLACEHOLDER";
  const clientSecret =
    process.env.GITHUB_CLIENT_SECRET || "GITHUB_CLIENT_SECRET_PLACEHOLDER";

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/auth/github/callback`,
      }),
    });
    const data = (await tokenRes.json()) as { access_token?: string };
    if (!data.access_token) {
      return NextResponse.redirect(`${origin}/?github=error`);
    }

    const res = NextResponse.redirect(`${origin}/?github=connected`);
    res.cookies.set(GITHUB_TOKEN_COOKIE, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.delete("gh_oauth_state");

    // Also sign the user in to the app itself.
    const email = await fetchGitHubEmail(data.access_token);
    if (email) {
      const { sessionId } = getOrCreateSessionId(req);
      const boundId = await createSession(email, { sessionId, provider: "github" });
      attachSessionCookie(res, boundId);
    }

    return res;
  } catch {
    return NextResponse.redirect(`${origin}/?github=error`);
  }
}
